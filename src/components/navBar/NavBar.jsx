import './NavBar.css'
import '../../App.css'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth';
import defaultProfileImage from '../../assets/img/defaultProfileImage.jpg';

function NavBar() {
    const { currentUser } = useAuth();
    const [profileImage, setProfileImage] = useState(null); 

    useEffect(() => {
        if (currentUser) {
            setProfileImage(currentUser.photoURL || defaultProfileImage); 
        } else {
            setProfileImage(null);
        }
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
                            src={profileImage || defaultProfileImage} // Mostrar la imagen de perfil o la por defecto
                            alt='Profile'
                        />
                    </Link>
                )}
            </div>
        </div>
    );
}

export default NavBar;
