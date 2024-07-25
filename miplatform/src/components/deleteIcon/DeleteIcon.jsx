import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './DeleteIcon.css'; // Si necesitas estilos específicos para el ícono

function DeleteIcon({ onClick }) {
    const handleClick = (e) => {
        e.stopPropagation(); // Evita que el click se propague al contenedor padre
        if (window.confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
            onClick(); // Llama a la función onClick solo si el usuario confirma
        }
    };

    return (
        <div className="delete-icon" onClick={handleClick}>
            <FontAwesomeIcon icon={faTrash} />
        </div>
    );
}

export default DeleteIcon;
