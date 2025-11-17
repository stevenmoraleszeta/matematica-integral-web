import { useState } from 'react';

const FieldMappingModal = ({ showModal, closeModal, data, onSubmit }) => {
    const [mappings, setMappings] = useState({});

    const handleMappingChange = (index, field) => {
        setMappings(prevMappings => ({
            ...prevMappings,
            [index]: field
        }));
    };

    const handleSubmit = () => {
        onSubmit(mappings);
    };

    return (
        showModal && (
            <div className="modal">
                <div className="modal-content">
                    <h2>Mapea los campos del archivo</h2>
                    {data[0] && Object.keys(data[0]).map((columnName, index) => (
                        <div key={index}>
                            <label>
                                <span>Columna "{columnName}": </span>
                                <select 
                                    value={mappings[index] || ''}
                                    onChange={(e) => handleMappingChange(index, e.target.value)}
                                >
                                    <option value="">Selecciona un campo</option>
                                    <option value="name">Nombre</option>
                                    <option value="email">Correo</option>
                                    <option value="parentEmail">Correo Encargado</option>
                                    <option value="phone">Teléfono</option>
                                    <option value="parentPhone">Teléfono Encargado</option>
                                    <option value="groupId">Grupo</option>
                                </select>
                            </label>
                        </div>
                    ))}
                    <button onClick={handleSubmit}>Guardar Mapeo</button>
                    <button onClick={closeModal}>Cancelar</button>
                </div>
            </div>
        )
    );
};

export default FieldMappingModal;
