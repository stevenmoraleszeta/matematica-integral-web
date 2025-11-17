import { memo } from 'react';
import './ProjectStatusBanner.css';

const ProjectStatusBanner = memo(() => {
    return (
        <div className="project-status-banner">
            <div className="banner-content">
                <strong>Important Note:</strong> This project was paused over a year ago by the client academy due to resource issues. The client has given full permission to show or distribute this project. The platform is now publicly accessible without requiring authentication for demonstration purposes.
            </div>
        </div>
    );
});

ProjectStatusBanner.displayName = 'ProjectStatusBanner';

export default ProjectStatusBanner;

