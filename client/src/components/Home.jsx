import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import { fetchAlbums, fetchArtists } from '../api'; // Make sure fetchAlbums and fetchArtists are properly implemented to fetch data
import './style.css';

const Home = () => {
    const [albums, setAlbums] = useState([]);
    const [artists, setArtists] = useState([]);
    const [hoveredArtist, setHoveredArtist] = useState(null);
    const [hoveredAlbum, setHoveredAlbum] = useState(null);

    useEffect(() => {
        const getAlbums = async () => {
            try {
                const response = await fetchAlbums(); // Assuming fetchAlbums fetches and returns data directly
                if (response.success && Array.isArray(response.album)) {
                    setAlbums(response.album); // Use the correct key 'album' as per your JSON structure
                } else {
                    throw new Error('Data is not in expected format or failed to fetch');
                }
            } catch (error) {
                console.error('Failed to fetch albums:', error);
                setAlbums([]); // Fallback to an empty array in case of error
            }
        };

        const getArtists = async () => {
            try {
                const response = await fetchArtists(); // Assuming fetchArtists fetches and returns data directly
                if (response.success && Array.isArray(response.artist)) {
                    setArtists(response.artist); // Use the correct key 'artist' as per your JSON structure
                } else {
                    throw new Error('Data is not in expected format or failed to fetch');
                }
            } catch (error) {
                console.error('Failed to fetch artists:', error);
                setArtists([]); // Fallback to an empty array in case of error
            }
        };

        getAlbums();
        getArtists();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-primary">
            <Header />
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 p-8"
                overflow-y-auto
            >

                <div className="flex justify-between flex-1">
                    {/* Artists Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="w-1/2 pr-4"
                    >
                        <h2 className="text-white text-lg font-bold mb-4">Recommended Artists</h2>
                        <div className="grid grid-cols-3 gap-4" style={{ width: '1%' }}>
                            {artists.map((artist, index) => (
                                <div key={index} className="relative">
                                    <motion.img
                                        src={artist.imageURL}
                                        alt={artist.name}
                                        className="w-full h-auto rounded-full"
                                        style={{ width: '200px', height: '130px' }}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        onMouseEnter={() => setHoveredArtist(artist)}
                                        onMouseLeave={() => setHoveredArtist(null)}
                                    />
                                    {hoveredArtist === artist && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center p-2">
                                            {artist.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: -50 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="mt-0 pt-0 w-800 h-5"
                        style={{ marginBottom: '0', paddingBottom: '0' }} // Added inline styles to remove bottom padding and margin
                    >
                        <div className="bg-white  bg-gradient-to-t rounded-lg shadow-md p-0 mb-2 list-inside">
                            <h2 className=" text-black text-lg font-bold mb-2">What worked good!</h2>
                            <ul className="text-black list-disc">
                                <li>1. <strong>End to End prototype:</strong>  End to End prototype is working with all backend APIs communicating with MongoDB (some are not used currently but can be used for extended features)</li>
                                <li>2. <strong>Firebase for user authentication:</strong> Used Firebase for user authentication</li>
                                <li>3. <strong>Framer Motion for UI animations:</strong> Used Framer Motion for UI level animations</li>
                                <li>4. <strong>Yjs synchronization:</strong> Yjs synchronization (for Play/Pause) is working across all the users connected in the sessions</li>
                                <li>5. <strong>Firebase for blob storage:</strong> Used Firebase for blob storage of audio files</li>
                                <li>6. <strong>Queue functionality:</strong> Songs can be added to queue, a song can be skipped from the queue or the entire queue can be collapsed and built again</li>
                                <li>7. <strong>Automatic queue shuffling:</strong> Every time the last song is about to finish in the current queue, the queue is again shuffled and the first song of the queue automatically starts</li>
                                <li>8. <strong>Partially functional chat functionality:</strong> Created a Partially functional chat functionality with a user search bar. As soon as a user selects a user and sends the message, an alert pops up from the chat socket server notifying the user the connection has been set. Also, the component automatically sets the connection with the receiver session. (The message is received on the socket server along with sender id, receiver id, and message string which is printed on both client console and socket side)</li>
                            </ul>
                        </div>
                        <div className="bg-white bg-gradient-to-t rounded-lg shadow-md p-0 mb-2 list-inside">
                            <h2 className="text-black text-lg font-bold mb-2">What could have made it better!</h2>
                            <ul className="text-black list-disc">
                                <li>1. Some minor changes in songs component would allow sharing the song only with selected users</li>
                                <li>2. Since the chat socket is already receiving songs, sender id, and receiver id, some changes in the chat component can be made so that the receiver receives notification every time he receives a chat request. This would make the chat component work bidirectionally</li>
                                <li>3. Replay button on songs component can also be synced in the same way as play pause is synced</li>
                                <li>4. Users can also share play synchronized queue in the same manner as songs are being synchronized</li>
                                <li>5. Marking a song as favorite and persisting it in the db was again a small change which I realized just now</li>
                            </ul>
                        </div>
                    </motion.div>



                    {/* Albums Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="w-1/2 pl-4"
                    >
                        <h2 className="text-white text-lg font-bold mb-4">Recently Played Albums</h2>
                        <div className="grid grid-cols-3 gap-4" style={{ width: '1%' }}>
                            {albums.map((album, index) => (
                                <div key={index} className="relative">
                                    <motion.img
                                        src={album.imageURL}
                                        alt={album.name}
                                        className="w-full h-auto rounded-lg"
                                        style={{ width: '200px', height: '130px' }}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        onMouseEnter={() => setHoveredAlbum(album)}
                                        onMouseLeave={() => setHoveredAlbum(null)}
                                    />
                                    {hoveredAlbum === album && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center p-2">
                                            {album.name}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
                {/* About App Card */}

            </motion.div>
        </div>
    );


};

export default Home;
