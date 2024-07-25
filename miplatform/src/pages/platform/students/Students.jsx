import React, { useState, useEffect } from 'react';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import useFetchData from '../../../hooks/useFetchData';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';

function Students() {
    const students = useFetchData("students");
    const groups = useFetchData("groups");

    const [allStudents, setAllStudents] = useState([]); // Estado para todos los estudiantes
    const [filteredStudents, setFilteredStudents] = useState([]); // Estado para los estudiantes filtrados
    const [formData, setFormData] = useState({
        email: '',
        parentEmail: '',
        name: '',
        parentName: '',
        phone: '',
        parentPhone: '',
        groupId: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch students with group names
    const fetchStudentsWithGroupNames = async () => {
        try {
            const groupsSnapshot = await getDocs(collection(db, "groups"));
            const groupsMap = {};
            groupsSnapshot.forEach(doc => {
                const groupData = doc.data();
                groupsMap[doc.id] = groupData.name;
            });

            const studentsSnapshot = await getDocs(collection(db, "students"));
            const studentsWithGroupNames = studentsSnapshot.docs.map(doc => {
                const studentData = doc.data();
                return {
                    id: doc.id,
                    ...studentData,
                    groupName: groupsMap[studentData.groupId] || 'Sin grupo'
                };
            });

            setAllStudents(studentsWithGroupNames); // Guardar todos los estudiantes
        } catch (error) {
            console.error("Error fetching students or groups: ", error);
        }
    };

    useEffect(() => {
        fetchStudentsWithGroupNames();
    }, []);

    useEffect(() => {
        // Aplicar filtro basado en searchTerm
        const filteredList = allStudents.filter(student => {
            if (!student) return false;
            return (
                (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.parentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.parentEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.parentPhone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.groupName || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredStudents(filteredList);
    }, [searchTerm, allStudents]);

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\+\d{10,}$/; // Regex para número de teléfono con código de país
        return phoneRegex.test(phoneNumber);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { phone, parentPhone } = formData;

        if (phone && !validatePhoneNumber(phone)) {
            alert('Número de teléfono inválido. Asegúrate de incluir el código de país.');
            return;
        }
        if (parentPhone && !validatePhoneNumber(parentPhone)) {
            alert('Número de teléfono del encargado inválido. Asegúrate de incluir el código de país.');
            return;
        }

        try {
            if (editingStudent) {
                const studentRef = doc(db, "students", editingStudent.id);
                await updateDoc(studentRef, formData);
                console.log("Document updated with ID: ", editingStudent.id);
            } else {
                const docRef = await addDoc(collection(db, "students"), formData);
                console.log("Document written with ID: ", docRef.id);
            }

            await fetchStudentsWithGroupNames(); // Refresh student data after submit
            setFormData({
                email: '',
                parentEmail: '',
                name: '',
                parentName: '',
                phone: '',
                parentPhone: '',
                groupId: ''
            });
            setEditingStudent(null);
            setShowModal(false);
        } catch (e) {
            console.error("Error adding/updating document: ", e);
        }
    };

    const openModal = () => {
        setFormData({
            email: '',
            parentEmail: '',
            name: '',
            parentName: '',
            phone: '',
            parentPhone: '',
            groupId: ''
        });
        setEditingStudent(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingStudent(null);
    };

    const editStudent = (student) => {
        setFormData({
            email: student.email || '',
            parentEmail: student.parentEmail || '',
            name: student.name || '',
            parentName: student.parentName || '',
            phone: student.phone || '',
            parentPhone: student.parentPhone || '',
            groupId: student.groupId || ''
        });
        setEditingStudent(student);
        setShowModal(true);
    };

    const deleteStudent = async (studentId) => {
        try {
            await deleteDoc(doc(db, "students", studentId));
            console.log("Document successfully deleted!");
            await fetchStudentsWithGroupNames(); // Refresh student data after delete
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <RequireAuth>
            <DataContainer searchTerm={searchTerm} handleSearch={handleSearch} openModal={openModal}>
                {filteredStudents.map(student => (
                    <div key={student.id} onClick={() => editStudent(student)} className="item-container">
                        <div className="item-data">
                            <p className="item-title">{student.name}</p>
                            <p className="item-detail">{student.groupName}</p> {/* Mostrar el nombre del grupo */}
                        </div>
                        <DeleteIcon onClick={() => deleteStudent(student.id)} />
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
                    { label: 'Nombre Encargado', name: 'parentName', type: 'text' },
                    { label: 'Correo Encargado', name: 'parentEmail', type: 'email' },
                    { label: 'Teléfono Encargado', name: 'parentPhone', type: 'text' },
                    { label: 'Grupo', name: 'groupId', type: 'select', options: groups.map(group => ({ value: group.id, label: group.name })) }
                ]}
                title={editingStudent ? 'Editar Estudiante' : 'Agregar Estudiante'}
            />
        </RequireAuth>
    );
}

export default Students;
