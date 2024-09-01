import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './DeleteIcon.css'; // Si necesitas estilos específicos para el ícono

function DeleteIcon({ onClick }) {
    const handleClick = (e) => {
        e.stopPropagation();
        if (window.confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
            onClick();
        }
    };

    return (
        <div className="delete-icon" onClick={handleClick}>
            <FontAwesomeIcon icon={faTrash} />
        </div>
    );
}

export default DeleteIcon;
