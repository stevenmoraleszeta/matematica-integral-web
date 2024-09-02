import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase/firebase';
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { Pie } from 'react-chartjs-2';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import './ResponsesViewer.css';

function ResponsesViewer() {
    const { formId } = useParams();
    const [responses, setResponses] = useState([]);
    const [filteredResponses, setFilteredResponses] = useState([]); // Estado para las respuestas filtradas
    const [formName, setFormName] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda

    useEffect(() => {
        const fetchResponses = async () => {
            try {
                const formRef = doc(db, 'forms', formId);
                const formDoc = await getDoc(formRef);
                if (formDoc.exists()) {
                    const formData = formDoc.data();
                    setFormName(formData.name);
                    setQuestions(formData.questions || []);
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
                setFilteredResponses(responsesList); // Inicialmente, las respuestas filtradas son todas
            } catch (error) {
                console.error('Error fetching responses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResponses();
    }, [formId]);

    // Maneja el cambio en el campo de búsqueda
    const handleSearchChange = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = responses.filter((response) =>
            response.responses.some((answer) => answer.toLowerCase().includes(term)) ||
            formatDate(response.timestamp).includes(term)
        );
        setFilteredResponses(filtered);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const getQuestionResponses = (questionIndex) => {
        const answers = responses.map((response) => response.responses[questionIndex]);
        const answerCounts = answers.reduce((acc, answer) => {
            acc[answer] = (acc[answer] || 0) + 1;
            return acc;
        }, {});
        return {
            labels: Object.keys(answerCounts),
            datasets: [
                {
                    label: questions[questionIndex]?.questionText || `Pregunta ${questionIndex + 1}`,
                    data: Object.values(answerCounts),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    const handleResponseClick = (response) => {
        setSelectedResponse(response);
    };

    const handleDeleteResponse = async () => {
        if (!selectedResponse) return;
        try {
            await deleteDoc(doc(db, 'responses', selectedResponse.id));
            setResponses(responses.filter((response) => response.id !== selectedResponse.id));
            setFilteredResponses(filteredResponses.filter((response) => response.id !== selectedResponse.id));
            setSelectedResponse(null);
        } catch (error) {
            console.error('Error deleting response:', error);
        }
    };

    const closeModal = () => {
        setSelectedResponse(null);
    };

    if (loading) {
        return <p>Cargando respuestas...</p>;
    }

    if (responses.length === 0) {
        return <p>No se encontraron respuestas.</p>;
    }

    return (
        <div className="responses-viewer-container">
            
            <div className="charts-container">
                {responses[0].responses.map((_, questionIndex) => (
                    <div key={questionIndex} className="chart-item">
                        <Pie
                            data={getQuestionResponses(questionIndex)}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: questions[questionIndex]?.questionText || `Pregunta ${questionIndex + 1}`,
                                    },
                                },
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar respuestas..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>
            <center>
                <h1>Respuestas de {formName}</h1>
            </center>
            <div className="response-list">
                {filteredResponses.map((response, index) => (
                    <div key={response.id} className="response-item" onClick={() => handleResponseClick(response)}>
                        <h3>
                            Respuesta #{index + 1} - {formatDate(response.timestamp)}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Modal para mostrar la respuesta seleccionada */}
            {selectedResponse && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Detalles de la Respuesta</h2>
                        <div>
                            {selectedResponse.responses.map((answer, idx) => (
                                <div key={idx}>
                                    <strong>{questions[idx]?.questionText || `Pregunta ${idx + 1}`}:</strong>
                                    <p>{answer}</p>
                                </div>
                            ))}
                        </div>
                        <div className="modal-buttons-container"> {/* Contenedor para botones */}
                            <button className="close-modal" onClick={closeModal}>
                                Cerrar
                            </button>
                            <DeleteIcon className="delete-response-btn" onClick={handleDeleteResponse} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ResponsesViewer;
