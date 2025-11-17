import './Reports.css';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useFetchData from '../../../hooks/useFetchData';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import DeleteIcon from '../../../components/deleteIcon/DeleteIcon';
import RequireAuth from '../../../components/RequireAuth';

function Reports() {
    const { t } = useTranslation();
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
            alert(t('reports.completeFields'));
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
                alert(t('reports.dataNotFound'));
                return;
            }


            const sessionAttendance = session.attendance || {};
            const studentScores = score.scores || {};
            const mockExamAttendance = mockExam.attendance || {};

            const teacherName = teachers[session.teacherId] || t('teachers.notAvailable');

            studentsSnapshot.forEach((doc) => {
                const student = doc.data();
                const studentId = doc.id;
                const parentPhone = student.parentPhone;
                const studentPhone = student.phone;
                const studentName = student.name || t('reports.studentDefault');
                const attendanceStatus = sessionAttendance[studentId] || 'absent';
                const studentScore = studentScores[studentId] || t('scores.noScore');
                const mockExamStatus = mockExamAttendance[studentId] || 'absent';
                //TODO Modificar el examen según los datos disponibles
                const attendanceText = attendanceStatus === 'present' ? t('attendance.attended') :
                        attendanceStatus === 'excusedAbsence' ? t('attendance.absentJustified') :
                            attendanceStatus === 'absent' ? t('attendance.didNotAttend') :
                                t('attendance.unknown');
                const mockExamText = mockExamStatus !== 'absent' ? t('reports.attendedMock') : t('reports.absentMock');
                const scoreText = studentName ? `${t('reports.scoreInfo')} ${score.name}, ${t('reports.scoreWas')}: ${studentScore}` : t('reports.noTest');
                const message = `${t('reports.greeting')}
                
    ${t('reports.weeklyReport')}
    
    ${t('reports.date')}: ${session.date}.
    ${t('reports.session')}: ${session.name}.
    ${t('reports.teacher')}: ${teacherName}.
    
    ${t('reports.student')} ${studentName} ${attendanceText}.
    
    ${scoreText}

    ${t('reports.mockExamParticipation')}: ${mockExamText}.
    
    ${t('reports.closing')}
    
    ${t('reports.goodbye')}`;

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
            alert(t('reports.sendError'));
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
            alert(t('reports.deleteError'));
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
        return group ? group.name : t('common.unknown');
    }, [groups, t]);

    const getSessionName = useCallback((id) => {
        const session = allSessions.find(session => session.id === id);
        return session ? session.name : t('common.unknown');
    }, [allSessions, t]);

    const getScoreName = useCallback((id) => {
        const score = allScores.find(score => score.id === id);
        return score ? score.name : t('common.unknown');
    }, [allScores, t]);

    const getMockExamName = useCallback((id) => {
        const mockExam = allMockExams.find(score => score.id === id);
        return mockExam ? mockExam.name : t('common.unknown');
    }, [allMockExams, t]);

    return (
        <RequireAuth>
            <div className="reports">
                <label htmlFor="group-select">{t('reports.selectGroup')}:</label>
                <select id="group-select" value={selectedGroup} onChange={handleGroupChange}>
                    <option value="">{t('reports.selectGroup')}</option>
                    {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>

                <label htmlFor="session-select">{t('reports.selectSession')}:</label>
                <select id="session-select" value={selectedSession} onChange={handleSessionChange}>
                    <option value="">{t('reports.selectSession')}</option>
                    {filteredSessions.map(session => (
                        <option key={session.id} value={session.id}>{session.name}</option>
                    ))}
                </select>

                <label htmlFor="score-select">{t('reports.selectScore')}:</label>
                <select id="score-select" value={selectedScore} onChange={handleScoreChange}>
                    <option value="">{t('reports.selectScore')}</option>
                    {filteredScores.map(score => (
                        <option key={score.id} value={score.id}>{score.name}</option>
                    ))}
                </select>

                <label htmlFor="mockExam-select">{t('reports.selectMockExam')}:</label>
                <select id="mockExam-select" value={selectedMockExam} onChange={handleMockExamChange}>
                    <option value="">{t('reports.selectMockExam')}</option>
                    {allMockExams.map(mockExam => (
                        <option key={mockExam.id} value={mockExam.id}>{mockExam.name}</option>
                    ))}
                </select>

                <button onClick={handleSendWhatsAppReport}>{t('reports.sendReport')}</button>

                <h2>{t('reports.reportHistory')}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>{t('reports.group')}</th>
                            <th>{t('reports.session')}</th>
                            <th>{t('reports.score')}</th>
                            <th>{t('reports.mockExam')}</th>
                            <th>{t('reports.sendDate')}</th>
                            <th>{t('common.actions')}</th>
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
