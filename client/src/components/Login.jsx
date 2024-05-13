
import { FcGoogle } from 'react-icons/fc';
import { app } from '../config/firebase.config';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useStateValue } from '../context/StateProvider';
import { validateUser } from '../api';
import { actionType } from '../context/reducer';
import { LoginBg } from '../assets/video'

const Login = ({ setAuth }) => {
    const firebaseAuth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const navigate = useNavigate();
    const [{ user }, dispatch] = useStateValue()
    const loginWithGoogle = async () => {
        await signInWithPopup(firebaseAuth, provider).then((userCred) => {
            if (userCred) {
                setAuth(true);
                window.localStorage.setItem("auth", "true");
                firebaseAuth.onAuthStateChanged((userCred) => {
                    if (userCred) {
                        console.log(userCred);
                        userCred.getIdToken().then((token) => {
                            validateUser(token).then((data) => {
                                dispatch({
                                    type: actionType.SET_USER,
                                    user: data
                                })
                            })
                        })
                        navigate("/", { replace: true });

                    } else {
                        setAuth(false);
                        dispatch({
                            type: actionType.SET_USER,
                            user: null
                        })
                        navigate("/login");
                    }
                });
            }
        });
    };
    useEffect(() => {
        if (window.localStorage.getItem("auth") === "true") {
            navigate("/", { replace: true });
        }
    }, []);
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <video src={LoginBg} type="video/mp4" autoPlay muted loop className='w-full h-full object-conver' />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '375px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
                    <div style={{ color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', borderRadius: '8px', backgroundColor: '#f0f0f0', cursor: 'pointer' }} onClick={loginWithGoogle}>
                        <FcGoogle className='text-xl' />
                        Sign in with Google
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Login