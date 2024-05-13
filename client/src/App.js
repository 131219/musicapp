import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { Home, Login, DashboardUsers, DashboardSongs, SongQueue, Chat } from './components';
import { app } from './config/firebase.config';
import { getAuth } from 'firebase/auth';
import { AnimatePresence } from 'framer-motion';
import { validateUser } from './api';
import { useStateValue } from "./context/StateProvider";
import { actionType } from "./context/reducer";
import './components/style.css'; // Import style.css here
import Footer from './components/footer';

const App = () => {
    const firebaseAuth = getAuth(app);
    const navigate = useNavigate();
    const [auth, setAuth] = useState(window.localStorage.getItem("auth") === "true");
    const [{ user }, dispatch] = useStateValue();


    useEffect(() => {
        const unsubscribe = firebaseAuth.onAuthStateChanged((userCred) => {
            if (userCred) {
                userCred.getIdToken()
                    .then((token) => validateUser(token))
                    .then((data) => {
                        dispatch({
                            type: actionType.SET_USER,
                            user: data,
                        });
                        setAuth(true);
                        window.localStorage.setItem("auth", "true");
                    })
                    .catch(error => {
                        console.error("Authentication validation failed:", error);
                        setAuth(false);
                        window.localStorage.setItem("auth", "false");
                        navigate("/login");
                    });
            } else {
                setAuth(false);
                window.localStorage.setItem("auth", "false");

                dispatch({
                    type: actionType.SET_USER,
                    user: null,
                })
                navigate("/login");
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            <Routes>
                <Route path='/login' element={!auth ? <Login setAuth={setAuth} /> : <Navigate to="/" />} />
                <Route path='/*' element={auth ? <Home /> : <Navigate to="/login" />} />
                <Route path="/user" element={<DashboardUsers />} />
                <Route path="/songs" element={<DashboardSongs />} />
                <Route path="/songsqueue" element={<SongQueue />} />
                <Route path="/chat" element={<Chat />} />
            </Routes>
            <Footer />
        </div>
    );
};

export default App;
