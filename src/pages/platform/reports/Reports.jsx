import './Reports.css';
import { useState, useEffect, useMemo, useCallback } from 'react';
import useFetchData from '../../../hooks/useFetchData';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import RequireAuth from '../../../components/RequireAuth';

function Reports() {
    const { data: groups } = useFetchData("groups");
    const { data: allSessions } = useFetchData("sessions");
    const { data: allScores } = useFetchData("scores");
    const { data: allMockExams } = useFetchData("mockExams");

    const [selectedGroup, setSelectedGroup] = useState('');
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [filteredScores, setFilteredScores] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedScore, setSelectedScore] = useState('');
    const [selectedMockExam, setSelectedMockExam] = useState('');
    const [teachers, setTeachers] = useState({});
    const [reports, setReports] = useState([])

    const handleGroupChange = useCallback((e) => {
        setSelectedGroup(e.target.value);
    }, []);

    const handleSessionChange = useCallback((e) => {
        setSelectedSession(e.target.value);
    }, []);

    const handleScoreChange = useCallback((e) => {
        setSelectedScore(e.target.value);
    }, []);

    const handleMockExamChange = useCallback((e) => {
        setSelectedMockExam(e.target.value);
    }, []);

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
            mockExamId: selectedMockExam,
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
            const mockExam = allMockExams.find(mcke => mcke.id === selectedMockExam);

            if (!session || !score || !mockExam) {
                alert('Datos de sesión, calificación o simulacro no encontrados.');
                return;
            }


            const sessionAttendance = session.attendance || {};
            const studentScores = score.scores || {};
            const mockExamAttendance = mockExam.attendance || {};

            const teacherName = teachers[session.teacherId] || 'Profesor(a) no disponible';

            studentsSnapshot.forEach((doc) => {
                const student = doc.data();
                const studentId = doc.id;
                const parentPhone = student.parentPhone;
                const studentPhone = student.phone;
                const studentName = student.name || 'Estudiante';
                const attendanceStatus = sessionAttendance[studentId] || 'Ausente';
                const studentScore = studentScores[studentId] || 'No presentó la prueba';
                const mockExamStatus = mockExamAttendance[studentId] || 'Ausente';
                //TODO Modificar el examen según los datos disponibles
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

    Participación en el simulacro: ${mockExamStatus !== "Ausente" ? "Presente" : "Ausente"}.
    
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

    const filteredSessionsMemo = useMemo(() => {
        if (!selectedGroup || !allSessions.length) return [];
        return allSessions.filter(session => session.groupId === selectedGroup);
    }, [selectedGroup, allSessions]);

    const filteredScoresMemo = useMemo(() => {
        if (!selectedGroup || !allScores.length) return [];
        return allScores.filter(score => score.groupId === selectedGroup);
    }, [selectedGroup, allScores]);

    useEffect(() => {
        setFilteredSessions(filteredSessionsMemo);
        setFilteredScores(filteredScoresMemo);
    }, [filteredSessionsMemo, filteredScoresMemo]);

    useEffect(() => {
        fetchReports(); // Cargar reportes cuando el componente se monte
    }, []);

    // Funciones para obtener nombres a partir de IDs
    const getGroupName = useCallback((id) => {
        const group = groups.find(group => group.id === id);
        return group ? group.name : 'Desconocido';
    }, [groups]);

    const getSessionName = useCallback((id) => {
        const session = allSessions.find(session => session.id === id);
        return session ? session.name : 'Desconocido';
    }, [allSessions]);

    const getScoreName = useCallback((id) => {
        const score = allScores.find(score => score.id === id);
        return score ? score.name : 'Desconocido';
    }, [allScores]);

    const getMockExamName = useCallback((id) => {
        const mockExam = allMockExams.find(score => score.id === id);
        return mockExam ? mockExam.name : 'Desconocido';
    }, [allMockExams]);

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

                <label htmlFor="mockExam-select">Seleccionar Simulacro:</label>
                <select id="mockExam-select" value={selectedMockExam} onChange={handleMockExamChange}>
                    <option value="">Seleccionar Simulacro</option>
                    {allMockExams.map(mockExam => (
                        <option key={mockExam.id} value={mockExam.id}>{mockExam.name}</option>
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
                            <th>Simulacro</th>
                            <th>Fecha Envío</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td>{getGroupName(report.groupId)}</td>
                                <td>{getSessionName(report.sessionId)}</td>
                                <td>{getScoreName(report.scoreId)}</td>
                                <td>{getMockExamName(report.mockExamId)}</td>
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
