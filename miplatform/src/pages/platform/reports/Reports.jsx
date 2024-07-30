import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth';
import { db } from '../../../firebase/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './Reports.css';

function Reports() {
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [attendances, setAttendances] = useState([]);
    const [gradesList, setGradesList] = useState([]);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState('');
    const [selectedGradesId, setSelectedGradesId] = useState('');
    const [attendance, setAttendance] = useState({});
    const [grades, setGrades] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [reports, setReports] = useState([]);
    const [editingReportId, setEditingReportId] = useState(null);
    const [reportTitle, setReportTitle] = useState('');
    const [reportDate, setReportDate] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'groups'));
                const groupList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setGroups(groupList);
            } catch (error) {
                console.error('Error fetching groups: ', error);
            }
        };
        
        fetchGroups();
    }, []);

    const fetchAttendances = async groupId => {
        try {
            const q = query(collection(db, 'attendance'), where('groupId', '==', groupId));
            const querySnapshot = await getDocs(q);
            const attendanceList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAttendances(attendanceList);
        } catch (error) {
            console.error('Error fetching attendance records: ', error);
        }
    };

    const fetchGrades = async groupId => {
        try {
            const q = query(collection(db, 'grades'), where('groupId', '==', groupId));
            const querySnapshot = await getDocs(q);
            const gradesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGradesList(gradesList);
        } catch (error) {
            console.error('Error fetching grade records: ', error);
        }
    };

    const handleGroupChange = async e => {
        const groupId = e.target.value;
        setSelectedGroupId(groupId);
        if (groupId) {
            await fetchAttendances(groupId);
            await fetchGrades(groupId);
        } else {
            setAttendances([]);
            setGradesList([]);
        }
    };

    const handleAttendanceSelectChange = e => {
        const attendanceId = e.target.value;
        setSelectedAttendanceId(attendanceId);
        if (attendanceId) {
            const selectedAttendance = attendances.find(att => att.id === attendanceId);
            setAttendance(selectedAttendance || {});
        } else {
            setAttendance({});
        }
    };

    const handleGradesSelectChange = e => {
        const gradesId = e.target.value;
        setSelectedGradesId(gradesId);
        if (gradesId) {
            const selectedGrades = gradesList.find(gr => gr.id === gradesId);
            setGrades(selectedGrades || {});
        } else {
            setGrades({});
        }
    };

    const handleEdit = async (reportId) => {
        const reportToEdit = reports.find(report => report.id === reportId);
        if (reportToEdit) {
            setSelectedGroupId(reportToEdit.groupId);
            setEditingReportId(reportId);
            setSelectedAttendanceId(reportToEdit.attendanceId || '');
            setSelectedGradesId(reportToEdit.gradesId || '');
            setReportTitle(reportToEdit.title);
            setReportDate(reportToEdit.date);
            setShowModal(true);
            await fetchAttendances(reportToEdit.groupId);
            await fetchGrades(reportToEdit.groupId);
        } else {
            console.error(`Report with ID ${reportId} not found.`);
        }
    };

    useEffect(() => {
        if (selectedAttendanceId) {
            const selectedAttendance = attendances.find(att => att.id === selectedAttendanceId);
            setAttendance(selectedAttendance || {});
        }
    }, [attendances, selectedAttendanceId]);

    useEffect(() => {
        if (selectedGradesId) {
            const selectedGrades = gradesList.find(gr => gr.id === selectedGradesId);
            setGrades(selectedGrades || {});
        }
    }, [gradesList, selectedGradesId]);

    const handleCancelEdit = () => {
        setSelectedGroupId('');
        setSelectedAttendanceId('');
        setSelectedGradesId('');
        setAttendance({});
        setGrades({});
        setEditingReportId(null);
        setReportTitle('');
        setReportDate('');
        setShowModal(false);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const groupName = groups.find(group => group.id === selectedGroupId)?.name || '';
            const attendanceTitle = attendances.find(att => att.id === selectedAttendanceId)?.title || '';
            const gradesTitle = gradesList.find(gr => gr.id === selectedGradesId)?.title || '';

            const updatedAttendance = attendances.find(att => att.id === selectedAttendanceId) || {};
            const updatedGrades = gradesList.find(gr => gr.id === selectedGradesId) || {};
    
            setAttendance(updatedAttendance);
            setGrades(updatedGrades);
    
            // Usa la fecha seleccionada en lugar de la fecha actual
            const formattedDate = reportDate; // Usa la fecha seleccionada
    
            if (editingReportId) {
                const reportRef = doc(db, 'reports', editingReportId);
                const updatedReportData = {
                    title: reportTitle,
                    groupId: selectedGroupId,
                    groupName,
                    attendanceId: selectedAttendanceId,
                    attendanceTitle,
                    gradesId: selectedGradesId,
                    gradesTitle,
                    date: formattedDate, // Fecha seleccionada
                };
                await updateDoc(reportRef, updatedReportData);
                console.log('Report updated successfully');
            } else {
                const newReportData = {
                    title: reportTitle,
                    groupId: selectedGroupId,
                    groupName,
                    attendanceId: selectedAttendanceId,
                    attendanceTitle,
                    gradesId: selectedGradesId,
                    gradesTitle,
                    date: formattedDate, // Fecha seleccionada
                };
                await addDoc(collection(db, 'reports'), newReportData);
                console.log('Report generated and saved successfully');
            }
            fetchReports();
            handleCancelEdit();
        } catch (error) {
            console.error('Error generating or updating report: ', error);
        }
    };
    
    


    const fetchReports = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'reports'));
            const reportList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReports(reportList);
        } catch (error) {
            console.error('Error fetching reports: ', error);
        }
    };

    const deleteReport = async reportId => {
        try {
            await deleteDoc(doc(db, 'reports', reportId));
            setReports(reports.filter(report => report.id !== reportId));
            console.log('Report deleted successfully');
        } catch (error) {
            console.error('Error deleting report: ', error);
        }
    };

    const sendReports = async () => {
        try {
            if (!selectedAttendanceId || !selectedGradesId) {
                console.error('Attendance or grades data is missing');
                return;
            }

            // Fetch the selected attendance and grades
            const selectedAttendance = attendances.find(att => att.id === selectedAttendanceId);
            const selectedGrades = gradesList.find(gr => gr.id === selectedGradesId);

            if (!selectedAttendance || !selectedGrades) {
                console.error('Selected attendance or grades not found');
                return;
            }

            // Ensure `students` exists in the selected attendance and grades
            const attendanceStudents = selectedAttendance.attendance || [];
            const gradesStudents = selectedGrades.grades || {}; // Adjusted to match your data structure

            // Fetch the list of students
            const studentQuery = query(collection(db, 'students'), where('groupId', '==', selectedGroupId));
            const studentSnapshot = await getDocs(studentQuery);
            const students = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            for (const student of students) {
                // Fetch the student's specific attendance and grades
                const studentAttendance = attendanceStudents[student.id] || 'No data';
                const studentGrades = gradesStudents[student.id] || 'No data'; // Adjusted to match your data structure

                const attendanceStatus = studentAttendance ? studentAttendance : 'No data';
                const grade = studentGrades ? studentGrades : 'No data';

                // Format the message
                const message = `
Saludos cordiales.
    
Reporte semanal del curso de preparación para exámenes de admisión TEC, UCR, UNA.
    
Fecha: ${reportDate}.
Sesión: ${reportTitle}.
Profesor(a): ${attendance.teacher || 'No disponible'}.
    
El/la estudiante ${student.nombre} ${attendanceStatus === 'present' ? 'sí asistió' : 'no asistió'}.
    
${grade ? `Presentó el ${selectedGrades.title}, su calificación fue: ${grade}` : 'No presentó la prueba.'}
    
Quedamos atentos(a) para resolver cualquier consulta.
    
Saludos.
    `;
                const encodedMessage = encodeURIComponent(message);
                const whatsappLink = `https://wa.me/${student.telefonoEncargado}?text=${encodedMessage}`;
                window.open(whatsappLink);
            }

        } catch (error) {
            console.error('Error sending reports: ', error);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="report-container">
            <h2>Enviar Reportes</h2>
            <form onSubmit={handleSubmit} className="report-form">
                <div className="form-group">
                    <label htmlFor="reportTitle">Nombre Sesión:</label>
                    <input
                        type="text"
                        id="reportTitle"
                        value={reportTitle}
                        onChange={e => setReportTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="reportDate">Fecha Sesión:</label>
                    <input
                        type="date"
                        id="reportDate"
                        value={reportDate}
                        onChange={e => setReportDate(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="groupSelect">Seleccionar Grupo:</label>
                    <select id="groupSelect" value={selectedGroupId} onChange={handleGroupChange} required>
                        <option value="">Seleccione un grupo</option>
                        {groups.map(group => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="attendanceSelect">Seleccionar Asistencia:</label>
                    <select id="attendanceSelect" value={selectedAttendanceId} onChange={handleAttendanceSelectChange} required>
                        <option value="">Seleccione asistencia</option>
                        {attendances.map(att => (
                            <option key={att.id} value={att.id}>
                                {att.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="gradesSelect">Seleccionar Notas:</label>
                    <select id="gradesSelect" value={selectedGradesId} onChange={handleGradesSelectChange} required>
                        <option value="">Seleccione notas</option>
                        {gradesList.map(gr => (
                            <option key={gr.id} value={gr.id}>
                                {gr.title}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">
                    {editingReportId ? 'Actualizar Reporte' : 'Generar Reporte'}
                </button>
                <button type="button" className="btn btn-primary" onClick={sendReports}>
                    Enviar Reporte
                </button>
                {editingReportId && (
                    <button type="button" className="btn btn-danger" onClick={handleCancelEdit}>
                        Cancelar Edición
                    </button>
                )}
            </form>
            <div className="report-history">
                <h3>Historial de Reportes</h3>
                {reports.length > 0 ? (
                    <ul className="report-list">
                        {reports.map(report => (
                            <li key={report.id}>
                                <div>
                                    <strong>{report.title}</strong>
                                    <p>Grupo: {report.groupName}</p>
                                    <p>Fecha: {report.date}</p> {/* La fecha ya estará formateada */}
                                </div>
                                <div>
                                    <button onClick={() => handleEdit(report.id)}>Editar</button>
                                    <button onClick={() => deleteReport(report.id)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No se encontraron reportes.</p>
                )}
            </div>
        </div>
    );
}

export default Reports;
