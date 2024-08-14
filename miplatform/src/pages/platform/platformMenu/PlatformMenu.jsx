import '../../../App.css';
import "./PlatformMenu.css";
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGraduate, faChalkboardTeacher, faUsers, faCalendarAlt, faClipboard, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import RequireAuth from "../../../components/RequireAuth";
import { useAuth } from '../../../contexts/auth';  // Importa el hook de autenticación

function PlatformMenu() {
    const { currentUser } = useAuth();  // Obtén el usuario logueado desde el contexto

    // Definir las opciones disponibles en el menú
    const items = [
        { id: 1, label: "Estudiantes", path: "/platform/students", icon: faUserGraduate, alwaysVisible: true },
        { id: 2, label: "Profesores", path: "/platform/teachers", icon: faChalkboardTeacher, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"] },
        { id: 3, label: "Grupos", path: "/platform/groups", icon: faUsers, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"] },
        { id: 4, label: "Sesiones", path: "/platform/sessions", icon: faCalendarAlt, alwaysVisible: true },
        { id: 5, label: "Calificaciones", path: "/platform/scores", icon: faClipboard, alwaysVisible: true },
        { id: 6, label: "Reportar", path: "/platform/reports", icon: faFileAlt, emails: ["veronicagonzalez@matematicaintegralcr.com", "administracion@matematicaintegralcr.com"] },
    ];

    // Filtrar las opciones según el correo del usuario, pero siempre mostrar las que tienen "alwaysVisible"
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
