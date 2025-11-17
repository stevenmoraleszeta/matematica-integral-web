// EditForm.js
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowUp, faArrowDown, faCopy, faUpload } from '@fortawesome/free-solid-svg-icons';
import './EditForm.css';
import { db, storage } from '../../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function EditForm() {
    const { t } = useTranslation();
    const { formId } = useParams();
    const [form, setForm] = useState({ name: '', questions: [] });
    const [currentQuestion, setCurrentQuestion] = useState({ type: 'text', questionText: '', options: [], imageUrl: '' });
    const fileInputRefs = useRef([]);

    useEffect(() => {
        const fetchForm = async () => {
            if (formId) {
                try {
                    const formDoc = await getDoc(doc(db, "forms", formId));
                    if (formDoc.exists()) {
                        const formData = formDoc.data();
                        setForm({
                            ...formData,
                            questions: formData.questions || []
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
            updatedQuestions[qIndex].options = [];
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

    const deleteQuestion = (qIndex) => {
        const updatedQuestions = form.questions.filter((_, index) => index !== qIndex);
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    const duplicateQuestion = (qIndex) => {
        const updatedQuestions = [...form.questions];
        const duplicatedQuestion = { ...updatedQuestions[qIndex] };
        updatedQuestions.splice(qIndex + 1, 0, duplicatedQuestion);
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    const moveQuestionUp = (qIndex) => {
        if (qIndex === 0) return;
        const updatedQuestions = [...form.questions];
        const temp = updatedQuestions[qIndex];
        updatedQuestions[qIndex] = updatedQuestions[qIndex - 1];
        updatedQuestions[qIndex - 1] = temp;
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    const moveQuestionDown = (qIndex) => {
        if (qIndex === form.questions.length - 1) return;
        const updatedQuestions = [...form.questions];
        const temp = updatedQuestions[qIndex];
        updatedQuestions[qIndex] = updatedQuestions[qIndex + 1];
        updatedQuestions[qIndex + 1] = temp;
        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    const triggerFileInput = (index) => {
        if (fileInputRefs.current[index]) {
            fileInputRefs.current[index].click();
        }
    };

    // Manejo de selección de múltiples respuestas correctas
    const handleCorrectAnswerToggle = (qIndex, option) => {
        const updatedQuestions = [...form.questions];
        const correctAnswers = updatedQuestions[qIndex].correctAnswers || [];

        // Si ya está marcado, lo quita; si no, lo agrega
        if (correctAnswers.includes(option)) {
            updatedQuestions[qIndex].correctAnswers = correctAnswers.filter(ans => ans !== option);
        } else {
            updatedQuestions[qIndex].correctAnswers = [...correctAnswers, option];
        }

        setForm(prevState => ({ ...prevState, questions: updatedQuestions }));
        saveForm(updatedQuestions);
    };

    return (
        <div className="edit-form-container">
            <center><h1>{t('forms.editTitle')}: {form.name}</h1></center>
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
                                placeholder={t('responsesViewer.question')}
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
                        </div>

                        {(question.type === 'multiple-choice' || question.type === 'checkboxes') && (
                            <div className="options-container">
                                {question.options.map((option, oIndex) => (
                                    //TODO Arreglar tamaño checkbox
                                    <div key={oIndex} className="option-item">
                                        <input
                                            type="text"
                                            value={option || ''}
                                            onChange={(e) => handleOptionChange(e, qIndex, oIndex)}
                                            placeholder={`Opción ${oIndex + 1}`}
                                            className="option-input"
                                        />
                                        <input
                                            type="checkbox"
                                            className="correct-answer-checkbox"
                                            checked={(question.correctAnswers || []).includes(option)}
                                            onChange={() => handleCorrectAnswerToggle(qIndex, option)}
                                            title={t('forms.markCorrect')}
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
                                    {t('forms.addOption')}
                                </button>
                            </div>
                        )}

                        <div className="question-actions">
                            <button onClick={() => triggerFileInput(qIndex)}>
                                <FontAwesomeIcon icon={faUpload} title={t('forms.uploadImage')} />
                                <input
                                    type="file"
                                    ref={(el) => (fileInputRefs.current[qIndex] = el)}
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleImageUpload(e.target.files[0], qIndex)}
                                    accept="image/*"
                                />
                            </button>
                            <button onClick={() => moveQuestionUp(qIndex)}>
                                <FontAwesomeIcon icon={faArrowUp} />
                            </button>
                            <button onClick={() => moveQuestionDown(qIndex)}>
                                <FontAwesomeIcon icon={faArrowDown} />
                            </button>
                            <button onClick={() => duplicateQuestion(qIndex)}>
                                <FontAwesomeIcon icon={faCopy} />
                            </button>
                            <button onClick={() => deleteQuestion(qIndex)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
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
