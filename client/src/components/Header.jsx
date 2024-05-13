import React, { useState } from 'react';
import { Logo } from '../assets/img';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaCrown } from 'react-icons/fa';
import { useStateValue } from '../context/StateProvider';
import { getAuth } from 'firebase/auth';
import { app } from '../config/firebase.config';
import { motion } from 'framer-motion';
import { isActiveStyles, isNotActiveStyles } from '../utils/styles';

const Header = () => {
    const [{ user }, dispatch] = useStateValue();
    const [isMenu, setIsMenu] = useState(false);
    const navigate = useNavigate();

    const logOut = () => {
        const firebaseAuth = getAuth(app);
        firebaseAuth.signOut().then(() => {
            window.localStorage.setItem("auth", "false");
            navigate("/login", { replace: true });
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    };

    return (
        <header className='flex items-center w-full p-4 md:py-2 md:px-6'>
            <NavLink to="/">
                <img src={Logo} alt='Logo' className='w-16' />
            </NavLink>
            <ul className='flex items-center justify-center ml-7'>
                <NavLink to='/home' className={({ isActive }) => isActive ? isActiveStyles : isNotActiveStyles}>
                    <li className='mx-5 text-lg'>Home</li>
                </NavLink>
                <NavLink to='/user' className={({ isActive }) => isActive ? isActiveStyles : isNotActiveStyles}>
                    <li className='mx-5 text-lg'>Users</li>
                </NavLink>
                <NavLink to='/songs' className={({ isActive }) => isActive ? isActiveStyles : isNotActiveStyles}>
                    <li className='mx-5 text-lg'>Songs</li>
                </NavLink>
                <NavLink to='/songsqueue' className={({ isActive }) => isActive ? isActiveStyles : isNotActiveStyles}>
                    <li className='mx-5 text-lg'>Queue</li>
                </NavLink>
                <NavLink to='/chat' className={({ isActive }) => isActive ? isActiveStyles : isNotActiveStyles}>
                    <li className='mx-5 text-lg'>Chat</li>
                </NavLink>
            </ul>

            <div
                onMouseEnter={() => setIsMenu(true)}
                onMouseLeave={() => setIsMenu(false)}
                className='flex items-center ml-auto cursor-pointer gap-2 relative'>
                <img src={user?.user.imageURL || '' } alt={user?.user.name || "User"} className='w-12 h-12 min-w-[44px] object-cover rounded-full shadow-lg' />
                <div className='flex flex-col'>
                    <p className='text-textColor text-lg hover:text-headingColor font-semibold'>{user?.user?.name}</p>
                    <p className='flex items-center gap-2 text-xs text-gray-500 font-normal'>Premium Member <FaCrown className='text-sm -ml-1 text-yellow-500' /></p>
                </div>
                {isMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className='absolute z-10 top-12 flex flex-col p-3 right-0 w-275 gap-2 bg-card shadow-lg rounded-lg background-blur-sm'>
                        <p className='text-base text-textColor hover:font-semibold duration-150 transition-all ease-in-out' onClick={logOut}>Sign Out</p>
                    </motion.div>
                )}
            </div>
        </header>
    );
};

export default Header;
