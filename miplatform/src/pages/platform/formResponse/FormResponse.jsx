import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import "../../../App.css";
import "./FormResponse.css";

function FormResponse() {
    const { formId } = useParams();
    const [form, setForm] = useState({ name: '', questions: [], timeLimit: 0 });
    const [responses, setResponses] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [showStartModal, setShowStartModal] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        const fetchForm = async () => {
            if (formId) {
                try {
                    const formDoc = await getDoc(doc(db, "forms", formId));
                    if (formDoc.exists()) {
                        const formData = formDoc.data();
                        setForm({
                            ...formData,
                            questions: formData.questions || [] // Asegura que `questions` siempre sea un array
                        });
                        setResponses((formData.questions || []).map(() => ''));
                        if (formData.timeLimit > 0) {
                            setTimeRemaining(formData.timeLimit * 60);
                        }
                    }
                } catch (error) {
                    console.error("Error al obtener el formulario:", error);
                }
            }
        };
        fetchForm();
    }, [formId]);

    useEffect(() => {
        if (!isStarted || timeRemaining === null || formSubmitted) return;

        if (timeRemaining <= 0) {
            clearInterval(intervalRef.current);
            setIsTimeUp(true);
            setShowSubmitModal(true);
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeRemaining((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isStarted, timeRemaining, formSubmitted]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleResponseChange = (index, value, type) => {
        const updatedResponses = [...responses];

        if (type === 'checkboxes') {
            if (!Array.isArray(updatedResponses[index])) {
                updatedResponses[index] = [];
            }
            if (updatedResponses[index].includes(value)) {
                updatedResponses[index] = updatedResponses[index].filter((v) => v !== value);
            } else {
                updatedResponses[index].push(value);
            }
        } else {
            updatedResponses[index] = value;
        }

        setResponses(updatedResponses);
    };

    const startResponse = () => {
        setShowStartModal(false);
        setIsStarted(true);
    };

    const handleSubmit = () => {
        if (formSubmitted || isTimeUp) {
            setShowSubmitModal(true);
            return;
        }

        setShowSubmitModal(true);
    };

    const confirmSubmit = async () => {
        if (formSubmitted) return;
        clearInterval(intervalRef.current);
        setShowSubmitModal(false);

        const formattedResponses = responses.map(response =>
            Array.isArray(response) ? response.join(', ') : response
        );

        const responseMetadata = {
            formId,
            timestamp: new Date().toISOString(),
            responses: formattedResponses,
        };

        try {
            await addDoc(collection(db, "responses"), responseMetadata);
            setFormSubmitted(true);
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error al enviar las respuestas:", error);
        }
    };

    const cancelSubmit = () => {
        setShowSubmitModal(false);
        if (!isTimeUp && !formSubmitted) {
            if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                    setTimeRemaining((prev) => prev - 1);
                }, 1000);
            }
        }
    };

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    return (
        <div className="form-response-container">
            <h1>{form.name}</h1>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {(form.questions || []).map((question, index) => (
                    <div key={index} className="question-item">
                        {question.imageUrl && (
                            <img src={question.imageUrl} alt="Question Image" className="question-image" />
                        )}
                        <p>{question.questionText}</p>
                        {question.type === 'text' ? (
                            <input
                                type="text"
                                value={responses[index]}
                                onChange={(e) => handleResponseChange(index, e.target.value)}
                                className="response-input"
                                disabled={formSubmitted || isTimeUp}
                            />
                        ) : (
                            (question.options || []).map((option, oIndex) => (
                                <div key={oIndex} className="option-item">
                                    <input
                                        type={question.type === 'multiple-choice' ? 'radio' : 'checkbox'}
                                        name={`question-${index}`}
                                        value={option}
                                        checked={
                                            question.type === 'checkboxes'
                                                ? Array.isArray(responses[index]) && responses[index].includes(option)
                                                : responses[index] === option
                                        }
                                        onChange={(e) => handleResponseChange(index, option, question.type)}
                                        className="response-option-input"
                                        disabled={formSubmitted || isTimeUp}
                                    />
                                    <label>{option}</label>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </form>

            {/* Barra fija al fondo */}
            <div className="fixed-bottom-bar">
                {timeRemaining !== null && (
                    <div className="time-remaining">
                        Tiempo restante: {formatTime(timeRemaining)}
                    </div>
                )}
                {!formSubmitted && !isTimeUp && (
                    <button
                        type="button"
                        className="submit-button"
                        onClick={handleSubmit}
                    >
                        Enviar Respuestas
                    </button>
                )}
            </div>

            {/* Modal de inicio */}
            {showStartModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Iniciar Respuesta</h2>
                        {form.timeLimit > 0 && (
                            <p>Minutos disponibles: {form.timeLimit}</p>
                        )}
                        <p>El tiempo comenzará una vez que inicies la respuesta.</p>
                        <button onClick={startResponse} className="modal-button">
                            Iniciar Respuesta
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de envío */}
            {showSubmitModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Confirmar Envío</h2>
                        <p>¿Estás seguro de que deseas enviar las respuestas?</p>
                        <button onClick={confirmSubmit} className="modal-button">
                            Confirmar Envío
                        </button>
                        <button onClick={cancelSubmit} className="modal-button cancel">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de éxito de envío */}
            {showSuccessModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Respuesta Enviada</h2>
                        <p>Tu respuesta ha sido enviada con éxito.</p>
                        <button onClick={closeSuccessModal} className="modal-button">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FormResponse;
