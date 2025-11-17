import './NavBar.css';
import '../../App.css';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import { useTheme } from '../../contexts/theme';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import defaultProfileImage from '../../assets/img/defaultProfileImage.jpg';

function NavBar() {
    const { currentUser } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    
    const profileImage = useMemo(() => {
        return currentUser?.photoURL || defaultProfileImage;
    }, [currentUser?.photoURL]);

    return (
        <div className="topnav" id="myTopnav">
            <div className="left-section">
                <Link className='navbar-link' to="/platform" title="Plataforma">
                    <FontAwesomeIcon icon={faHome} className="navbar-icon" />
                </Link>
            </div>
            <div className="right-section">
                <button
                    className="theme-toggle-button"
                    onClick={toggleTheme}
                    title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                    <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
                </button>
                {currentUser && (
                    <Link className='profile-link' to="/user-profile">
                        <img
                            className='profile-image'
                            src={profileImage}
                            alt='Profile'
                        />
                    </Link>
                )}
            </div>
        </div>
    );
}

export default NavBar;
