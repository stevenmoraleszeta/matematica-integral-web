import { useState, useEffect, useMemo, useCallback } from 'react';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import useFetchData from '../../../hooks/useFetchData';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';

function Students() {
    const groups = useFetchData("groups");

    const [allStudents, setAllStudents] = useState([]); // Estado para todos los estudiantes
    const [filteredStudents, setFilteredStudents] = useState([]); // Estado para los estudiantes filtrados
    const [formData, setFormData] = useState({
        identificator: '',
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
    const fetchStudentsWithGroupNames = useCallback(async () => {
        try {
            const [groupsSnapshot, studentsSnapshot] = await Promise.all([
                getDocs(collection(db, "groups")),
                getDocs(collection(db, "students"))
            ]);

            const groupsMap = {};
            groupsSnapshot.forEach(doc => {
                groupsMap[doc.id] = doc.data().name;
            });

            const studentsWithGroupNames = studentsSnapshot.docs.map(doc => {
                const studentData = doc.data();
                return {
                    id: doc.id,
                    ...studentData,
                    groupName: groupsMap[studentData.groupId] || 'Sin grupo'
                };
            });

            setAllStudents(studentsWithGroupNames);
        } catch (error) {
            console.error("Error fetching students or groups:", error);
            alert('Error al cargar los datos. Por favor, recargue la página.');
        }
    }, []);

    useEffect(() => {
        fetchStudentsWithGroupNames();
    }, [fetchStudentsWithGroupNames]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredStudents(allStudents);
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filteredList = allStudents.filter(student => {
            if (!student) return false;

            const searchFields = [
                student.name,
                student.email,
                student.phone,
                student.parentName,
                student.parentEmail,
                student.parentPhone,
                student.groupName
            ];

            return searchFields.some(field => 
                String(field || '').toLowerCase().includes(searchLower)
            );
        });
        setFilteredStudents(filteredList);
    }, [searchTerm, allStudents]);


    const validatePhoneNumber = useCallback((phoneNumber) => {
        if (!phoneNumber) return true; // Permitir vacío
        const phoneRegex = /^\+\d{10,}$/;
        return phoneRegex.test(phoneNumber);
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { phone, parentPhone } = formData;

        if (phone && !validatePhoneNumber(phone)) {
            alert('Número de teléfono inválido. Asegúrate de incluir el código de país (ej: +50612345678).');
            return;
        }
        if (parentPhone && !validatePhoneNumber(parentPhone)) {
            alert('Número de teléfono del encargado inválido. Asegúrate de incluir el código de país (ej: +50612345678).');
            return;
        }

        try {
            if (editingStudent) {
                const studentRef = doc(db, "students", editingStudent.id);
                await updateDoc(studentRef, formData);
            } else {
                await addDoc(collection(db, "students"), formData);
            }

            await fetchStudentsWithGroupNames();
            setFormData({
                identificator: '',
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
        } catch (error) {
            console.error("Error adding/updating document:", error);
            alert('Error al guardar el estudiante. Por favor, intente de nuevo.');
        }
    };

    const openModal = () => {
        setFormData({
            identificator: '',
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
            identificator: student.id || '',
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

    const deleteStudent = useCallback(async (studentId) => {
        try {
            await deleteDoc(doc(db, "students", studentId));
            await fetchStudentsWithGroupNames();
        } catch (error) {
            console.error("Error deleting document:", error);
            alert('Error al eliminar el estudiante. Por favor, intente de nuevo.');
        }
    }, [fetchStudentsWithGroupNames]);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    return (
        <RequireAuth>
            <DataContainer searchTerm={searchTerm} handleSearch={handleSearch} openModal={openModal} fetchFunction={fetchStudentsWithGroupNames} dbCollection="students">
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
