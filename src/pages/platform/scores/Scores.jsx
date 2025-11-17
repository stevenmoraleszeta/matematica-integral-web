import './Scores.css';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import useFetchData from '../../../hooks/useFetchData';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal';
import StudentsListModal from '../../../components/studentsListModal/StudentsListModal';

function Scores() {
    const { t } = useTranslation();
    const { data: groups } = useFetchData("groups");
    const { data: students } = useFetchData("students");
    const [allScores, setAllScores] = useState([]);
    const [filteredScores, setFilteredScores] = useState([]);
    const [studentsInGroup, setStudentsInGroup] = useState([]);
    const [formData, setFormData] = useState({
        identificator: '',
        date: '',
        groupId: '',
        scores: {},
        name: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [showScoresModal, setShowScoresModal] = useState(false);
    const [editingScore, setEditingScore] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupNames, setGroupNames] = useState({});

    const fetchScores = async () => {
        try {
            const scoresSnapshot = await getDocs(collection(db, "scores"));
            const scoresList = scoresSnapshot.docs.map(doc => {
                const scoreData = doc.data();
                return {
                    id: doc.id,
                    ...scoreData,
                    groupName: groupNames[scoreData.groupId] || t('groups.notFound')
                };
            });
            setAllScores(scoresList);
        } catch (error) {
            console.error("Error fetching scores: ", error);
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
            const studentsList = students.filter(student => student.groupId === groupId);
            setStudentsInGroup(studentsList);
            const initialScores = studentsList.reduce((acc, student) => {
                acc[student.id] = '';
                return acc;
            }, {});
            setFormData(prevState => ({ ...prevState, scores: initialScores }));
        } catch (error) {
            console.error("Error fetching students: ", error);
        }
    };

    useEffect(() => {
        fetchScores();
        fetchGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const filteredList = allScores.filter(score => {
            if (!score) return false;
            return (
                (score.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (score.date || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (score.groupName || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        setFilteredScores(filteredList);
    }, [searchTerm, allScores]);

    const handleGroupChange = async (e) => {
        const groupId = e.target.value;
        setFormData(prevState => ({ ...prevState, groupId }));
        await fetchStudentsForGroup(groupId);
    };

    const handleScoreChange = (studentId, score) => {
        setFormData(prevState => ({
            ...prevState,
            scores: {
                ...prevState.scores,
                [studentId]: score
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
            if (editingScore) {
                const scoreRef = doc(db, "scores", editingScore.id);
                await updateDoc(scoreRef, formData);
                console.log("Document updated with ID: ", editingScore.id);
            } else {
                const docRef = await addDoc(collection(db, "scores"), formData);
                console.log("Document written with ID: ", docRef.id);
            }
            await fetchScores();
            setFormData({
                identificator: '',
                date: '',
                groupId: '',
                scores: {},
                name: ''
            });
            setEditingScore(null);
            setShowModal(false);
        } catch (e) {
            console.error("Error adding/updating document: ", e);
        }
    };

    const openModal = () => {
        setFormData({
            identificator: '',
            date: '',
            groupId: '',
            scores: {},
            name: ''
        });
        setEditingScore(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingScore(null);
    };

    const closeScoresModal = () => {
        setShowScoresModal(false);
        setEditingScore(null);
    };

    const editScore = async (score) => {
        setFormData({
            identificator: score.id || '',
            date: score.date || '',
            groupId: score.groupId || '',
            scores: score.scores || {},
            name: score.name || ''
        });
        setEditingScore(score);
        await fetchStudentsForGroup(score.groupId); // Fetch students for the current group
        setShowModal(true);
    };

    const deleteScore = async (scoreId) => {
        try {
            await deleteDoc(doc(db, "scores", scoreId));
            console.log("Document successfully deleted!");
            await fetchScores();
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAssignScores = async (score) => {
        if (!score.groupId) {
            alert("Por favor, seleccione un grupo antes de modificar las calificaciones.");
            return;
        }
    
        setEditingScore(score);
        await fetchStudentsForGroup(score.groupId);
        setFormData(prevState => ({
            ...prevState,
            scores: score.scores || {} 
        }));
        setShowScoresModal(true);
    };

    const handleSaveScores = async () => {
        if (editingScore) {
            try {
                const scoreRef = doc(db, "scores", editingScore.id);
                await updateDoc(scoreRef, { scores: formData.scores });
                console.log("Calificaciones actualizadas en el documento con ID: ", editingScore.id);
                await fetchScores(); // Actualiza la lista de calificaciones después de guardar
            } catch (e) {
                console.error("Error al actualizar las calificaciones: ", e);
            }
        }
        setShowScoresModal(false);
    };

    return (
        <RequireAuth>
            <h1>{t('scores.title')}</h1>
            <DataContainer searchTerm={searchTerm} handleSearch={handleSearch} openModal={openModal} fetchFunction={fetchScores} dbCollection="scores">
                {filteredScores.map(score => (
                    <div key={score.id} className="item-container">
                        <div className="item-data" onClick={() => editScore(score)}>
                            <p className="item-title">{score.name}</p>
                            <p className="item-detail">{groupNames[score.groupId] || t('groups.notFound')}</p>
                            <p className="item-detail">{score.date}</p>
                        </div>
                        <div className="item-actions">
                            <button className="item-action-button" onClick={() => handleAssignScores(score)}>{t('buttons.modifyScores')}</button>
                            <DeleteIcon onClick={() => deleteScore(score.id)} />
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
                    { label: t('formFields.name'), name: 'name', type: 'text' },
                    { label: t('formFields.date'), name: 'date', type: 'date' },
                    {
                        label: t('formFields.group'),
                        name: 'groupId',
                        type: 'select',
                        options: groups.map(group => ({ value: group.id, label: group.name })),
                        onChange: handleGroupChange 
                    }
                ]}
                title={editingScore ? t('scores.edit') : t('scores.add')}
            />
            <StudentsListModal
                showModal={showScoresModal}
                closeModal={closeScoresModal}
                students={studentsInGroup}
                scores={formData.scores}
                handleScoreChange={handleScoreChange}
                handleSave={handleSaveScores}
                mode="scores" 
            />
        </RequireAuth>
    );
}

export default Scores;
