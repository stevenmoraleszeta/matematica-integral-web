import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowUp, faArrowDown, faCopy } from '@fortawesome/free-solid-svg-icons';
import './EditForm.css'; // Asegúrate de tener los estilos necesarios
import { db, storage } from '../../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importa las funciones de Storage

function EditForm() {
    const { formId } = useParams();
    const [form, setForm] = useState({ name: '', questions: [] });
    const [currentQuestion, setCurrentQuestion] = useState({ type: 'text', questionText: '', options: [], imageUrl: '' });

    useEffect(() => {
        const fetchForm = async () => {
            if (formId) {
                try {
                    const formDoc = await getDoc(doc(db, "forms", formId));
                    if (formDoc.exists()) {
                        const formData = formDoc.data();
                        setForm({
                            ...formData,
                            questions: formData.questions || [] // Asegura que `questions` sea un array
                        });
                    }
                } catch (error) {
                    console.error("Error al obtener el formulario:", error);
                }
            }
        };
        fetchForm();
    }, [formId]);

    const saveForm = async (updatedQuestions) => {
        try {
            if (formId) {
                const formRef = doc(db, "forms", formId);
                await updateDoc(formRef, { questions: updatedQuestions });
            }
        } catch (error) {
            console.error("Error al guardar el formulario:", error);
        }
    };

    const handleImageUpload = async (file, qIndex) => {
        if (!file) return;
        const storageRef = ref(storage, `questions/${formId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        const updatedQuestions = [...form.questions];
        updatedQuestions[qIndex].imageUrl = imageUrl;
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    const handleQuestionChange = (e, index) => {
        const { name, value } = e.target;
        const updatedQuestions = [...form.questions];
        updatedQuestions[index][name] = value;
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    const handleOptionChange = (e, qIndex, oIndex) => {
        const { value } = e.target;
        const updatedQuestions = [...form.questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    const addOption = (qIndex) => {
        const updatedQuestions = [...form.questions];
        if (!updatedQuestions[qIndex].options) {
            updatedQuestions[qIndex].options = []; // Asegura que `options` sea un array
        }
        updatedQuestions[qIndex].options.push('');
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    const addQuestion = () => {
        const updatedQuestions = [...form.questions, { ...currentQuestion }];
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        setCurrentQuestion({ type: 'text', questionText: '', options: [], imageUrl: '' });
        saveForm(updatedQuestions);
    };

    const deleteOption = (qIndex, oIndex) => {
        const updatedQuestions = [...form.questions];
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    // Resto de las funciones de manejo de duplicación, eliminación, y reordenamiento...

    return (
        <div className="edit-form-container">
            <center><h1>Editando Formulario: {form.name}</h1></center>
            <div className="question-editor">
                {form.questions.map((question, qIndex) => (
                    <div key={qIndex} className="question-item">
                        {question.imageUrl && (
                            <img src={question.imageUrl} alt="Preview" className="question-image-preview" />
                        )}
                        <div className="question-header">
                            <input
                                type="text"
                                name="questionText"
                                value={question.questionText || ''}
                                onChange={(e) => handleQuestionChange(e, qIndex)}
                                placeholder="Pregunta"
                                className="question-input"
                            />
                            <select
                                name="type"
                                value={question.type}
                                onChange={(e) => handleQuestionChange(e, qIndex)}
                                className="question-type-select"
                            >
                                <option value="text">Respuesta corta</option>
                                <option value="multiple-choice">Opción múltiple</option>
                                <option value="checkboxes">Casillas de verificación</option>
                            </select>
                            <input
                                type="file"
                                onChange={(e) => handleImageUpload(e.target.files[0], qIndex)}
                                accept="image/*"
                                className="image-upload-input"
                            />
                        </div>

                        {/* Opciones de la pregunta */}
                        {(question.type === 'multiple-choice' || question.type === 'checkboxes') && (
                            <div className="options-container">
                                {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="option-item">
                                        <input
                                            type="text"
                                            value={option || ''}
                                            onChange={(e) => handleOptionChange(e, qIndex, oIndex)}
                                            placeholder={`Opción ${oIndex + 1}`}
                                            className="option-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => deleteOption(qIndex, oIndex)}
                                            className="delete-option-btn"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addOption(qIndex)} className="add-option-btn">
                                    Agregar opción
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                <div className="add-question-container">
                    <button type="button" onClick={addQuestion} className="add-question-btn">
                        Agregar pregunta
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditForm;
