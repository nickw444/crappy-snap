const WebSocket = require('ws');

// Configuration
const WS_SERVER = process.env.WS_SERVER || 'ws://localhost:3000';

// Create WebSocket connection
const ws = new WebSocket(WS_SERVER);

ws.on('open', () => {
    console.log('Connected to WebSocket server');
    // Send trigger message
    ws.send(JSON.stringify({ type: 'trigger' }));
    console.log('Trigger sent');
    
    // Close connection and exit
    setTimeout(() => {
        ws.close();
        process.exit(0);
    }, 100);
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
    process.exit(1);
});

console.log('Sending trigger...'); 