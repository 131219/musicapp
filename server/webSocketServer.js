/**
 * @type {any}
 */
const WebSocket = require('ws');
const http = require('http');
const ywsUtils = require('y-websocket/bin/utils');
const setupWSConnection = ywsUtils.setupWSConnection;
const docs = ywsUtils.docs;
const env = require('lib0/environment');
const nostatic = env.hasParam('--nostatic');

const PORT = process.env.PORT || 5000;

const server = http.createServer((request, response) => {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.write('404 Not Found\n');
    response.end();
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const room = 'music'; // Use room 'music'
    setupWSConnection(ws, req, { room });
});

// log some stats
setInterval(() => {
    let conns = 0;
    docs.forEach(doc => { conns += doc.conns.size; });
    const stats = {
        conns,
        docs: docs.size,
        websocket: `ws://localhost:${PORT}`,
        http: `http://localhost:${PORT}`
    };
    console.log(`${new Date().toISOString()} Stats: ${JSON.stringify(stats)}`);
}, 10000);

server.listen(PORT, 'localhost');

console.log(`WebSocket server listening on ws://localhost:${PORT}`);
