import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RequireAuth from '../../../components/RequireAuth';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, deleteDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import DataContainer from '../../../components/dataContainer/DataContainer';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import DataModal from '../../../components/dataModal/DataModal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPen } from '@fortawesome/free-solid-svg-icons';

function Forms() {
    const [forms, setForms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false); 
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        subject: '',
        createdAt: '',
        isActive: true,
        timeLimit: 'unlimited',
    });

    const navigate = useNavigate();

    //TODO No se está guardando la información del formulario
    //TODO El campo activo no muestra opciones
    //TODO Fecha de creación debe ser automático y no modificable
    //TODO Lo botones de acciones deben tener hover y estar alineados a la izquierda
    //TODO Debe añadirse tiempo y desactivarse en caso de que así se haya seleccionado
    //TODO Hacer una pregunta obligatoria o no obligatoria
    //TODO Agregar la posibilidad de cargar imagenes en las preguntas
    //TODO Mostrarse una pantalla después de enviar una respuesta
    //TODO Deben poderse ver las respuestas
    // Función optimizada para obtener los formularios con manejo de errores.
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

    // Usa `useEffect` para cargar los formularios una vez montado el componente.
    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    // Función de búsqueda optimizada usando `useMemo` para memorizar los resultados.
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
                id: form.id, 
                name: form.name, 
                subject: form.subject || '', 
                createdAt: form.createdAt || new Date().toISOString().split('T')[0], 
                isActive: form.isActive !== undefined ? form.isActive : true, 
                timeLimit: form.timeLimit || 'unlimited' 
            });
        } else {
            setFormData({
                id: '',
                name: '',
                subject: '',
                createdAt: new Date().toISOString().split('T')[0], 
                isActive: true,
                timeLimit: 'unlimited',
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        try {
            if (formData.id) {
                const formRef = doc(db, "forms", formData.id);
                await updateDoc(formRef, formData);
            } else {
                const docRef = await addDoc(collection(db, "forms"), formData);
                navigate(`/platform/forms/edit/${docRef.id}`);
            }
            fetchForms();
            setShowModal(false);
        } catch (e) {
            console.error("Error saving form: ", e);
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
        try {
            await deleteDoc(doc(db, "forms", formId));
            fetchForms();
        } catch (error) {
            console.error("Error deleting form: ", error);
        }
    };

    return (
        <RequireAuth>
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
                            <p className="item-detail">{form.questions ? form.questions.length : 0} preguntas</p>
                        </div>
                        <div className="form-actions">
                            <FontAwesomeIcon 
                                icon={faLink} 
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(form.id); }} 
                                className="form-action-icon" 
                                title="Copiar enlace de respuestas" 
                            />
                            <FontAwesomeIcon 
                                icon={faPen} 
                                onClick={(e) => { e.stopPropagation(); navigate(`/platform/forms/edit/${form.id}`); }} 
                                className="form-action-icon" 
                                title="Modificar formulario" 
                            />
                            <DeleteIcon 
                                onClick={(e) => { e.stopPropagation(); deleteForm(form.id); }} 
                            />
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
                    title={formData.id ? "Editar Formulario" : "Crear Nuevo Formulario"}
                    fields={[
                        { label: 'Nombre', name: 'name', type: 'text', placeholder: 'Nombre del formulario' },
                        { label: 'Asignatura', name: 'subject', type: 'text', placeholder: 'Asignatura' },
                        { label: 'Fecha de Creación', name: 'createdAt', type: 'text', placeholder: 'Fecha de Creación', disabled: true },
                        { label: 'Activo', name: 'isActive', type: 'checkbox', placeholder: 'Activo' },
                        { label: 'Tiempo Límite', name: 'timeLimit', type: 'select', options: [
                            { value: 'unlimited', label: 'Ilimitado' },
                            { value: '30', label: '30 Minutos' },
                            { value: '60', label: '1 Hora' },
                            { value: '120', label: '2 Horas' },
                        ]}
                    ]}
                />
            )}
        </RequireAuth>
    );
}

export default Forms;
