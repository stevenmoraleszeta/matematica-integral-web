import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowUp, faArrowDown, faCopy } from '@fortawesome/free-solid-svg-icons';
import './QuestionEditor.css';  // Importa los estilos
import { db } from '../../firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

function QuestionEditor({ questions = [], setQuestions, formId }) {
    const [currentQuestion, setCurrentQuestion] = useState({ type: 'text', questionText: '', options: [] });

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

    const handleQuestionChange = (e, index) => {
        const { name, value } = e.target;
        const updatedQuestions = [...questions];
        updatedQuestions[index][name] = value;
        setQuestions(updatedQuestions);
        saveForm(updatedQuestions);
    };

    const handleOptionChange = (e, qIndex, oIndex) => {
        const { value } = e.target;
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setQuestions(updatedQuestions);
        saveForm(updatedQuestions);
    };

    const addOption = (qIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options.push('');
        setQuestions(updatedQuestions);
        saveForm(updatedQuestions);
    };

    const addQuestion = () => {
        const updatedQuestions = [...questions, { ...currentQuestion }];
        setQuestions(updatedQuestions);
        setCurrentQuestion({ type: 'text', questionText: '', options: [] });
        saveForm(updatedQuestions);
    };

    const duplicateQuestion = (index) => {
        const duplicatedQuestion = { ...questions[index] };
        const updatedQuestions = [...questions, duplicatedQuestion];
        setQuestions(updatedQuestions);
        saveForm(updatedQuestions);
    };

    const deleteQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
        saveForm(updatedQuestions);
    };

    const deleteOption = (qIndex, oIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.filter((_, i) => i !== oIndex);
        setQuestions(updatedQuestions);
        saveForm(updatedQuestions);
    };

    const moveQuestion = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= questions.length) return;

        const updatedQuestions = [...questions];
        const [movedQuestion] = updatedQuestions.splice(index, 1);
        updatedQuestions.splice(newIndex, 0, movedQuestion);
        setQuestions(updatedQuestions);
        saveForm(updatedQuestions);
    };

    return (
        <div className="question-editor">
            {questions.map((question, qIndex) => (
                <div key={qIndex} className="question-item">
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
                    </div>

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

                    <div className="question-actions">
                        <button
                            type="button"
                            onClick={() => moveQuestion(qIndex, -1)}
                            className="move-question-btn"
                        >
                            <FontAwesomeIcon icon={faArrowUp} />
                        </button>
                        <button
                            type="button"
                            onClick={() => moveQuestion(qIndex, 1)}
                            className="move-question-btn"
                        >
                            <FontAwesomeIcon icon={faArrowDown} />
                        </button>
                        <button
                            type="button"
                            onClick={() => duplicateQuestion(qIndex)}
                            className="duplicate-question-btn"
                        >
                            <FontAwesomeIcon icon={faCopy} />
                        </button>
                        <button
                            type="button"
                            onClick={() => deleteQuestion(qIndex)}
                            className="delete-question-btn"
                        >
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
    );
}

export default QuestionEditor;
