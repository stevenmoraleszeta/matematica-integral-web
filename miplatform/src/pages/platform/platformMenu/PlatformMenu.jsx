import '../../../App.css';
import "./PlatformMenu.css";
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faChalkboardTeacher, faUsers, faCalendarAlt, faClipboard, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import RequireAuth from "../../../components/RequireAuth";

function PlatformMenu() {
    const items = [
        { id: 1, label: "Estudiantes", path: "/platform/students", icon: faUserGraduate },
        { id: 2, label: "Profesores", path: "/platform/teachers", icon: faChalkboardTeacher },
        { id: 3, label: "Grupos", path: "/platform/groups", icon: faUsers },
        { id: 4, label: "Sesiones", path: "/platform/sessions", icon: faCalendarAlt },
        { id: 5, label: "Calificaciones", path: "/platform/scores", icon: faClipboard },
        { id: 6, label: "Reportar", path: "/platform/reports", icon: faFileAlt },
    ];

    return (
        <RequireAuth>
            <div className="platform-container">
                {items.map((item) => (
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
