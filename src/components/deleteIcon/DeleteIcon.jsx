import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './DeleteIcon.css'; // Si necesitas estilos específicos para el ícono

const DeleteIcon = ({ onClick }) => {
    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick && window.confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
            onClick();
        }
    };

    return (
        <div className="delete-icon" onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleClick(e);
            }
        }} aria-label="Eliminar elemento">
            <FontAwesomeIcon icon={faTrash} />
        </div>
    );
};

export default DeleteIcon;
