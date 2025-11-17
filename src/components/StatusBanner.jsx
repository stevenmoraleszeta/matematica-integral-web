import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import './StatusBanner.css';

const StatusBanner = memo(() => {
    const { t } = useTranslation();
    
    return (
        <div className="status-banner">
            <div className="banner-content">
                <strong>{t('projectStatus.importantNote')}:</strong> {t('projectStatus.message')}
            </div>
        </div>
    );
});

StatusBanner.displayName = 'StatusBanner';

export default StatusBanner;

