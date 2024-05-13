import React, { useEffect, useRef, useState } from 'react';
import { musicState } from './musicState';

const Player = () => {
  const audioRef = useRef(null);
  const [playerState, setPlayerState] = useState(() => musicState.get('state') || 'paused');
  const [currentSongIndex, setCurrentSongIndex] = useState(null);

  useEffect(() => {
    const updatePlayer = () => {
      const state = musicState.get() || {};
      const playlist = state.playlist || [];
      const currentSong = playlist[currentSongIndex] || {};

      if (audioRef.current && currentSong.songURL) {
        audioRef.current.src = currentSong.songURL;
        audioRef.current.currentTime = state.position || 0;

        if (playerState === 'playing') {
          audioRef.current.play().catch((error) => console.error("Error playing the song:", error));
        } else {
          audioRef.current.pause();
        }
      }
    };

    const observer = () => {
      setPlayerState(musicState.get('state') || 'paused');
      updatePlayer();
    };

    musicState.observeDeep(observer);

    return () => musicState.unobserveDeep(observer);
  }, [playerState, currentSongIndex]);

  const playPause = (index) => {
    const currentPlayingIndex = musicState.get('currentSongIndex');
    if (currentPlayingIndex === index) {
      const nextState = musicState.get('state') === 'playing' ? 'paused' : 'playing';
      musicState.set('state', nextState);
    } else {
      musicState.set('currentSongIndex', index);
      musicState.set('state', 'playing');
    }
  };


  const selectSong = (index) => {
    setCurrentSongIndex(index);
    musicState.set('position', 0);
    setPlayerState('playing');
  };

  return (
    <div>
      <audio ref={audioRef} controls />
      <button onClick={playPause}>{playerState === 'playing' ? 'Pause' : 'Play'}</button>
      <div>
        <h4>Playlist</h4>
        {(musicState.get('playlist') || []).map((song, index) => (
          <button key={index} onClick={() => selectSong(index)}>
            {song.name} - {song.artist}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Player;
