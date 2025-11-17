import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SecureDeleteConfirm.css';

/**
 * Componente mejorado de confirmación para eliminaciones
 * Requiere doble confirmación para prevenir eliminaciones accidentales
 */
function SecureDeleteConfirm({ 
  itemName, 
  onConfirm, 
  onCancel, 
  message 
}) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [typedName, setTypedName] = useState('');

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setStep(1);
    setTypedName('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="secure-delete-overlay" onClick={handleCancel}>
      <div className="secure-delete-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t('secureDelete.title')}</h3>
        
        {step === 1 ? (
          <>
            <p className="secure-delete-message">{message || t('secureDelete.defaultMessage')}</p>
            <p className="secure-delete-warning">
              ⚠️ {t('secureDelete.warning')}
            </p>
            <div className="secure-delete-buttons">
              <button 
                className="secure-delete-btn secure-delete-btn-cancel" 
                onClick={handleCancel}
              >
                {t('common.cancel')}
              </button>
              <button 
                className="secure-delete-btn secure-delete-btn-confirm" 
                onClick={handleConfirm}
              >
                {t('secureDelete.continue')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="secure-delete-message">
              {t('secureDelete.confirmMessage')} <strong>{itemName}</strong>:
            </p>
            <input
              type="text"
              className="secure-delete-input"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={itemName}
              autoFocus
            />
            <div className="secure-delete-buttons">
              <button 
                className="secure-delete-btn secure-delete-btn-cancel" 
                onClick={handleCancel}
              >
                {t('common.cancel')}
              </button>
              <button 
                className={`secure-delete-btn secure-delete-btn-confirm ${
                  typedName !== itemName ? 'secure-delete-btn-disabled' : ''
                }`}
                onClick={handleConfirm}
                disabled={typedName !== itemName}
              >
                {t('secureDelete.deletePermanently')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SecureDeleteConfirm;

