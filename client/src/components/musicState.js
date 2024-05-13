import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Create a Yjs document
const doc = new Y.Doc();

// Define the initial state
const initialState = {
    playlist: [],
    currentSong: 0,
    position: 0,
    state: 'paused',
};

// Define Yjs map to store state
const musicState = doc.getMap('musicState');
musicState.set('playlist', initialState.playlist);
musicState.set('currentSong', initialState.currentSong);
musicState.set('position', initialState.position);
musicState.set('state', initialState.state);

// Connect to a Yjs WebSocket provider with the room 'music'
const wsProvider = new WebsocketProvider('ws://localhost:5000', 'music', doc);

export { musicState, doc };
