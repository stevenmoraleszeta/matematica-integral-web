import '../../App.css';
import './Login.css';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { Navigate } from 'react-router-dom';

function Login() {
    const { t } = useTranslation();
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
            setError(t('login.loginError'));
        }
        setLoading(false);
    };

    if (currentUser) {
        return <Navigate to="/platform" />;
    }

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>{t('login.title')}</h1>
                <h3>{t('login.enterCredentials')}</h3>
                {error && <p>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">
                        {t('login.email')}:
                    </label>
                    <input type="email"
                        id="email"
                        name="email"
                        placeholder={t('login.emailPlaceholder')}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label htmlFor="password">
                        {t('login.password')}:
                    </label>
                    <input type="password"
                        placeholder={t('login.passwordPlaceholder')}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" disabled={loading}>
                        {t('login.loginButton')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
