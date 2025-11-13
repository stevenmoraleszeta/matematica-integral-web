import React from 'react';
import { useAuth } from '../contexts/auth';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // Si no está autenticado, redirige a la página de login
        return <Navigate to="/login" />;
    }

    // Si está autenticado, renderiza el contenido del componente hijo
    return children;
};

export default RequireAuth;
