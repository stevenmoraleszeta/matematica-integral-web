import { memo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './DeleteIcon.css';

const DeleteIcon = memo(({ onClick }) => {
    const handleClick = useCallback((e) => {
        e.stopPropagation();
        if (window.confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
            onClick();
        }
    }, [onClick]);

    return (
        <div className="delete-icon" onClick={handleClick}>
            <FontAwesomeIcon icon={faTrash} />
        </div>
    );
});

DeleteIcon.displayName = 'DeleteIcon';

export default DeleteIcon;
