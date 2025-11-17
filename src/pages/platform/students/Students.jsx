import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import useFetchData from '../../../hooks/useFetchData';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';
import SecureDeleteConfirm from '../../../components/SecureDeleteConfirm/SecureDeleteConfirm';
import useSecurity from '../../../hooks/useSecurity';

function Students() {
    const { t } = useTranslation();
    const { secureCreate, secureUpdate, secureDelete, validateEmailWithMessage, validatePhoneWithMessage } = useSecurity();
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
    const [deleteConfirm, setDeleteConfirm] = useState(null);

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
    }, [t]);

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

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const { phone, parentPhone, email, parentEmail } = formData;

        // Validar emails
        const emailError = validateEmailWithMessage(email, 'Email del estudiante');
        if (emailError) {
            alert(emailError);
            return;
        }
        const parentEmailError = validateEmailWithMessage(parentEmail, 'Email del encargado');
        if (parentEmailError) {
            alert(parentEmailError);
            return;
        }

        // Validar teléfonos
        const phoneError = validatePhoneWithMessage(phone, 'Teléfono del estudiante');
        if (phoneError) {
            alert(phoneError);
            return;
        }
        const parentPhoneError = validatePhoneWithMessage(parentPhone, 'Teléfono del encargado');
        if (parentPhoneError) {
            alert(parentPhoneError);
            return;
        }

        try {
            if (editingStudent) {
                await secureUpdate(
                    formData,
                    'students',
                    async (sanitizedData) => {
                        const studentRef = doc(db, "students", editingStudent.id);
                        await updateDoc(studentRef, sanitizedData);
                        console.log("Document updated with ID: ", editingStudent.id);
                    }
                );
            } else {
                await secureCreate(
                    formData,
                    'students',
                    async (sanitizedData) => {
                        const docRef = await addDoc(collection(db, "students"), sanitizedData);
                        console.log("Document written with ID: ", docRef.id);
                        return docRef;
                    }
                );
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
            alert(`Error: ${e.message}`);
        }
    }, [editingStudent, formData, secureCreate, secureUpdate, validateEmailWithMessage, validatePhoneWithMessage, fetchStudentsWithGroupNames]);

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

    const deleteStudent = useCallback((studentId) => {
        const student = allStudents.find(s => s.id === studentId);
        setDeleteConfirm({ id: studentId, name: student?.name || 'este estudiante' });
    }, [allStudents]);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deleteConfirm) return;
        
        try {
            await secureDelete(
                deleteConfirm.name,
                async () => {
                    await deleteDoc(doc(db, "students", deleteConfirm.id));
                    console.log("Document successfully deleted!");
                    await fetchStudentsWithGroupNames(); // Refresh student data after delete
                }
            );
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert(`Error al eliminar: ${error.message}`);
            setDeleteConfirm(null);
        }
    }, [deleteConfirm, secureDelete, fetchStudentsWithGroupNames]);

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
    ], [groups, t]);

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

            {deleteConfirm && (
                <SecureDeleteConfirm
                    itemName={deleteConfirm.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteConfirm(null)}
                    message={t('students.deleteConfirm')}
                />
            )}
        </RequireAuth>
    );
}

export default Students;
