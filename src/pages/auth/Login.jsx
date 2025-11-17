import '../../App.css';
import './Login.css';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { Navigate } from 'react-router-dom';

function Login() {
    const { currentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
        } catch {
            setError('Failed to log in');
        }
        setLoading(false);
    };

    if (currentUser) {
        return <Navigate to="/platform" />;
    }

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Matemática Integral</h1>
                <h3>Ingrese sus credenciales</h3>
                {error && <p>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">
                        Email:
                    </label>
                    <input type="email"
                        id="email"
                        name="email"
                        placeholder="Ingrese su gmail"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="password">
                        Contraseña:
                    </label>
                    <input type="password"
                        placeholder="Ingrese su contraseña"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" disabled={loading}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
