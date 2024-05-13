import React, { useEffect } from 'react';
import axios from 'axios';
import { useStateValue } from '../context/StateProvider'; // Ensure this path correctly leads to your StateProvider
import Header from './Header';
import { motion } from 'framer-motion';

const DashboardUsers = () => {
    const [{ allUsers }, dispatch] = useStateValue();

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await axios.get('http://localhost:4000/api/users/getUsers');
                if (response.data && Array.isArray(response.data.data)) {  // Check if 'data' is an array
                    dispatch({
                        type: 'SET_ALL_USERS',
                        allUsers: response.data.data  // Use 'response.data.data' because that's where the user array is
                    });
                } else {
                    throw new Error('Data is not in expected format');
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
                dispatch({
                    type: 'SET_ALL_USERS',
                    allUsers: []  // Fallback to an empty array in case of error
                });
            }
        }

        fetchUsers();
    }, [dispatch]);

    return (
        <div className='relative min-h-screen bg-primary'>
            <Header />
            <div className='w-full p-4'>
                <table className='min-w-full table-auto shadow-md rounded'>
                    <thead>
                        <tr className='bg-gray-700 uppercase text-sm leading-normal'>
                            <th className='py-3 px-6 text-left  text-white'>Image</th>
                            <th className='py-3 px-6 text-left text-white'>Name</th> {/* Added text-white class here */}
                            <th className='py-3 px-6 text-left text-white'>Email</th> {/* Added text-white class here */}
                            <th className='py-3 px-6 text-center text-white'>Verified</th> {/* Added text-white class here */}
                            <th className='py-3 px-6 text-center text-white'>Role</th> {/* Added text-white class here */}
                            <th className='py-3 px-6 text-center text-white'>Created</th> {/* Added text-white class here */}
                        </tr>
                    </thead>
                    <tbody className='text-gray-600 text-sm font-light'>
                        {allUsers.map((user, index) => (
                            <motion.tr
                                key={index}
                                className='border-b border-gray-200'
                                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'black' }}
                            >
                                <td className='py-3 px-6 text-left whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <img src={user.imageURL} alt={`${user.name}'s profile`} className='w-10 h-10 rounded-full' />
                                    </div>
                                </td>
                                <td className='py-3 px-6 text-left text-white'> {/* Added text-white class here */}
                                    {user.name}
                                </td>
                                <td className='py-3 px-6 text-left text-white'> {/* Added text-white class here */}
                                    {user.email}
                                </td>
                                <td className='py-3 px-6 text-center text-white'> {/* Added text-white class here */}
                                    {user.email_verified ? 'Yes' : 'No'}
                                </td>
                                <td className='py-3 px-6 text-center text-white'> {/* Added text-white class here */}
                                    {user.role}
                                </td>
                                <td className='py-3 px-6 text-center text-white'> {/* Added text-white class here */}
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

}

export default DashboardUsers;




