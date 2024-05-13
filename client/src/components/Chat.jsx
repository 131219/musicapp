import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Header from './Header';
import { useStateValue } from '../context/StateProvider'; // Ensure this path correctly leads to your StateProvider
import { actionType } from '../context/reducer'; // Import your action types
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase Auth functions

const ChatComponent = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [{ currentUser }, dispatch] = useStateValue(); // Destructure currentUser from the state context
    const userConnections = new Map();
    const [searchFocused, setSearchFocused] = useState(false); // Define searchFocused state and its setter function


    const addConnection = (userId, socket) => {
        let connections = userConnections.get(userId);
        if (!connections) {
            connections = [];
            userConnections.set(userId, connections);
        }
        connections.push(socket);
    };

    // Create a ref to hold currentUser
    const currentUserRef = useRef(currentUser);
    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await axios.get('http://localhost:4000/api/users/getUsers');
                if (response.data && Array.isArray(response.data.data)) {
                    setAllUsers(response.data.data);
                } else {
                    throw new Error('Data is not in the expected format');
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setAllUsers([]);
            }
        }

        fetchUsers();
    }, []);

    useEffect(() => {
        // Listen for changes in authentication state
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, fetch user details and dispatch action
                const currentUser = {
                    uid: user.uid,
                    email: user.email,
                    // Add any other user details you need
                };
                console.log(currentUser);
                dispatch({ type: actionType.SET_CURRENT_USER, user: currentUser });

                // Update the ref with currentUser
                currentUserRef.current = currentUser;

                // Establish WebSocket connection
                const newSocket = new WebSocket('ws://localhost:8000');

                // Handle WebSocket open
                newSocket.onopen = () => {
                    console.log('WebSocket connection established');
                    setSocket(newSocket);
                };

                // Handle WebSocket error
                newSocket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };
                // Handle WebSocket close
                newSocket.onclose = () => {
                    console.log('WebSocket connection closed.');
                };

                // Clean up function
                return () => {
                    if (newSocket) {
                        newSocket.close();
                    }
                };
            } else {
                // No user is signed in
                console.log('No user is signed in.');
            }
        });

        // Unsubscribe from the listener when component unmounts
        return () => unsubscribe();
    }, [dispatch]); // Include dispatch in dependency array

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
        } else {
            const results = allUsers.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(results);
        }
    }, [searchQuery, allUsers]);

    useEffect(() => {
        // Handle incoming messages
        if (socket) {
            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log('Received message:', message);

                if (message.type === 'notification') {
                    // Display an alert for the notification message
                    alert(message.message);
                } else {
                    // Update chat messages
                    setChatMessages(prevMessages => [...prevMessages, message]);

                    // Set the active chat user if it's not already set
                    if (!activeChatUser || activeChatUser.user_id !== message.sender_id) {
                        const sender = allUsers.find(user => user.user_id === message.sender_id);
                        setActiveChatUser(sender);
                    }
                }
            };
        }

        // Clean up function
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [socket, activeChatUser, allUsers]);


    const sendMessage = () => {
        const currentUser = currentUserRef.current; // Access currentUser from the ref
        console.log(selectedUser);
        console.log(currentUser);
        if (!socket || !messageInput.trim() || !selectedUser || !currentUser) {
            console.error('Socket not available, message input is empty, user not selected, or current user is undefined.');
            return;
        }
        const message = {
            type: 'chat',
            sender_id: currentUser.uid, // Assuming uid is the correct property for the user ID
            receiver_id: selectedUser.user_id, // Change _id to user_id
            message: messageInput
        };

        console.log('Sending message:', message);

        // Send message through WebSocket
        socket.send(JSON.stringify(message));

        // Update chat messages
        setChatMessages([...chatMessages, message]);

        // Clear message input
        setMessageInput('');
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
    };

    const closeChat = () => {
        setSelectedUser(null);
        setChatMessages([]);
    };

    return (
        <div style={{ marginTop: '20px', paddingBottom: '100px', paddingLeft: '80px', position: 'relative' }}>
            <Header />
            <h2>Select a User to Chat</h2>
            <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                    border: searchFocused ? '2px solid blue' : '1px solid #ccc',
                    width: '50%',
                    padding: '10px',
                    borderRadius: '5px',
                    transition: 'border-color 0.3s',
                    background: 'linear-gradient(to right, #555, #333)', // Add gradient background
                    color: 'darkgray', // Set text color
                }}
            />
            <ul>
                {searchResults.map(user => (
                    <motion.li key={user._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectUser(user)}
                    >
                        <img src={user.imageURL} alt={user.name} style={{ width: '50px', height: '50px', marginRight: '10px', borderRadius: '50%', cursor: 'pointer' }} />
                        <div>{user.name}</div>
                    </motion.li>
                ))}
            </ul>
            {selectedUser && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', padding: '20px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', zIndex: 999, width: '400px', background: 'linear-gradient(to right, #555, #333)', color: 'darkgray' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <img src={selectedUser.imageURL} alt={selectedUser.name} style={{ width: '50px', height: '50px', marginRight: '10px', borderRadius: '50%' }} />
                        <div>{selectedUser.name}</div>
                        <button onClick={closeChat} style={{ marginLeft: 'auto' }}>Close</button>
                    </div>
                    <div style={{ height: '300px', overflowY: 'scroll', marginBottom: '20px' }}>
                        {chatMessages.map((msg, index) => (
                            <div key={index} style={{ marginBottom: '10px' }}>
                                <strong>{msg.sender}:</strong> {msg.message}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                        <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} style={{ flex: 1, border: '1px solid black', padding: '5px', borderRadius: '5px', background: 'linear-gradient(to right, #555, #333)', color: 'darkgray' }} />
                        <button onClick={sendMessage} style={{ marginLeft: '10px', background: 'linear-gradient(to right, #555, #333)', color: 'darkgray', border: '1px solid black', padding: '5px', borderRadius: '5px' }}>Send</button>
                    </div>
                </div>
            )}
            {activeChatUser && (
                <div style={{ position: 'fixed', bottom: '20px', right: '440px', backgroundColor: 'white', padding: '20px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', zIndex: 999, width: '400px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <div>{activeChatUser}</div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default ChatComponent;
