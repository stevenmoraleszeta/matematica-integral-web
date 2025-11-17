import { memo } from 'react';
import './ProjectStatusBanner.css';

const ProjectStatusBanner = memo(() => {
    return (
        <div className="project-status-banner">
            <div className="banner-content">
                <strong>Nota sobre el proyecto:</strong> Este proyecto fue pausado hace más de un año por la academia cliente debido a problemas con recursos. 
                Nos dieron total permiso para mostrarlo o distribuirlo. La plataforma está disponible para visualización pública sin requerir autenticación.
            </div>
        </div>
    );
});

ProjectStatusBanner.displayName = 'ProjectStatusBanner';

export default ProjectStatusBanner;

