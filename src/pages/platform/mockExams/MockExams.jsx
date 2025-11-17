import { useState, useEffect } from 'react';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import useFetchData from '../../../hooks/useFetchData';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';
import StudentsListModal from '../../../components/studentsListModal/StudentsListModal';

function MockExams() {
    const { data: students } = useFetchData("students");
    const [allMockExams, setAllMockExams] = useState([]);
    const [filteredMockExams, setFilteredMockExams] = useState([]);
    const [formData, setFormData] = useState({
        identificator: '',
        startDate: '',
        endDate: '',
        attendance: {},
        name: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [editingMockExam, setEditingMockExam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMockExams = async () => {
        try {
            const mockExamsSnapshot = await getDocs(collection(db, "mockExams"));
            const mockExamsList = mockExamsSnapshot.docs.map(doc => {
                const mockExamData = doc.data();
                return {
                    id: doc.id,
                    ...mockExamData
                };
            });
            setAllMockExams(mockExamsList);
        } catch (error) {
            console.error("Error fetching mock exams: ", error);
        }
    };



    useEffect(() => {
        fetchMockExams();
    }, []);

    useEffect(() => {
        const filteredList = allMockExams.filter(mockExam => {
            if (!mockExam) return false;
            return (
                (mockExam.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (mockExam.startDate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (mockExam.endDate || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredMockExams(filteredList);
    }, [searchTerm, allMockExams]);

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
            if (editingMockExam) {
                const mockExamRef = doc(db, "mockExams", editingMockExam.id);
                await updateDoc(mockExamRef, formData);
                console.log("Document updated with ID: ", editingMockExam.id);
            } else {
                const docRef = await addDoc(collection(db, "mockExams"), formData);
                console.log("Document written with ID: ", docRef.id);
            }
            await fetchMockExams();
            setFormData({
                identificator: '',
                startDate: '',
                endDate: '',
                attendance: {},
                name: ''
            });
            setEditingMockExam(null);
            setShowModal(false);
        } catch (e) {
            console.error("Error adding/updating document: ", e);
        }
    };

    const openModal = () => {
        setFormData({
            identificator: '',
            startDate: '',
            endDate: '',
            attendance: {},
            name: ''
        });
        setEditingMockExam(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingMockExam(null);
    };

    const closeAttendanceModal = () => {
        setShowAttendanceModal(false);
        setEditingMockExam(null);
    };

    const editMockExam = async (mockExam) => {
        setFormData({
            identificator: mockExam.id || '',
            startDate: mockExam.startDate || '',
            endDate: mockExam.endDate || '',
            attendance: mockExam.attendance || {},
            name: mockExam.name || ''
        });
        setEditingMockExam(mockExam);
        setShowModal(true);
    };

    const deleteMockExam = async (mockExamId) => {
        try {
            await deleteDoc(doc(db, "mockExams", mockExamId));
            console.log("Document successfully deleted!");
            await fetchMockExams();
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAssignAttendance = async (mockExam) => {
        setEditingMockExam(mockExam);
        setFormData(prevState => ({
            ...prevState,
            attendance: mockExam.attendance || {}
        }));
        setShowAttendanceModal(true);
    };


    const handleSaveAttendance = async () => {
        if (editingMockExam) {
            try {
                const mockExamRef = doc(db, "mockExams", editingMockExam.id);
                await updateDoc(mockExamRef, { attendance: formData.attendance });
                console.log("Asistencia actualizada en el documento con ID: ", editingMockExam.id);
                await fetchMockExams(); // Actualiza la lista de sesiones después de guardar
            } catch (e) {
                console.error("Error al actualizar la asistencia: ", e);
            }
        }
        setShowAttendanceModal(false);
    };

    return (
        <RequireAuth>
            <DataContainer searchTerm={searchTerm} handleSearch={handleSearch} openModal={openModal} fetchFunction={fetchMockExams} dbCollection="mockExams">
                {filteredMockExams.map(mockExam => (
                    <div key={mockExam.id} className="item-container">
                        <div className="item-data" onClick={() => editMockExam(mockExam)}>
                            <p className="item-title">{mockExam.name}</p>
                            <p className="item-detail">{mockExam.startDate}/{mockExam.endDate}</p>
                        </div>
                        <div className="item-actions">
                            <button className="item-action-button" onClick={() => handleAssignAttendance(mockExam)}>Modificar asistencia</button>
                            <DeleteIcon onClick={() => deleteMockExam(mockExam.id)} />
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
                    { label: 'Fecha Final', name: 'endDate', type: 'date'}
                ]}
                title={editingMockExam ? 'Editar Simulacro' : 'Agregar Simulacro'}
            />
            <StudentsListModal
                showModal={showAttendanceModal}
                closeModal={closeAttendanceModal}
                students={students}
                attendance={formData.attendance}
                handleAttendanceChange={handleAttendanceChange}
                handleSave={handleSaveAttendance}
                mode="attendance"
            />
        </RequireAuth>
    );
}

export default MockExams;
