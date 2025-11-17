import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import RequireAuth from '../../../components/RequireAuth';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';
import SecureDeleteConfirm from '../../../components/SecureDeleteConfirm/SecureDeleteConfirm';
import useSecurity from '../../../hooks/useSecurity';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/firebase'; // Asegúrate de que la ruta sea correcta

function Groups() {
    const { t } = useTranslation();
    const { secureCreate, secureUpdate, secureDelete } = useSecurity();
    const [groups, setGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [teacherMap, setTeacherMap] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Custom hook to fetch data
    const fetchData = useCallback(async () => {
        try {
            const groupsCollection = collection(db, "groups");
            const groupsSnapshot = await getDocs(groupsCollection);
            const groupsList = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(groupsList);

            const teachersCollection = collection(db, "teachers");
            const teachersSnapshot = await getDocs(teachersCollection);
            const teachersList = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTeachers(teachersList);

            // Create a map of teacher IDs to names for easy lookup
            const teacherMap = teachersList.reduce((map, teacher) => {
                map[teacher.id] = teacher.name;
                return map;
            }, {});
            setTeacherMap(teacherMap);

        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [filteredGroups, setFilteredGroups] = useState([]); // Estado para los grupos filtrados
    const [formData, setFormData] = useState({
        identificator: '',
        name: '',
        description: '',
        teacherMath: '',
        teacherVerbal: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Inicialmente, los grupos filtrados son todos los grupos
        setFilteredGroups(groups);
    }, [groups]);

    useEffect(() => {
        // Aplicar filtro basado en searchTerm
        const filteredList = groups.filter(group => {
            if (!group) return false;
            const teacherMathName = teacherMap[group.teacherMath] || '';
            const teacherVerbalName = teacherMap[group.teacherVerbal] || '';
            return (
                (group.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (group.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                teacherMathName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                teacherVerbalName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredGroups(filteredList);
    }, [searchTerm, groups, teacherMap]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingGroup) {
                await secureUpdate(
                    formData,
                    'groups',
                    async (sanitizedData) => {
                        const groupRef = doc(db, "groups", editingGroup.id);
                        await updateDoc(groupRef, sanitizedData);
                        console.log("Document updated with ID: ", editingGroup.id);
                    }
                );
            } else {
                await secureCreate(
                    formData,
                    'groups',
                    async (sanitizedData) => {
                        const docRef = await addDoc(collection(db, "groups"), sanitizedData);
                        console.log("Document written with ID: ", docRef.id);
                        return docRef;
                    }
                );
            }

            // Refresh group data after submit
            await fetchData(); // Fetch updated data
            setFormData({
                identificator: '',
                name: '',
                description: '',
                teacherMath: '',
                teacherVerbal: ''
            });
            setEditingGroup(null);
            setShowModal(false);
        } catch (e) {
            console.error("Error adding/updating document: ", e);
            alert(`Error: ${e.message}`);
        }
    };

    const openModal = () => {
        setFormData({
            identificator: '',
            name: '',
            description: '',
            teacherMath: '',
            teacherVerbal: ''
        });
        setEditingGroup(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingGroup(null);
    };

    const editGroup = (group) => {
        setFormData({
            identificator: group.id || '',
            name: group.name || '',
            description: group.description || '',
            teacherMath: group.teacherMath || '',
            teacherVerbal: group.teacherVerbal || ''
        });
        setEditingGroup(group);
        setShowModal(true);
    };

    const deleteGroup = (groupId) => {
        const group = groups.find(g => g.id === groupId);
        setDeleteConfirm({ id: groupId, name: group?.name || 'este grupo' });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        
        try {
            await secureDelete(
                deleteConfirm.name,
                async () => {
                    await deleteDoc(doc(db, "groups", deleteConfirm.id));
                    console.log("Document successfully deleted!");
                    // Refresh group data after delete
                    await fetchData(); // Fetch updated data
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
            <h1>{t('groups.title')}</h1>
            <DataContainer searchTerm={searchTerm} handleSearch={handleSearch} openModal={openModal} fetchFunction={fetchData} dbCollection="groups">
                {filteredGroups.map(group => (
                    <div key={group.id} onClick={() => editGroup(group)} className="item-container">
                        <div className="item-data">
                            <p className="item-title">{group.name}</p>
                            <p className="item-detail">{group.description}</p>
                        </div>
                        <DeleteIcon onClick={() => deleteGroup(group.id)} />
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
                    { label: t('formFields.description'), name: 'description', type: 'text' },
                    {
                        label: t('formFields.mathTeacher'),
                        name: 'teacherMath',
                        type: 'select',
                        options: teachers.map(teacher => ({ value: teacher.id, label: teacher.name }))
                    },
                    {
                        label: t('formFields.verbalTeacher'),
                        name: 'teacherVerbal',
                        type: 'select',
                        options: teachers.map(teacher => ({ value: teacher.id, label: teacher.name }))
                    }
                ]}
                title={editingGroup ? t('groups.edit') : t('groups.add')}
            />

            {deleteConfirm && (
                <SecureDeleteConfirm
                    itemName={deleteConfirm.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteConfirm(null)}
                    message={t('groups.deleteConfirm')}
                />
            )}
        </RequireAuth>
    );
}

export default Groups;
