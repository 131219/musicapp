const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8000 });
const userConnections = new Map();

// Function to establish a new WebSocket connection for a user
function establishConnection(receiver_id, message) {
    const newSocket = new WebSocket('ws://localhost:8000');
    newSocket.onopen = () => {
        console.log('WebSocket connection established for user:', receiver_id);

        // Define a callback function to handle the response
        newSocket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            if (response.type === 'notification') {
                // If the response is a notification, display an alert box
                console.log('Notification received:', response.message);
            }
        };

        // Send the message to the new connection if it's not a notification
        if (message.type !== 'notification') {
            newSocket.send(JSON.stringify(message));
        }
    };
    newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    newSocket.onclose = () => {
        console.log('WebSocket connection closed for user:', receiver_id);
    };
}

// Function to count the number of connected users
function countConnectedUsers() {
    return userConnections.size;
}

wss.on('connection', function connection(ws) {
    console.log('New WebSocket connection established.');

    ws.on('message', function incoming(message) {

        try {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage)

            // Log the received message for the receiver ID
            console.log(`Message received for receiver ID ${receiver_id} from sender ID ${sender_id} `);

            if (!receiver_id) {
                console.error('Receiver ID is missing in the message:', parsedMessage);
                return;
            }

            // Add the connected user's ID to the userConnections map
            userConnections.set(ws.userId, ws);

            // Find the receiver's connections
            let connections = userConnections.get(receiver_id);
            if (!connections) {
                // If no connections found, establish a new connection
                connections = [];
                userConnections.set(receiver_id, connections);
                // Establish connection and send alert
                establishConnection(receiver_id, { type: 'notification', message: 'New user connected!' });
            } else {
                // Send the message to all receiver's connections except the sender
                connections.forEach(connection => {
                    if (connection !== ws) {
                        // Exclude the sender's connection
                        connection.send(JSON.stringify(parsedMessage));
                    }
                });
            }

            // Send notification to sender if it's a new user
            if (!userConnections.has(sender_id)) {
                ws.send(JSON.stringify({ type: 'notification', message: 'New user connected!' }));
            }
        } catch (error) {
        }
    });

    // Handle WebSocket connection close
    ws.on('close', function close() {
        console.log('WebSocket connection closed.');

        // Remove the user from the userConnections map upon connection close
        userConnections.forEach((value, key) => {
            if (value === ws) {
                userConnections.delete(key);
            }
        });
    });
});
