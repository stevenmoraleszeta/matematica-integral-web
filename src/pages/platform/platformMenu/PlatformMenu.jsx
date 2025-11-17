import '../../../App.css';
import "./PlatformMenu.css";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faChalkboardTeacher, faUsers, faCalendarAlt, faClipboard, faFileAlt, faFileSignature, faTasks, faFileContract } from '@fortawesome/free-solid-svg-icons'; // Usa faFileContract
import RequireAuth from "../../../components/RequireAuth";
import ProjectStatusBanner from "../../../components/ProjectStatusBanner/ProjectStatusBanner.jsx";

function PlatformMenu() {
    const { t } = useTranslation();
    // Note: Authentication removed - project is publicly accessible

    const items = [
        { id: 1, label: t('menu.students'), path: "/platform/students", icon: faUserGraduate, alwaysVisible: true },
        { id: 2, label: t('menu.teachers'), path: "/platform/teachers", icon: faChalkboardTeacher, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"] },
        { id: 3, label: t('menu.groups'), path: "/platform/groups", icon: faUsers, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"] },
        { id: 4, label: t('menu.sessions'), path: "/platform/sessions", icon: faCalendarAlt, alwaysVisible: true },
        { id: 5, label: t('menu.quizzes'), path: "/platform/scores", icon: faClipboard, alwaysVisible: true },
        { id: 6, label: t('menu.mockExams'), path: "/platform/mockExams", icon: faFileSignature, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"]  },
        { id: 7, label: t('menu.homeworks'), path: "/platform/homeworks", icon: faTasks, alwaysVisible: true },
        { id: 8, label: t('menu.forms'), path: "/platform/forms", icon: faFileContract, alwaysVisible: true }, 
        { id: 9, label: t('menu.reports'), path: "/platform/reports", icon: faFileAlt, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"] },
    ];

    // Show all items - authentication requirement removed for public access
    const filteredItems = items;

    return (
        <RequireAuth>
            <ProjectStatusBanner />
            <div className="platform-container">
                {filteredItems.map((item) => (
                    <Link key={item.id} to={item.path} className="platform-item">
                        <FontAwesomeIcon icon={item.icon} className="platform-icon" />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>
        </RequireAuth>
    );
}

export default PlatformMenu;
