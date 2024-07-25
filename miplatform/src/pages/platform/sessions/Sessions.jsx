import './Sessions.css';
import React, { useState, useEffect } from 'react';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import useFetchData from '../../../hooks/useFetchData';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';
import AttendanceModal from '../../../components/attendanceModal/AttendanceModal';

function Sessions() {
    const groups = useFetchData("groups");
    const teachers = useFetchData("teachers");
    const [allSessions, setAllSessions] = useState([]); 
    const [filteredSessions, setFilteredSessions] = useState([]); 
    const [studentsInGroup, setStudentsInGroup] = useState([]); 
    const [formData, setFormData] = useState({
        date: '',
        groupId: '',
        attendance: {}, 
        teacherId: '',
        name: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupNames, setGroupNames] = useState({}); 

    const fetchSessions = async () => {
        try {
            const sessionsSnapshot = await getDocs(collection(db, "sessions"));
            const sessionsList = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllSessions(sessionsList); 
        } catch (error) {
            console.error("Error fetching sessions: ", error);
        }
    };

    const fetchGroups = async () => {
        try {
            const groupsSnapshot = await getDocs(collection(db, "groups"));
            const groupsList = groupsSnapshot.docs.reduce((acc, doc) => {
                const groupData = doc.data();
                acc[doc.id] = groupData.name; 
                return acc;
            }, {});
            setGroupNames(groupsList); 
        } catch (error) {
            console.error("Error fetching groups: ", error);
        }
    };

    const fetchStudentsForGroup = async (groupId) => {
        try {
            const studentsSnapshot = await getDocs(collection(db, "students"));
            const studentsList = studentsSnapshot.docs
                .filter(doc => doc.data().groupId === groupId)
                .map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Students for group:", studentsList); // Debug
            setStudentsInGroup(studentsList);
            const initialAttendance = studentsList.reduce((acc, student) => {
                acc[student.id] = "absent"; 
                return acc;
            }, {});
            setFormData(prevState => ({ ...prevState, attendance: initialAttendance }));
        } catch (error) {
            console.error("Error fetching students: ", error);
        }
    };

    useEffect(() => {
        fetchSessions();
        fetchGroups();
    }, []);

    useEffect(() => {
        const filteredList = allSessions.filter(session => {
            if (!session) return false;
            return (
                (session.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (session.date || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (session.teacherId || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredSessions(filteredList);
    }, [searchTerm, allSessions]);

    const handleGroupChange = async (e) => {
        const groupId = e.target.value;
        console.log("ID del grupo seleccionado: " + groupId); // Debug
        setFormData(prevState => ({ ...prevState, groupId }));
        await fetchStudentsForGroup(groupId);
    };

    const handleAttendanceChange = (studentId, status) => {
        setFormData(prevState => ({
            ...prevState,
            attendance: {
                ...prevState.attendance,
                [studentId]: status
            }
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSession) {
                const sessionRef = doc(db, "sessions", editingSession.id);
                await updateDoc(sessionRef, formData);
                console.log("Document updated with ID: ", editingSession.id);
            } else {
                const docRef = await addDoc(collection(db, "sessions"), formData);
                console.log("Document written with ID: ", docRef.id);
            }
            await fetchSessions(); 
            setFormData({
                date: '',
                groupId: '',
                attendance: {},
                teacherId: '',
                name: ''
            });
            setEditingSession(null);
            setShowModal(false);
        } catch (e) {
            console.error("Error adding/updating document: ", e);
        }
    };

    const openModal = () => {
        setFormData({
            date: '',
            groupId: '',
            attendance: {},
            teacherId: '',
            name: ''
        });
        setEditingSession(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSession(null);
    };

    const closeAttendanceModal = () => {
        setShowAttendanceModal(false);
        setEditingSession(null);
    };

    const editSession = async (session) => {
        setFormData({
            date: session.date || '',
            groupId: session.groupId || '',
            attendance: session.attendance || {},
            teacherId: session.teacherId || '',
            name: session.name || ''
        });
        setEditingSession(session);
        await fetchStudentsForGroup(session.groupId);
        setShowModal(true);
    };

    const deleteSession = async (sessionId) => {
        try {
            await deleteDoc(doc(db, "sessions", sessionId));
            console.log("Document successfully deleted!");
            await fetchSessions(); 
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAssignAttendance = (session) => {
        console.log("Session for attendance:", session); // Debug
        if (!session.groupId) {
            alert("Por favor, seleccione un grupo antes de modificar la asistencia.");
            return;
        }

        setEditingSession(session);
        setShowAttendanceModal(true);
    };

    return (
        <RequireAuth>
            <DataContainer searchTerm={searchTerm} handleSearch={handleSearch} openModal={openModal}>
                {filteredSessions.map(session => (
                    <div key={session.id} className="item-container">
                        <div className="item-data" onClick={() => editSession(session)}>
                            <p className="item-title">{session.name}</p>
                            <p className="item-detail">{groupNames[session.groupId] || 'Grupo no encontrado'}</p>
                            <p className="item-detail">{session.date}</p>
                        </div>
                        <div className="item-actions">
                            <button className="modify-attendance-button" onClick={() => handleAssignAttendance(session)}>Modificar asistencia</button>
                            <DeleteIcon onClick={() => deleteSession(session.id)} />
                        </div>
                    </div>
                ))}
            </DataContainer>

            <DataModal
                showModal={showModal}
                closeModal={closeModal}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                fields={[
                    { label: 'Nombre', name: 'name', type: 'text' },
                    { label: 'Fecha', name: 'date', type: 'date' },
                    {
                        label: 'Grupo',
                        name: 'groupId',
                        type: 'select',
                        options: groups.map(group => ({ value: group.id, label: group.name })),
                        onChange: handleGroupChange 
                    },
                    {
                        label: 'Profesor',
                        name: 'teacherId',
                        type: 'select',
                        options: teachers.map(teacher => ({ value: teacher.id, label: teacher.name }))
                    }
                ]}
            />
            <AttendanceModal
                showModal={showAttendanceModal}
                closeModal={closeAttendanceModal}
                students={studentsInGroup}
                attendance={formData.attendance}
                handleAttendanceChange={handleAttendanceChange}
            />
        </RequireAuth>
    );
}

export default Sessions;
