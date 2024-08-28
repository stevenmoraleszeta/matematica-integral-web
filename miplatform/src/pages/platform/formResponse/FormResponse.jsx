import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import "../../../App.css";
import "./FormResponse.css";

function FormResponse() {
    const { formId } = useParams();
    const [form, setForm] = useState({ name: '', questions: [] });
    const [responses, setResponses] = useState([]);

    useEffect(() => {
        const fetchForm = async () => {
            if (formId) {
                const formDoc = await getDoc(doc(db, "forms", formId));
                if (formDoc.exists()) {
                    setForm(formDoc.data());
                    setResponses(formDoc.data().questions.map(() => '')); // Inicializa las respuestas vacías
                }
            }
        };
        fetchForm();
    }, [formId]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Asegurarse de que todas las respuestas de checkboxes estén en formato string antes de enviar
        const formattedResponses = responses.map(response => 
            Array.isArray(response) ? response.join(', ') : response
        );

        // Metadata de la respuesta
        const responseMetadata = {
            formId,
            timestamp: new Date().toISOString(), // Fecha y hora de envío
            responses: formattedResponses,
            // Puedes agregar más campos aquí según lo que desees registrar
        };

        try {
            await addDoc(collection(db, "responses"), responseMetadata);
            alert("Respuestas enviadas exitosamente.");
            setResponses(form.questions.map(() => '')); // Reinicia las respuestas
        } catch (error) {
            console.error("Error al enviar las respuestas:", error);
        }
    };

    return (
        <div className="form-response-container">
            <h1>{form.name}</h1>
            <form onSubmit={handleSubmit}>
                {form.questions.map((question, index) => (
                    <div key={index} className="question-item">
                        <p>{question.questionText}</p>
                        {question.type === 'text' ? (
                            <input
                                type="text"
                                value={responses[index]}
                                onChange={(e) => handleResponseChange(index, e.target.value)}
                                className="response-input"
                            />
                        ) : (
                            question.options.map((option, oIndex) => (
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
                                    />
                                    <label>{option}</label>
                                </div>
                            ))
                        )}
                    </div>
                ))}
                <button type="submit" className="submit-button">Enviar Respuestas</button>
            </form>
        </div>
    );
}

export default FormResponse;
