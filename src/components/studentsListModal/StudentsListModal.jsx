import { useState } from 'react';
import './StudentsListModal.css';

const StudentsListModal = ({ showModal, closeModal, students, attendance = {}, scores = {}, handleAttendanceChange, handleScoreChange, handleSave, mode }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!showModal) return null;

    // Filtrar estudiantes en función del término de búsqueda
    const filteredStudents = students.filter(student =>
        (String(student.name) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (String(student.email) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (String(student.phone) || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="students-modal-overlay">
            <div className="students-modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <h2>{mode === 'attendance' ? 'Modificar Asistencia' : 'Modificar Calificaciones'}</h2>

                {/* Barra de búsqueda */}
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo o teléfono"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-bar"
                />

                <button className="save-button" onClick={handleSave}>Guardar</button>
                
                {filteredStudents.length === 0 ? (
                    <p>No se encontraron estudiantes.</p>
                ) : (
                    filteredStudents.map(student => (
                        <div key={student.id} className="students-item">
                            <p>{student.name}</p>
                            {mode === 'attendance' ? (
                                <select
                                    value={attendance[student.id] || 'absent'}
                                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                    className={
                                        attendance[student.id] === 'present' ? 'present-select' :
                                        attendance[student.id] === 'excusedAbsence' ? 'excused-select' :
                                        'absent-select'
                                    }
                                >
                                    <option value="present">Presente</option>
                                    <option value="absent">Ausente</option>
                                    <option value="excusedAbsence">Ausente Justificado</option>
                                </select>
                            ) : mode === 'submited' ? (
                                <select
                                    value={attendance[student.id] || 'notSubmited'}
                                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                                    className={attendance[student.id] === 'submited' ? 'submited-select' : 'not-submited-select'}
                                >
                                    <option value="submited">Entregada</option>
                                    <option value="notSubmited">Sin entregar</option>
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
            </div>
        </div>
    );
};

export default StudentsListModal;
