import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2'; // Importar Bar de react-chartjs-2
import Chart from 'chart.js/auto'; // Asegúrate de que Chart.js está configurado correctamente
import './ResponsesViewer.css';

function ResponsesViewer() {
    const { formId } = useParams();
    const [responses, setResponses] = useState([]);
    const [formName, setFormName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const formRef = doc(db, 'forms', formId);
                const formDoc = await getDoc(formRef);
                if (formDoc.exists()) {
                    setFormName(formDoc.data().name);
                }

                const responsesQuery = query(
                    collection(db, 'responses'),
                    where('formId', '==', formId)
                );

                const responsesSnapshot = await getDocs(responsesQuery);
                const responsesList = responsesSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setResponses(responsesList);
            } catch (error) {
                console.error('Error fetching responses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResponses();
    }, [formId]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const getQuestionResponses = (questionIndex) => {
        const answers = responses.map(response => response.responses[questionIndex]);
        const answerCounts = answers.reduce((acc, answer) => {
            acc[answer] = (acc[answer] || 0) + 1;
            return acc;
        }, {});
        return {
            labels: Object.keys(answerCounts),
            datasets: [{
                label: `Respuestas de la Pregunta ${questionIndex + 1}`,
                data: Object.values(answerCounts),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        };
    };

    if (loading) {
        return <p>Loading responses...</p>;
    }

    if (responses.length === 0) {
        return <p>No responses found for this form.</p>;
    }

    return (
        <div className="responses-viewer-container">
            <h1>Responses for: {formName}</h1>
            {responses.map((response, index) => (
                <div key={response.id} className="response-item">
                    <h3>Response #{index + 1} - {formatDate(response.timestamp)}</h3>
                    <ul>
                        {response.responses.map((answer, idx) => (
                            <li key={idx}>
                                <strong>Question {idx + 1}:</strong> {answer}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* Gráficas de respuestas por cada pregunta */}
            <div className="charts-container">
                {responses[0].responses.map((_, questionIndex) => (
                    <div key={questionIndex} className="chart-item">
                        <Bar
                            data={getQuestionResponses(questionIndex)}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: `Respuestas de la Pregunta ${questionIndex + 1}`,
                                    },
                                },
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ResponsesViewer;
