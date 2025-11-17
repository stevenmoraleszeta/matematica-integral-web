import '../../App.css';
import './UserProfile.css';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth';
import { getAuth, updateProfile, updateEmail, signOut } from "firebase/auth";
import { Navigate, useNavigate } from 'react-router-dom';
import RequireAuth from '../../components/RequireAuth';


function UserProfile() {
    const { currentUser, updateCurrentUser } = useAuth();
    const auth = getAuth();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        displayName: '',
        email: '',
        photoURL: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            setUserInfo({
                displayName: currentUser.displayName || '',
                email: currentUser.email || '',
                photoURL: currentUser.photoURL || '',
            });
            setLoading(false);
        }
    }, [currentUser]);

    const handleLogout = async () => {
        if (window.confirm("¿Está seguro de que desea cerrar sesión?")) {
            try {
                await signOut(auth);
                navigate('/login');
            } catch (error) {
                console.error('Failed to log out:', error);
                alert('Error al cerrar sesión. Por favor, intente de nuevo.');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: userInfo.displayName,
                    photoURL: userInfo.photoURL,
                });
                if (userInfo.email !== auth.currentUser.email) {
                    await updateEmail(auth.currentUser, userInfo.email);
                }
                // Actualiza el estado de currentUser en el contexto
                updateCurrentUser({ ...auth.currentUser });
                navigate('/platform');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.code === 'auth/email-already-in-use' 
                ? 'Este correo electrónico ya está en uso.' 
                : 'Error al actualizar el perfil. Por favor, intente de nuevo.');
        }
    };

    if (!currentUser) {
        return <Navigate to="/platform" replace />;
    }

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <RequireAuth>
            <div className='user-profile-container'>
                <h1>Perfil de Usuario</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Nombre:</label>
                        <input
                            type="text"
                            name="displayName"
                            value={userInfo.displayName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={userInfo.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label>URL Imagen Perfil:</label>
                        <input
                            type="text"
                            name="photoURL"
                            value={userInfo.photoURL}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit">Guardar Cambios</button>
                    <button onClick={handleLogout}>Cerrar Sesión</button>
                </form>
            </div>
        </RequireAuth>
    );
}

export default UserProfile;
