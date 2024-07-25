import "./PlatformMenu.css";
import React from "react";
import { Link } from "react-router-dom";
import RequireAuth from "../../../components/RequireAuth";

function PlatformMenu() {
    const items = [
        { id: 1, label: "Estudiantes", path: "/platform/students" },
        { id: 5, label: "Profesores", path: "/platform/teachers" },
        { id: 2, label: "Grupos", path: "/platform/groups" },
        { id: 3, label: "Sesiones", path: "/platform/session" },
        { id: 4, label: "Calificaciones", path: "/platform/grades" },
        { id: 5, label: "Reportar", path: "/platform/report" },
    ];

    return (
        <RequireAuth>
            <div className="platform-container">
                {items.map((item) => (
                    <Link key={item.id} to={item.path} className="platform-item">
                        {item.label}
                    </Link>
                ))}
            </div>
        </RequireAuth>
    );
}

export default PlatformMenu;
