import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import './ProjectStatusBanner.css';

const ProjectStatusBanner = memo(() => {
    const { t } = useTranslation();
    
    return (
        <div className="project-status-banner">
            <div className="banner-content">
                <strong>{t('projectStatus.importantNote')}:</strong> {t('projectStatus.message')}
            </div>
        </div>
    );
});

ProjectStatusBanner.displayName = 'ProjectStatusBanner';

export default ProjectStatusBanner;

