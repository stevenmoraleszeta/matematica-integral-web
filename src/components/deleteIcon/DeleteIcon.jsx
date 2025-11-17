import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './DeleteIcon.css';

const DeleteIcon = memo(({ onClick }) => {
    const { t } = useTranslation();
    
    const handleClick = useCallback((e) => {
        e.stopPropagation();
        if (window.confirm(t('common.deleteConfirm'))) {
            onClick();
        }
    }, [onClick, t]);

    return (
        <div className="delete-icon" onClick={handleClick}>
            <FontAwesomeIcon icon={faTrash} />
        </div>
    );
});

DeleteIcon.displayName = 'DeleteIcon';

export default DeleteIcon;
