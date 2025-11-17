import './NavBar.css';
import '../../App.css';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import defaultProfileImage from '../../assets/img/defaultProfileImage.jpg';

function NavBar() {
    const { currentUser } = useAuth();
    
    const profileImage = useMemo(() => {
        return currentUser?.photoURL || defaultProfileImage;
    }, [currentUser?.photoURL]);

    return (
        <div className="topnav" id="myTopnav">
            <div className="left-section">
                <Link className='navbar-link' to="/platform">
                    Plataforma
                </Link>
            </div>
            <div className="right-section">
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
