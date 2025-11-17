import React, { useState, useEffect } from 'react';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';

function Teachers() {
    const [allTeachers, setAllTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [formData, setFormData] = useState({
        identificator: '',
        email: '',
        name: '',
        phone: '',
        subject: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch teachers
    const fetchTeachers = async () => {
        try {
            const teachersSnapshot = await getDocs(collection(db, "teachers"));
            const teachersData = teachersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAllTeachers(teachersData);
        } catch (error) {
            console.error("Error fetching teachers: ", error);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        // Apply filter based on searchTerm
        const filteredList = allTeachers.filter(teacher => {
            if (!teacher) return false;
            return (
                (teacher.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (teacher.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (teacher.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (teacher.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredTeachers(filteredList);
    }, [searchTerm, allTeachers]);

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\+\d{10,}$/; // Regex for phone number with country code
        return phoneRegex.test(phoneNumber);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { phone } = formData;

        if (phone && !validatePhoneNumber(phone)) {
            alert('Número de teléfono inválido. Asegúrate de incluir el código de país.');
            return;
        }

        try {
            if (editingTeacher) {
                const teacherRef = doc(db, "teachers", editingTeacher.id);
                await updateDoc(teacherRef, formData);
                console.log("Document updated with ID: ", editingTeacher.id);
            } else {
                const docRef = await addDoc(collection(db, "teachers"), formData);
                console.log("Document written with ID: ", docRef.id);
            }

            await fetchTeachers(); // Refresh teacher data after submit
            setFormData({
                identificator: '',
                email: '',
                name: '',
                phone: '',
                subject: ''
            });
            setEditingTeacher(null);
            setShowModal(false);
        } catch (e) {
            console.error("Error adding/updating document: ", e);
        }
    };

    const openModal = () => {
        setFormData({
            identificator: '',
            email: '',
            name: '',
            phone: '',
            subject: ''
        });
        setEditingTeacher(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTeacher(null);
    };

    const editTeacher = (teacher) => {
        setFormData({
            identificator: teacher.id || '',
            email: teacher.email || '',
            name: teacher.name || '',
            phone: teacher.phone || '',
            subject: teacher.subject || ''
        });
        setEditingTeacher(teacher);
        setShowModal(true);
    };

    const deleteTeacher = async (teacherId) => {
        try {
            await deleteDoc(doc(db, "teachers", teacherId));
            console.log("Document successfully deleted!");
            await fetchTeachers(); // Refresh teacher data after delete
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <RequireAuth>
            <DataContainer searchTerm={searchTerm} handleSearch={handleSearch} openModal={openModal} fetchFunction={fetchTeachers} dbCollection="teachers">
                {filteredTeachers.map(teacher => (
                    <div key={teacher.id} onClick={() => editTeacher(teacher)} className="item-container">
                        <div className="item-data">
                            <p className="item-title">{teacher.name}</p>
                            <p className="item-detail">{teacher.subject}</p> {/* Mostrar la materia */}
                        </div>
                        <DeleteIcon onClick={() => deleteTeacher(teacher.id)} />
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
                    { label: 'Correo', name: 'email', type: 'email' },
                    { label: 'Teléfono', name: 'phone', type: 'text' },
                    { label: 'Materia', name: 'subject', type: 'text' }
                ]}
                title={editingTeacher ? 'Editar Profesor' : 'Agregar Profesor'}
            />
        </RequireAuth>
    );
}

export default Teachers;
