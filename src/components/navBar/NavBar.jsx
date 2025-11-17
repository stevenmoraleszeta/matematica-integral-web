import './NavBar.css';
import '../../App.css';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/auth';
import { useTheme } from '../../contexts/theme';
import { useLanguage } from '../../contexts/language';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import defaultProfileImage from '../../assets/img/defaultProfileImage.jpg';

function NavBar() {
    const { currentUser } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const { toggleLanguage, isSpanish } = useLanguage();
    const { t } = useTranslation();
    
    const profileImage = useMemo(() => {
        return currentUser?.photoURL || defaultProfileImage;
    }, [currentUser?.photoURL]);

    const languageText = isSpanish ? 'ES' : 'EN';

    return (
        <div className="topnav" id="myTopnav">
            <div className="left-section">
                <Link className='navbar-link' to="/platform" title={t('navbar.home')}>
                    <FontAwesomeIcon icon={faHome} className="navbar-icon" />
                </Link>
            </div>
            <div className="right-section">
                <button
                    className="language-toggle-button"
                    onClick={toggleLanguage}
                    title={t('navbar.changeLanguage')}
                    aria-label={t('navbar.changeLanguage')}
                >
                    <span className="language-code">{languageText}</span>
                </button>
                <button
                    className="theme-toggle-button"
                    onClick={toggleTheme}
                    title={isDark ? t('navbar.changeToLight') : t('navbar.changeToDark')}
                    aria-label={isDark ? t('navbar.changeToLight') : t('navbar.changeToDark')}
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
