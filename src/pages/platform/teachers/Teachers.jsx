import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';
import SecureDeleteConfirm from '../../../components/SecureDeleteConfirm/SecureDeleteConfirm';
import useSecurity from '../../../hooks/useSecurity';

function Teachers() {
    const { t } = useTranslation();
    const { secureCreate, secureUpdate, secureDelete, validateEmailWithMessage, validatePhoneWithMessage } = useSecurity();
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
    const [deleteConfirm, setDeleteConfirm] = useState(null);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { phone, email } = formData;

        // Validar email
        const emailError = validateEmailWithMessage(email, 'Email');
        if (emailError) {
            alert(emailError);
            return;
        }

        // Validar teléfono
        const phoneError = validatePhoneWithMessage(phone, 'Teléfono');
        if (phoneError) {
            alert(phoneError);
            return;
        }

        try {
            if (editingTeacher) {
                await secureUpdate(
                    formData,
                    'teachers',
                    async (sanitizedData) => {
                        const teacherRef = doc(db, "teachers", editingTeacher.id);
                        await updateDoc(teacherRef, sanitizedData);
                        console.log("Document updated with ID: ", editingTeacher.id);
                    }
                );
            } else {
                await secureCreate(
                    formData,
                    'teachers',
                    async (sanitizedData) => {
                        const docRef = await addDoc(collection(db, "teachers"), sanitizedData);
                        console.log("Document written with ID: ", docRef.id);
                        return docRef;
                    }
                );
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
            alert(`Error: ${e.message}`);
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

    const deleteTeacher = (teacherId) => {
        const teacher = allTeachers.find(t => t.id === teacherId);
        setDeleteConfirm({ id: teacherId, name: teacher?.name || 'este profesor' });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        
        try {
            await secureDelete(
                deleteConfirm.name,
                async () => {
                    await deleteDoc(doc(db, "teachers", deleteConfirm.id));
                    console.log("Document successfully deleted!");
                    await fetchTeachers(); // Refresh teacher data after delete
                }
            );
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert(`Error al eliminar: ${error.message}`);
            setDeleteConfirm(null);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <RequireAuth>
            <h1>{t('teachers.title')}</h1>
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
                    { label: t('formFields.name'), name: 'name', type: 'text' },
                    { label: t('formFields.email'), name: 'email', type: 'email' },
                    { label: t('formFields.phone'), name: 'phone', type: 'text' },
                    { label: t('formFields.subject'), name: 'subject', type: 'text' }
                ]}
                title={editingTeacher ? t('teachers.edit') : t('teachers.add')}
            />

            {deleteConfirm && (
                <SecureDeleteConfirm
                    itemName={deleteConfirm.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteConfirm(null)}
                    message={t('teachers.deleteConfirm')}
                />
            )}
        </RequireAuth>
    );
}

export default Teachers;
