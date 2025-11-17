import './DataModal.css';
import { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentAlt } from '@fortawesome/free-solid-svg-icons';

const Modal = memo(({ showModal, closeModal, formData, handleChange, handleSubmit, fields, title }) => {
    const openWhatsApp = (phoneNumber) => {
        if (phoneNumber) {
            window.open(`https://wa.me/${phoneNumber}`, '_blank');
        }
    };

    if (!showModal) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={closeModal}>&times;</span>
                <h2>{title}</h2>
                <p><b>ID: </b>{formData.identificator}</p>
                <form onSubmit={handleSubmit}>
                    {fields.map((field, index) => (
                        <div key={index} className="form-group">
                            <label htmlFor={field.name}>
                                {field.label}:
                                {field.type === 'select' ? (
                                    <select
                                        id={field.name}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccionar</option>
                                        {field.options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="input-container">
                                        <input
                                            id={field.name}
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                        />
                                        {field.name === 'phone' && formData.phone && (
                                            <FontAwesomeIcon
                                                className="whatsapp-button"
                                                icon={faCommentAlt}
                                                onClick={() => openWhatsApp(formData.phone)}
                                            />
                                        )}
                                        {field.name === 'parentPhone' && formData.parentPhone && (
                                            <FontAwesomeIcon
                                                className="whatsapp-button"
                                                icon={faCommentAlt}
                                                onClick={() => openWhatsApp(formData.parentPhone)}
                                            />
                                        )}
                                    </div>
                                )}
                            </label>
                        </div>
                    ))}
                    <button type="submit" className="submit-button">Guardar</button>
                </form>
            </div>
        </div>
    );
});

Modal.displayName = 'Modal';

export default Modal;
