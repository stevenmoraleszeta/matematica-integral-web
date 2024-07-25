import React from 'react';
import './AttendanceModal.css';

const AttendanceModal = ({ showModal, closeModal, students, attendance, handleAttendanceChange }) => {
    if (!showModal) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <button className="close-button" onClick={closeModal}>Cerrar</button>
                <h2>Modificar Asistencia</h2>
                {students.length === 0 ? (
                    <p>No hay estudiantes en este grupo.</p>
                ) : (
                    students.map(student => (
                        <div key={student.id} className="attendance-item">
                            <p>{student.name}</p>
                            <select
                                value={attendance[student.id] || 'absent'}
                                onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                            >
                                <option value="present">Presente</option>
                                <option value="absent">Ausente</option>
                            </select>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AttendanceModal;
