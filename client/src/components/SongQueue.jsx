import React, { useState, useEffect, useRef } from 'react';
import { getAllSongs } from '../api';
import { motion } from 'framer-motion';
import Header from './Header';

const SongQueue = ({ onPlayQueue }) => {
    const [playlist, setPlaylist] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isProgressBarClicked, setIsProgressBarClicked] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false); // New state for collapse/expand
    const audioRef = useRef();

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const data = await getAllSongs();
                if (data.success && Array.isArray(data.song)) {
                    setPlaylist(data.song);
                } else {
                    throw new Error('Data is not in expected format or failed to fetch');
                }
            } catch (error) {
                console.error('Failed to fetch songs:', error);
            }
        };

        fetchSongs();
    }, []);

    useEffect(() => {
        const updateProgress = () => {
            if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
                setDuration(audioRef.current.duration);
            }
        };

        const handleSongEnd = () => {
            if (currentSongIndex === queue.length - 1) {
                console.log("Queue finished, restarting...");
                setCurrentSongIndex(0); // Reset to the beginning of the queue
                if (audioRef.current) {
                    audioRef.current.src = queue[0]?.songURL; // Set audio source to the first song
                    audioRef.current.play(); // Start playback of the first song
                    setIsPlaying(true); // Set playback state to true
                }
            } else {
                setCurrentSongIndex(currentSongIndex + 1); // Move to the next song
                const nextSongURL = queue[currentSongIndex + 1]?.songURL;
                if (nextSongURL && audioRef.current) {
                    audioRef.current.src = nextSongURL; // Update the audio source to the next song
                    audioRef.current.play(); // Start playback of the next song
                    setIsPlaying(true); // Set playback state to true
                }
            }
        };

        if (isPlaying && audioRef.current) {
            audioRef.current.addEventListener('ended', handleSongEnd);
            const intervalId = setInterval(updateProgress, 1000);
            return () => {
                clearInterval(intervalId);
                audioRef.current?.removeEventListener('ended', handleSongEnd);
            };
        }
    }, [isPlaying, currentSongIndex, queue]);

    useEffect(() => {
        const handleLoadedMetadata = () => {
            // Ensure that audio is not playing when loading a new source
            if (isPlaying && audioRef.current) {
                audioRef.current.play();
            }
        };

        audioRef.current?.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [isPlaying]);

    const addToQueue = (index) => {
        setIsCollapsed(false); // Reset isCollapsed state to false
        const selectedSong = playlist[index];
        setQueue(prevQueue => [...prevQueue, selectedSong]);
    };


    const handleToggleQueue = () => {
        if (queue.length > 0) {
            const currentAudio = audioRef.current;
            const currentSongURL = queue[currentSongIndex]?.songURL;

            if (currentSongURL) {
                if (currentAudio.src === currentSongURL) {
                    if (isPlaying) {
                        currentAudio.pause();
                    } else {
                        currentAudio.play();
                    }
                    setIsPlaying(!isPlaying);
                } else {
                    currentAudio.src = currentSongURL;
                    setIsPlaying(true);
                }
            } else {
                console.error("No valid song URL found.");
            }
        } else {
            console.error("Queue is empty.");
        }
    };

    const handleSkipSong = () => {
        if (currentSongIndex < queue.length - 1) {
            setCurrentSongIndex(currentSongIndex + 1);
            const nextSongURL = queue[currentSongIndex + 1]?.songURL;
            if (nextSongURL) {
                audioRef.current.src = nextSongURL;
                setIsPlaying(true);
            }
        } else {
            setIsPlaying(false);
        }
    };

    const handleProgressBarClick = (e) => {
        setIsProgressBarClicked(true);
        const rect = e.target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = (offsetX / rect.width) * 100;
        const newTime = (percentage / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
        setIsProgressBarClicked(false);
    };

    const formatDuration = (duration) => {
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleCollapseQueue = () => {
        setQueue([]);
        setIsPlaying(false);
        audioRef.current?.pause();
        setCurrentTime(0); // Reset current time
        setIsCollapsed(true);
    };

    return (
        <div style={{ marginTop: '20px', paddingBottom: '100px' }}>
            <Header />
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {playlist.map((song, index) => (
                    <div key={index} style={{ width: 'calc(25% - 10px)', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '10px', transition: 'background-image 0.3s ease-in-out' }}>
                            <img src={song.imageURL} alt={song.name} style={{ width: '100px', height: '100px', marginRight: '20px', borderRadius: '8px' }} />
                            <div>
                                <h4>{song.name}</h4>
                                <p>{song.artist}</p>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', borderRadius: '8px' }} onClick={() => addToQueue(index)}>Add to Queue</motion.button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {queue.length > 0 && (
                <div style={{ marginTop: '20px', cursor: 'pointer' }} onClick={handleProgressBarClick}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span>{formatDuration(currentTime)}</span>
                        <div style={{ backgroundColor: 'lightgray', height: '10px', position: 'relative', width: '100%', marginLeft: '10px' }}>
                            <div style={{ backgroundColor: 'green', height: '100%', width: `${(currentTime / duration) * 100}%` }}></div>
                        </div>
                        <span>{duration ? formatDuration(duration) : '0:00'}</span>
                    </div>
                </div>
            )}

            {queue.length > 0 && <audio ref={audioRef}></audio>}

            {queue.length > 0 && (
                <div>
                    <div style={{ marginBottom: '2px', padding: '2px', borderRadius: '2px', background: 'linear-gradient(to right, #777, #999)', boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <h4 style={{ color: 'white', marginBottom: '10px', fontWeight: 'bold', fontSize: '18px', padding: '1px', borderRadius: '1px' }}>CURRENT SONGS QUEUE</h4>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ backgroundColor: 'green', color: 'white', padding: '5px 10px', borderRadius: '8px', marginRight: '10px' }} onClick={handleToggleQueue}>{isPlaying ? "Pause Queue" : "Play Queue"}</motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ backgroundColor: 'red', color: 'white', padding: '5px 10px', borderRadius: '8px', marginRight: '10px' }} onClick={handleSkipSong}>Skip Song</motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ backgroundColor: 'blue', color: 'white', padding: '5px 10px', borderRadius: '8px', marginRight: '10px' }} onClick={handleCollapseQueue}>{isCollapsed ? "Previous Queue Collapsed" : "Collapse Queue"}</motion.button>
                            </div>
                        </div>
                    </div>

                    {!isCollapsed && (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {queue.map((song, index) => (
                                <div key={index} style={{ width: 'calc(10% - 10px)', marginBottom: '20px' }}>
                                    <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)', filter: index === currentSongIndex ? 'none' : 'blur(5px)' }}> {/* Conditional filter */}
                                        <div style={{ padding: '10px', transition: 'background-image 0.3s ease-in-out' }}>
                                            <img src={song.imageURL} alt={song.name} style={{ width: '100px', height: '100px', marginRight: '20px', borderRadius: '8px' }} />
                                            <div>
                                                <h4>{song.name}</h4>
                                                <p>{song.artist}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            )}
        </div>
    );


};

export default SongQueue;
