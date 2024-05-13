import React, { useEffect, useRef, useState } from 'react';
import Header from './Header';
import { doc } from './musicState'; // Import the Yjs document directly
import { motion } from 'framer-motion';
import { getAllSongs } from '../api';
const DashboardSongs = () => {
    const audioRef = useRef(new Audio());
    const [playlist, setPlaylist] = useState([]);
    const [isProgressBarClicked, setIsProgressBarClicked] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [positions, setPositions] = useState({}); // Define positions state for each song
    const [isReplay, setIsReplay] = useState(false); // Flag to indicate if it's a replay
    const [queue, setQueue] = useState([]);
    const [isQueueVisible, setIsQueueVisible] = useState(false); // State to manage the visibility of the queue

    useEffect(() => {
        if (playlist[currentSongIndex] && audioRef.current.src !== playlist[currentSongIndex].songURL) {
            audioRef.current.src = playlist[currentSongIndex].songURL
        }
        const playNextSongInQueue = () => {
            if (queue.length > 0 && !isPlaying && currentSongIndex === -1) {
                const nextSong = queue[0];
                const index = playlist.findIndex(song => song === nextSong);
                setCurrentSongIndex(index);
                setQueue(queue.slice(1));
                setIsPlaying(true); // Ensure playing state is set
                audioRef.current.addEventListener('play', () => {
                    setIsPlaying(true);
                });
            }
        };

        playNextSongInQueue(); // Initial check

        // Set up interval to periodically check for new songs in the queue
        const queueListener = setInterval(playNextSongInQueue, 1000);

        // Clear interval on unmount
        return () => clearInterval(queueListener);
    }, [queue, isPlaying, currentSongIndex, playlist]); // Include playlist in the dependency array

    useEffect(() => {
        console.log("Received all song data")
        const fetchSongs = async () => {
            try {
                const data = await getAllSongs();
                console.log("Received all song data")
                if (data && data.success && data.song) {
                    doc.transact(() => {
                        doc.getMap('musicState').set('playlist', data.song);
                    });
                    setPlaylist(data.song);
                } else {
                    console.error("Failed to fetch songs or no songs data available.");
                }
            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        };

        //if (!doc.getMap('musicState').get('playlist') || !doc.getMap('musicState').get('playlist').length) {
        fetchSongs();
        // }
    }, []);

    const handleProgressBarClick = (e) => {
        setIsProgressBarClicked(true); // Set the flag to true when the progress bar is clicked
        doc.off('update');
        const rect = e.target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = (offsetX / rect.width) * 100;
        const newTime = (percentage / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setProgress(percentage);

        // Update the position in the Yjs document for the current song
        doc.transact(() => {
            const newPosition = { ...positions, [currentSongIndex]: newTime };
            doc.getMap('musicState').set('positions', newPosition);
        });
        setTimeout(() => {
            setIsProgressBarClicked(false);
        }, 2000);
    };

    useEffect(() => {
        console.log("Loading initial data from Yjs document...");
        // Load initial data
        const initialPlaylist = doc.getMap('musicState').get('playlist');
        console.log("Initial playlist:", initialPlaylist);
        setPlaylist(initialPlaylist);
    }, [])

    useEffect(() => {
        if (!isProgressBarClicked) {
            console.log("Setting up Yjs update listener...");
            // Observe changes to the Yjs document
            doc.on('update', () => {
                //console.log("Yjs document updated, updating current song index...");

                const state = doc.getMap('musicState').toJSON();
                console.log("New state:", state);
                setCurrentSongIndex(state.currentSong);
                setIsPlaying(state.state === 'playing');
                setPositions(state.positions || {}); // Update positions state
                // setProgress((state.positions?.[currentSongIndex] / audioRef.current.duration) * 100 || 0); // Update progress state based on current song's position
            });

            return () => {
                // Unsubscribe from Yjs updates
                doc.off('update');
            };
        }

    }, [currentSongIndex, isProgressBarClicked]);

    useEffect(() => {
        console.log(`isPlaying: ${isPlaying}, audiopaused: ${audioRef.current.paused}, audiosrc: ${audioRef.current.src}`)
        if (isPlaying && audioRef.current.paused) {
            audioRef.current.play()
        }

        if (!isPlaying && !audioRef.current.paused) {
            audioRef.current.pause()
        }
    }, [isPlaying, audioRef.current.paused]);

    useEffect(() => {
        const updateProgress = () => {
            if (audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
                const currentPosition = audioRef.current.currentTime;
                const duration = audioRef.current.duration;
                const progressPercentage = (currentPosition / duration) * 100;
                setProgress(progressPercentage);

                // Update the position in the Yjs document for the current song
                doc.transact(() => {
                    const newPosition = { ...positions, [currentSongIndex]: currentPosition };
                    doc.getMap('musicState').set('positions', newPosition);
                });
            }
        };

        const progressInterval = setInterval(updateProgress, 1000);

        return () => clearInterval(progressInterval);
    }, [currentSongIndex, positions]); // Update progress only when the current song changes



    const selectSong = (index) => {
        let newState;
        if (index === currentSongIndex && isPlaying) {
            newState = 'paused';
            audioRef.current.pause();
            setIsPlaying(false);
            setPositions({ ...positions, [currentSongIndex]: audioRef.current.currentTime }); // Store current playback position for the current song
        } else {
            newState = 'playing';
            setCurrentSongIndex(index);
            setIsPlaying(true);
            audioRef.current.src = playlist[index].songURL;
            audioRef.current.currentTime = positions[index] || 0; // Set current time to the stored position or 0 if not available
            audioRef.current.play();
        }
        doc.transact(() => {
            doc.getMap('musicState').set('currentSong', index);
            doc.getMap('musicState').set('state', newState);
        });
    };

    const resetSong = (index) => {
        setPositions({ ...positions, [index]: 0 }); // Reset playback position for the selected song
        audioRef.current.currentTime = 0; // Reset audio playback position to start
        doc.transact(() => {
            const newPosition = { ...positions, [index]: 0 };
            doc.getMap('musicState').set('positions', newPosition);
        });
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div style={{ marginTop: '20px', paddingBottom: '100px' }}>
            <Header />
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {playlist.map((song, index) => (
                    <div key={index} style={{ width: 'calc(50% - 10px)', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', backgroundImage: `linear-gradient(to bottom right, ${index === currentSongIndex && isPlaying ? 'rgba(255, 255, 255, 0.1)' : 'inherit'}, ${index === currentSongIndex && isPlaying ? 'rgba(255, 255, 255, 0.5)' : 'inherit'})`, transition: 'background-image 0.3s ease-in-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                            <img src={song.imageURL} alt={song.name} style={{ width: '100px', height: '100px', marginRight: '20px', borderRadius: '8px' }} />
                            <div>
                                <h4>{song.name}</h4>
                                <p>{song.artist}</p>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        style={{
                                            backgroundColor: 'red',
                                            color: 'white',
                                            marginRight: '10px',
                                            padding: '5px 10px',
                                            borderRadius: '8px'
                                        }}
                                        onClick={() => selectSong(index)}
                                    >
                                        {index === currentSongIndex && isPlaying ? 'Pause' : isReplay ? 'Replay' : 'Play'}
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ backgroundColor: 'blue', color: 'white', padding: '5px 10px', borderRadius: '8px' }} onClick={() => resetSong(index)}>Reset</motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div style={{ width: '100%', marginTop: '20px', marginBottom: '20px', position: 'relative' }}>
                    <progress
                        value={progress}
                        max="100"
                        style={{ width: '100%', height: '5px', cursor: 'pointer', appearance: 'none', backgroundColor: 'white', borderRadius: '5px', position: 'absolute', bottom: '0' }}
                        onMouseDown={handleProgressBarClick}
                    ></progress>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', color: 'white' }}>
                        <span>{formatTime(positions[currentSongIndex])}</span>
                        <span>{!isNaN(audioRef.current.duration) ? formatTime(audioRef.current.duration) : '00:00'}</span>
                    </div>
                </div>
            </div>

            {isQueueVisible && (
                <div style={{ position: 'fixed', bottom: '20px', left: '20px', padding: '10px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                    {queue.map((song, index) => (
                        <div key={index} style={{ marginBottom: '10px' }}>
                            <img src={song.imageURL} alt={song.name} style={{ width: '50px', height: '50px', marginRight: '10px', borderRadius: '8px' }} />
                            <span>{song.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );



};

export default DashboardSongs;

