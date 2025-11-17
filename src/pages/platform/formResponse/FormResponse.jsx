// FormResponse.js
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import "../../../App.css";
import "./FormResponse.css";

function FormResponse() {
    const { formId } = useParams();
    const [form, setForm] = useState({ name: '', questions: [], timeLimit: 0, isActive: true });
    const [responses, setResponses] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [showStartModal, setShowStartModal] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showInactiveModal, setShowInactiveModal] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [grade, setGrade] = useState(null); // Estado para la calificación
    const [incorrectAnswers, setIncorrectAnswers] = useState([]); // Estado para almacenar respuestas incorrectas
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
                            questions: formData.questions || []
                        });
                        setResponses((formData.questions || []).map(() => ''));

                        if (formData.estado === "Inactivo") {
                            setShowInactiveModal(true);
                            return;
                        }

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

        // Calcular la calificación y encontrar respuestas incorrectas
        let correctCount = 0;
        let totalGradedQuestions = 0;
        const incorrectAnswersTemp = []; // Lista temporal para las respuestas incorrectas

        form.questions.forEach((question, index) => {
            const correctAnswers = question.correctAnswers || [];
            if (correctAnswers.length > 0) {
                totalGradedQuestions++;

                if (question.type === 'multiple-choice' || question.type === 'checkboxes') {
                    const userAnswers = Array.isArray(responses[index]) ? responses[index] : [responses[index]];

                    // Comprobar si todas las respuestas correctas están en las respuestas del usuario
                    const allCorrect = correctAnswers.every(ans => userAnswers.includes(ans));

                    // Comprobar si las respuestas del usuario no tienen respuestas incorrectas
                    const noIncorrect = userAnswers.every(ans => correctAnswers.includes(ans));

                    if (allCorrect && noIncorrect) {
                        correctCount++;
                    } else {
                        incorrectAnswersTemp.push(index); // Marcar la pregunta como incorrecta
                    }
                } else if (question.type === 'text') {
                    // Comparar respuestas de texto si es necesario
                    if (responses[index] === correctAnswers[0]) {
                        correctCount++;
                    } else {
                        incorrectAnswersTemp.push(index);
                    }
                }
            }
        });

        // Si hay preguntas calificables, calcular la nota
        const calculatedGrade = totalGradedQuestions > 0 ? (correctCount / totalGradedQuestions) * 100 : null;
        setGrade(calculatedGrade); // Almacena la calificación en el estado
        setIncorrectAnswers(incorrectAnswersTemp); // Actualiza el estado con las respuestas incorrectas

        const responseMetadata = {
            formId,
            timestamp: new Date().toISOString(),
            responses: formattedResponses,
            grade: calculatedGrade,
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

    const closeInactiveModal = () => {
        setShowInactiveModal(false);
    };

    return (
        <div className="form-response-container">
            <h1>{form.name}</h1>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {(form.questions || []).map((question, index) => (
                    <div key={index} className={`question-item ${incorrectAnswers.includes(index) ? 'incorrect' : ''}`}>
                        {question.imageUrl && (
                            <img src={question.imageUrl} alt="Question" className="question-image" />
                        )}
                        <p>{question.questionText}</p>
                        {question.type === 'text' ? (
                            <input
                                type="text"
                                value={responses[index]}
                                onChange={(e) => handleResponseChange(index, e.target.value)}
                                className={`response-input`}
                                disabled={formSubmitted || isTimeUp}
                            />
                        ) : (
                            (question.options || []).map((option, oIndex) => (
                                <div key={oIndex} className={`option-item`}>
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
                        {form.timeLimit > 0 ? (
                            <>
                                <p>Minutos disponibles: {form.timeLimit}</p>
                                <p>El tiempo comenzará una vez que inicies la respuesta.</p>
                            </>
                        ) : (
                            <p>No hay límite de tiempo para completar este formulario. Puedes tomar el tiempo que necesites.</p>
                        )}
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
                        {grade !== null && (
                            <div>
                                <h4>Tu respuesta ha sido enviada con éxito.</h4>
                                <h4>Tu calificación es:</h4>
                                <h1>{Math.round(grade)}%</h1>
                            </div>
                        )}
                        <button onClick={closeSuccessModal} className="modal-button">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de formulario inactivo */}
            {showInactiveModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Formulario Inactivo</h2>
                        <p>Este formulario está actualmente inactivo y no acepta respuestas. Contacte con el profesor.</p>
                        <button onClick={closeInactiveModal} className="modal-button">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FormResponse;
