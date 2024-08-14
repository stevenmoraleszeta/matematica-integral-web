import React, { useState, useEffect } from 'react';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import useFetchData from '../../../hooks/useFetchData';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';
import StudentsListModal from '../../../components/studentsListModal/StudentsListModal';

function Homeworks() {
    const groups = useFetchData("groups");
    const teachers = useFetchData("teachers");
    const [allHomeworks, setHomeworks] = useState([]);
    const [filteredHomeworks, setFilteredHomeworks] = useState([]);
    const [studentsInGroup, setStudentsInGroup] = useState([]);
    const [formData, setFormData] = useState({
        identificator: '',
        startDate: '',
        submitDate: '',
        groupId: '',
        scores: {},
        teacherId: '',
        name: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [showScoresModal, setShowScoresModal] = useState(false);
    const [editingHomework, setEditingHomework] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupNames, setGroupNames] = useState({});

    const fetchHomeworks = async () => {
        try {
            const homeworksSnapshot = await getDocs(collection(db, "homeworks"));
            const homeworksList = homeworksSnapshot.docs.map(doc => {
                const homeworkData = doc.data();
                return {
                    id: doc.id,
                    ...homeworkData,
                    groupName: groupNames[homeworkData.groupId] || 'Grupo no encontrado'
                };
            });
            setHomeworks(homeworksList);
        } catch (error) {
            console.error("Error fetching homeworks: ", error);
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
            setStudentsInGroup(studentsList);
            const initialScores = studentsList.reduce((acc, student) => {
                acc[student.id] = "notSubmited";
                return acc;
            }, {});
            setFormData(prevState => ({ ...prevState, scores: initialScores }));
        } catch (error) {
            console.error("Error fetching students: ", error);
        }
    };

    useEffect(() => {
        fetchHomeworks();
        fetchGroups();
    }, []);

    useEffect(() => {
        const filteredList = allHomeworks.filter(homework => {
            if (!homework) return false;
            return (
                (homework.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (homework.submitDate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (homework.startDate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (homework.teacherId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (homework.groupName || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredHomeworks(filteredList);
    }, [searchTerm, allHomeworks]);

    const handleGroupChange = async (e) => {
        const groupId = e.target.value;
        setFormData(prevState => ({ ...prevState, groupId }));
        await fetchStudentsForGroup(groupId);
    };

    const handleScoresChange = (studentId, status) => {
        setFormData(prevState => ({
            ...prevState,
            scores: {
                ...prevState.scores,
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
            if (editingHomework) {
                const homeworkRef = doc(db, "homeworks", editingHomework.id);
                await updateDoc(homeworkRef, formData);
                console.log("Document updated with ID: ", editingHomework.id);
            } else {
                const docRef = await addDoc(collection(db, "homeworks"), formData);
                console.log("Document written with ID: ", docRef.id);
            }
            await fetchHomeworks();
            setFormData({
                identificator: '',
                startDate: '',
                submitDate: '',
                groupId: '',
                scores: {},
                teacherId: '',
                name: ''
            });
            setEditingHomework(null);
            setShowModal(false);
        } catch (e) {
            console.error("Error adding/updating document: ", e);
        }
    };

    const openModal = () => {
        setFormData({
            identificator: '',
            startDate: '',
            submitDate: '',
            groupId: '',
            scores: {},
            teacherId: '',
            name: ''
        });
        setEditingHomework(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingHomework(null);
    };

    const closeScoresModal = () => {
        setShowScoresModal(false);
        setEditingHomework(null);
    };

    const editHomework = async (homework) => {
        setFormData({
            identificator: homework.id || '',
            startDate: homework.startDate || '',
            submitDate: homework.submitDate || '',
            groupId: homework.groupId || '',
            scores: homework.scores || {},
            teacherId: homework.teacherId || '',
            name: homework.name || ''
        });
        setEditingHomework(homework);
        await fetchStudentsForGroup(homework.groupId); // Fetch students for the current group
        setShowModal(true);
    };

    const deleteHomework = async (homeworkId) => {
        try {
            await deleteDoc(doc(db, "homeworks", homeworkId));
            console.log("Document successfully deleted!");
            await fetchHomeworks();
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAssignScores = async (homework) => {
        if (!homework.groupId) {
            alert("Por favor, seleccione un grupo antes de modificar la asistencia.");
            return;
        }

        setEditingHomework(homework);
        await fetchStudentsForGroup(homework.groupId);
        setFormData(prevState => ({
            ...prevState,
            scores: homework.scores || {}
        }));
        setShowScoresModal(true);
    };


    const handleSaveScores = async () => {
        if (editingHomework) {
            try {
                const homeworkRef = doc(db, "homeworks", editingHomework.id);
                await updateDoc(homeworkRef, { scores: formData.scores });
                console.log("Asistencia actualizada en el documento con ID: ", editingHomework.id);
                await fetchHomeworks(); // Actualiza la lista de sesiones después de guardar
            } catch (e) {
                console.error("Error al actualizar la asistencia: ", e);
            }
        }
        setShowScoresModal(false);
    };

    return (
        <RequireAuth>
            <DataContainer searchTerm={searchTerm} handleSearch={handleSearch} openModal={openModal} fetchFunction={fetchHomeworks} dbCollection="homeworks">
                {filteredHomeworks.map(homework => (
                    <div key={homework.id} className="item-container">
                        <div className="item-data" onClick={() => editHomework(homework)}>
                            <p className="item-title">{homework.name}</p>
                            <p className="item-detail">{groupNames[homework.groupId] || 'Grupo no encontrado'}</p>
                            <p className="item-detail">{homework.date}</p>
                        </div>
                        <div className="item-actions">
                            <button className="item-action-button" onClick={() => handleAssignScores(homework)}>Modificar asistencia</button>
                            <DeleteIcon onClick={() => deleteHomework(homework.id)} />
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
                    { label: 'Fecha Inicio', name: 'startDate', type: 'date' },
                    { label: 'Fecha Entrega', name: 'submitDate', type: 'date' },
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
                title={editingHomework ? 'Editar Sesión' : 'Agregar Sesión'}
            />
            <StudentsListModal
                showModal={showScoresModal}
                closeModal={closeScoresModal}
                students={studentsInGroup}
                attendance={formData.scores}
                handleAttendanceChange={handleScoresChange}
                handleSave={handleSaveScores}
                mode="submited"
            />
        </RequireAuth>
    );
}

export default Homeworks;
