import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, deleteDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DataModal from '../../../components/dataModal/DataModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPen, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import './Forms.css';

function Forms() {
    const { t } = useTranslation();
    const [forms, setForms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        identificator: '',
        name: '',
        subject: '',
        estado: 'Activo',
        timeLimit: '0',
    });

    const navigate = useNavigate();

    const fetchForms = useCallback(async () => {
        try {
            const formsSnapshot = await getDocs(collection(db, "forms"));
            const formsList = formsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setForms(formsList);
        } catch (error) {
            console.error("Error fetching forms: ", error);
        }
    }, []);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const filteredForms = useMemo(() => {
        return forms.filter(form =>
            form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.subject?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [forms, searchTerm]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openModal = (form = null) => {
        if (form) {
            setFormData({
                identificator: form.id,
                name: form.name,
                subject: form.subject || '',
                estado: form.estado || 'Activo',
                timeLimit: form.timeLimit?.toString() || '0',
            });
        } else {
            setFormData({
                identificator: '',
                name: '',
                subject: '',
                estado: 'Activo',
                timeLimit: '0',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'timeLimit') {
            if (/^\d*$/.test(value)) {
                setFormData(prevState => ({
                    ...prevState,
                    [name]: value
                }));
            } else {
                alert('El tiempo debe ser un número entero positivo.');
            }
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const timeLimit = formData.timeLimit.trim() === '' ? 0 : parseInt(formData.timeLimit, 10);

        try {
            const dataToSave = {
                name: formData.name.trim(),
                subject: formData.subject.trim(),
                estado: formData.estado,
                timeLimit: isNaN(timeLimit) ? 0 : timeLimit,
            };

            if (formData.identificator) { // Cambié de formData.id a formData.identificator
                const formRef = doc(db, "forms", formData.identificator);
                await updateDoc(formRef, dataToSave);
                console.log("Formulario actualizado correctamente:", dataToSave);
            } else {
                const docRef = await addDoc(collection(db, "forms"), dataToSave);
                console.log("Formulario creado con ID:", docRef.id);
            }

            fetchForms();
            setShowModal(false);
        } catch (error) {
            console.error("Error al guardar el formulario:", error);
            alert(`Error al guardar el formulario: ${error.message}`);
        }
    };

    const copyToClipboard = (id) => {
        const url = `${window.location.origin}/forms/response/${id}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Enlace copiado al portapapeles');
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    const deleteForm = async (formId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este formulario? Esta acción no se puede deshacer.')) {
            try {
                await deleteDoc(doc(db, "forms", formId));
                fetchForms();
            } catch (error) {
                console.error("Error deleting form: ", error);
            }
        }
    };

    return (
        <RequireAuth>
            <h1>{t('forms.title')}</h1>
            <DataContainer
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                openModal={() => openModal()}
                fetchFunction={fetchForms}
            >
                {filteredForms.map(form => (
                    <div key={form.id} className="item-container" onClick={() => openModal(form)}>
                        <div className="item-data">
                            <p className="item-title">{form.name}</p>
                            <p className="item-detail"><strong>Asignatura:</strong> {form.subject || 'N/A'}</p>
                            <p className="item-detail"><strong>Estado:</strong> {form.estado}</p>
                        </div>
                        <div className="form-actions">
                            <div className="icon-wrapper">
                                <FontAwesomeIcon
                                    icon={faEye}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/platform/forms/responses/${form.id}`);
                                    }}
                                    className="form-action-icon"
                                    title={t('forms.viewResponses')}
                                />
                            </div>
                            <div className="icon-wrapper">
                                <FontAwesomeIcon
                                    icon={faPen}
                                    onClick={(e) => { e.stopPropagation(); navigate(`/platform/forms/edit/${form.id}`); }}
                                    className="form-action-icon"
                                    title={t('forms.edit')}
                                />
                            </div>
                            <div className="icon-wrapper">
                                <FontAwesomeIcon
                                    icon={faLink}
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(form.id); }}
                                    className="form-action-icon"
                                    title={t('forms.copyLink')}
                                />
                            </div>
                            <div className="icon-wrapper">
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteForm(form.id);
                                    }}
                                    className="form-action-icon"
                                    title={t('forms.delete')}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </DataContainer>

            {showModal && (
                <DataModal
                    showModal={showModal}
                    closeModal={closeModal}
                    formData={formData}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    title={formData.identificator ? t('forms.edit') : t('forms.add')}
                    fields={[
                        { label: t('formFields.name'), name: 'name', type: 'text', placeholder: t('formFields.formNamePlaceholder') },
                        { label: t('formFields.subject'), name: 'subject', type: 'text', placeholder: t('formFields.subject') },
                        {
                            label: t('formFields.status'), name: 'estado', type: 'select', options: [
                                { value: 'Activo', label: t('formFields.active') },
                                { value: 'Inactivo', label: t('formFields.inactive') },
                            ]
                        },
                        {
                            label: t('formFields.timeLimit'),
                            name: 'timeLimit',
                            type: 'text',
                            placeholder: t('formFields.timeLimitPlaceholder'),
                        },
                    ]}
                />
            )}
        </RequireAuth>
    );
}

export default Forms;
