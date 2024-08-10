import './Reports.css';
import React, { useState, useEffect } from 'react';
import useFetchData from '../../../hooks/useFetchData';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import RequireAuth from '../../../components/RequireAuth';

function Reports() {
    const groups = useFetchData("groups");
    const allSessions = useFetchData("sessions");
    const allScores = useFetchData("scores");

    const [selectedGroup, setSelectedGroup] = useState('');
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [filteredScores, setFilteredScores] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedScore, setSelectedScore] = useState('');
    const [teachers, setTeachers] = useState({});
    const [reports, setReports] = useState([]); // Estado para almacenar los reportes

    const handleGroupChange = (e) => {
        setSelectedGroup(e.target.value);
    };

    const handleSessionChange = (e) => {
        setSelectedSession(e.target.value);
    };

    const handleScoreChange = (e) => {
        setSelectedScore(e.target.value);
    };

    const handleSendWhatsAppReport = async () => {
        if (!selectedGroup || !selectedSession || !selectedScore) {
            alert('Por favor, completa todos los campos antes de enviar el reporte.');
            return;
        }

        const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
        const reportData = {
            groupId: selectedGroup,
            sessionId: selectedSession,
            scoreId: selectedScore,
            date: today
        };

        try {
            await addReportToFirebase(reportData); // Guardar el reporte en Firebase

            // Obtener los datos necesarios para enviar el reporte por WhatsApp
            const studentsRef = collection(db, 'students');
            const q = query(studentsRef, where('groupId', '==', selectedGroup));
            const studentsSnapshot = await getDocs(q);

            const session = allSessions.find(sess => sess.id === selectedSession);
            const score = allScores.find(scr => scr.id === selectedScore);

            if (!session || !score) {
                alert('Datos de sesión o calificación no encontrados.');
                return;
            }

            const sessionAttendance = session.attendance || {};
            const studentScores = score.scores || {};

            const teacherName = teachers[session.teacherId] || 'Profesor(a) no disponible';

            studentsSnapshot.forEach((doc) => {
                const student = doc.data();
                const studentId = doc.id;
                const parentPhone = student.parentPhone;
                const studentPhone = student.phone;
                const studentName = student.name || 'Estudiante';
                const attendanceStatus = sessionAttendance[studentId] || 'no present';
                const studentScore = studentScores[studentId] || 'No presentó la prueba';

                const message = `Saludos cordiales.
                
    Reporte semanal del curso de preparación para exámenes de admisión TEC, UCR, UNA.
    
    Fecha: ${session.date}.
    Sesión: ${session.name}.
    Profesor(a): ${teacherName}.
    
    El/la estudiante ${studentName} ${attendanceStatus === 'present' ? 'sí asistió' :
                        attendanceStatus === 'excusedAbsence' ? 'estuvo ausente con justificación' :
                            attendanceStatus === 'absent' ? 'no asistió' :
                                'su estado de asistencia es desconocido'}.
    
    ${studentName ? `Presentó el ${score.name}, su calificación fue: ${studentScore}` : 'No presentó la prueba.'}
    
    Quedamos atentos(a) para resolver cualquier consulta.
    
    Saludos.`;

                // Enviar mensaje al teléfono del encargado
                if (parentPhone) {
                    const parentWhatsAppLink = `https://wa.me/${parentPhone}?text=${encodeURIComponent(message)}`;
                    window.open(parentWhatsAppLink, '_blank');
                }

                // Enviar mensaje al teléfono del estudiante
                if (studentPhone) {
                    const studentWhatsAppLink = `https://wa.me/${studentPhone}?text=${encodeURIComponent(message)}`;
                    window.open(studentWhatsAppLink, '_blank');
                }
            });

            // Actualizar la lista de reportes después de guardar uno
            fetchReports();

        } catch (error) {
            console.error('Error al enviar el reporte por WhatsApp: ', error);
            alert('Error al enviar el reporte por WhatsApp');
        }
    };


    const addReportToFirebase = async (reportData) => {
        try {
            const reportsRef = collection(db, 'reports');
            await addDoc(reportsRef, reportData);
        } catch (error) {
            throw new Error('Error adding report to Firebase: ' + error.message);
        }
    };

    const deleteReport = async (id) => {
        try {
            await deleteDoc(doc(db, 'reports', id));
            fetchReports(); // Actualizar la lista de reportes después de eliminar uno
        } catch (error) {
            console.error('Error al eliminar el reporte: ', error);
            alert('Error al eliminar el reporte');
        }
    };

    const fetchReports = async () => {
        try {
            const reportsRef = collection(db, 'reports');
            const reportsSnapshot = await getDocs(reportsRef);
            const reportsList = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReports(reportsList);
        } catch (error) {
            console.error('Error fetching reports: ', error);
        }
    };

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const teachersRef = collection(db, 'teachers');
                const teachersSnapshot = await getDocs(teachersRef);
                const teachersData = {};
                teachersSnapshot.forEach(doc => {
                    teachersData[doc.id] = doc.data().name;
                });
                setTeachers(teachersData);
            } catch (error) {
                console.error('Error al cargar los profesores: ', error);
            }
        };

        fetchTeachers();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            setFilteredSessions(allSessions.filter(session => session.groupId === selectedGroup));
            setFilteredScores(allScores.filter(score => score.groupId === selectedGroup));
        } else {
            setFilteredSessions([]);
            setFilteredScores([]);
        }
    }, [selectedGroup, allSessions, allScores]);

    useEffect(() => {
        fetchReports(); // Cargar reportes cuando el componente se monte
    }, []);

    // Funciones para obtener nombres a partir de IDs
    const getGroupName = (id) => {
        const group = groups.find(group => group.id === id);
        return group ? group.name : 'Desconocido';
    };

    const getSessionName = (id) => {
        const session = allSessions.find(session => session.id === id);
        return session ? session.name : 'Desconocido';
    };

    const getScoreName = (id) => {
        const score = allScores.find(score => score.id === id);
        return score ? score.name : 'Desconocido';
    };

    return (
        <RequireAuth>
            <div className="reports">
                <label htmlFor="group-select">Seleccionar Grupo:</label>
                <select id="group-select" value={selectedGroup} onChange={handleGroupChange}>
                    <option value="">Seleccionar Grupo</option>
                    {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>

                <label htmlFor="session-select">Seleccionar Sesión:</label>
                <select id="session-select" value={selectedSession} onChange={handleSessionChange}>
                    <option value="">Seleccionar Sesión</option>
                    {filteredSessions.map(session => (
                        <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                </select>

                <label htmlFor="score-select">Seleccionar Calificación:</label>
                <select id="score-select" value={selectedScore} onChange={handleScoreChange}>
                    <option value="">Seleccionar Calificación</option>
                    {filteredScores.map(score => (
                        <option key={score.id} value={score.id}>{score.name}</option>
                    ))}
                </select>

                <button onClick={handleSendWhatsAppReport}>Enviar reporte por WhatsApp</button>

                <h2>Historial de Reportes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Grupo</th>
                            <th>Sesión</th>
                            <th>Calificación</th>
                            <th>Fecha</th>
                            <th>Acciones</th> {/* Nueva columna para acciones */}
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td>{getGroupName(report.groupId)}</td>
                                <td>{getSessionName(report.sessionId)}</td>
                                <td>{getScoreName(report.scoreId)}</td>
                                <td>{report.date}</td>
                                <td>
                                    <DeleteIcon onClick={() => deleteReport(report.id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </RequireAuth>
    );
}

export default Reports;
