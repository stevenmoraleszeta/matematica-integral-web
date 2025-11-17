import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import useFetchData from '../../../hooks/useFetchData';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';

function Students() {
    const { t } = useTranslation();
    const { data: groups } = useFetchData("groups");

    const [allStudents, setAllStudents] = useState([]);
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
                    groupName: groupsMap[studentData.groupId] || t('noGroup')
                };
            });

            setAllStudents(studentsWithGroupNames);
        } catch (error) {
            console.error("Error fetching students or groups: ", error);
        }
    }, []);

    useEffect(() => {
        fetchStudentsWithGroupNames();
    }, [fetchStudentsWithGroupNames]);

    const filteredStudents = useMemo(() => {
        if (!searchTerm) return allStudents;
        
        const searchLower = searchTerm.toLowerCase();
        return allStudents.filter(student => {
            if (!student) return false;

            return (
                String(student.name || '').toLowerCase().includes(searchLower) ||
                String(student.email || '').toLowerCase().includes(searchLower) ||
                String(student.phone || '').toLowerCase().includes(searchLower) ||
                String(student.parentName || '').toLowerCase().includes(searchLower) ||
                String(student.parentEmail || '').toLowerCase().includes(searchLower) ||
                String(student.parentPhone || '').toLowerCase().includes(searchLower) ||
                String(student.groupName || '').toLowerCase().includes(searchLower)
            );
        });
    }, [searchTerm, allStudents]);


    const validatePhoneNumber = useCallback((phoneNumber) => {
        const phoneRegex = /^\+\d{10,}$/;
        return phoneRegex.test(phoneNumber);
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
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
        } catch (e) {
            console.error("Error adding/updating document: ", e);
        }
    }, [editingStudent, formData, validatePhoneNumber, fetchStudentsWithGroupNames]);

    const openModal = useCallback(() => {
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
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setEditingStudent(null);
    }, []);

    const editStudent = useCallback((student) => {
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
    }, []);

    const deleteStudent = useCallback(async (studentId) => {
        try {
            await deleteDoc(doc(db, "students", studentId));
            console.log("Document successfully deleted!");
            await fetchStudentsWithGroupNames(); // Refresh student data after delete
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    }, [fetchStudentsWithGroupNames]);

    const handleSearch = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    const modalFields = useMemo(() => [
        { label: t('formFields.name'), name: 'name', type: 'text' },
        { label: t('formFields.email'), name: 'email', type: 'email' },
        { label: t('formFields.phone'), name: 'phone', type: 'text' },
        { label: t('formFields.parentName'), name: 'parentName', type: 'text' },
        { label: t('formFields.parentEmail'), name: 'parentEmail', type: 'email' },
        { label: t('formFields.parentPhone'), name: 'parentPhone', type: 'text' },
        { label: t('formFields.group'), name: 'groupId', type: 'select', options: groups.map(group => ({ value: group.id, label: group.name })) }
    ], [groups]);

    return (
        <RequireAuth>
            <h1>{t('students.title')}</h1>
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
                fields={modalFields}
                title={editingStudent ? t('students.edit') : t('students.add')}
            />
        </RequireAuth>
    );
}

export default Students;
