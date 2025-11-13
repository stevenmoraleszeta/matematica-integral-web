import '../../../App.css';
import "./PlatformMenu.css";
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faChalkboardTeacher, faUsers, faCalendarAlt, faClipboard, faFileAlt, faFileSignature, faTasks, faFileContract } from '@fortawesome/free-solid-svg-icons'; // Usa faFileContract
import RequireAuth from "../../../components/RequireAuth";
import { useAuth } from '../../../contexts/auth';

function PlatformMenu() {
    const { currentUser } = useAuth();

    const items = [
        { id: 1, label: "Estudiantes", path: "/platform/students", icon: faUserGraduate, alwaysVisible: true },
        { id: 2, label: "Profesores", path: "/platform/teachers", icon: faChalkboardTeacher, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"] },
        { id: 3, label: "Grupos", path: "/platform/groups", icon: faUsers, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"] },
        { id: 4, label: "Sesiones", path: "/platform/sessions", icon: faCalendarAlt, alwaysVisible: true },
        { id: 5, label: "Quices", path: "/platform/scores", icon: faClipboard, alwaysVisible: true },
        { id: 6, label: "Simulacros", path: "/platform/mockExams", icon: faFileSignature, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"]  },
        { id: 7, label: "Tareas", path: "/platform/homeworks", icon: faTasks, alwaysVisible: true },
        { id: 8, label: "Formularios", path: "/platform/forms", icon: faFileContract, alwaysVisible: true }, 
        { id: 9, label: "Reportar", path: "/platform/reports", icon: faFileAlt, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"] },
    ];

    const filteredItems = items.filter(item => item.alwaysVisible || (item.emails && item.emails.includes(currentUser?.email)));

    return (
        <RequireAuth>
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
