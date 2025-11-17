import './NavBar.css';
import '../../App.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import defaultProfileImage from '../../assets/img/defaultProfileImage.jpg';

function NavBar() {
    const { currentUser } = useAuth();
    const [profileImage, setProfileImage] = useState(null); 

    useEffect(() => {
        setProfileImage(currentUser?.photoURL || defaultProfileImage);
    }, [currentUser]);

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
                            src={profileImage || defaultProfileImage}
                            alt='Profile'
                        />
                    </Link>
                )}
            </div>
        </div>
    );
}

export default NavBar;
