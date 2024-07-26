import React from 'react';
import './StudentsListModal.css';

const StudentsListModal = ({ showModal, closeModal, students, attendance = {}, scores = {}, handleAttendanceChange, handleScoreChange, handleSave, mode }) => {
    if (!showModal) return null;

    return (
        <div className="students-modal-overlay">
            <div className="students-modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <h2>{mode === 'attendance' ? 'Modificar Asistencia' : 'Modificar Calificaciones'}</h2>
                {students.length === 0 ? (
                    <p>No hay estudiantes en este grupo.</p>
                ) : (
                    students.map(student => (
                        <div key={student.id} className="students-item">
                            <p>{student.name}</p>
                            {mode === 'attendance' ? (
                                <select
                                    value={attendance[student.id] || 'absent'}
                                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                >
                                    <option value="present">Presente</option>
                                    <option value="absent">Ausente</option>
                                    <option value="excusedAbsence">Ausente Justificado</option>
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    value={scores[student.id] || ''}
                                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                />

                            )}
                        </div>
                    ))
                )}
                <button className="save-button" onClick={handleSave}>Guardar</button>
            </div>
        </div>
    );
};

export default StudentsListModal;
