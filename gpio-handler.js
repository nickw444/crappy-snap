const WebSocket = require('ws');
const { Gpio } = require('onoff');

// Configuration
const WS_SERVER = process.env.WS_SERVER || 'ws://localhost:3000';
const GPIO_PIN = process.env.GPIO_PIN || 17;
const RECONNECT_DELAY = 2000;

let ws;
let button;
let reconnectTimer;

// Initialize GPIO
function initGPIO() {
    try {
        button = new Gpio(GPIO_PIN, 'in', 'both', { debounceTimeout: 50 });
        console.log(`GPIO initialized successfully on pin ${GPIO_PIN}`);
        
        // Watch for button press
        button.watch((err, value) => {
            if (err) {
                console.error('Error watching GPIO:', err);
                return;
            }
            
            // Button pressed (value = 0 due to pull-up)
            if (value === 0) {
                console.log('Button pressed - sending trigger');
                sendTrigger();
            }
        });
    } catch (err) {
        console.error('Failed to initialize GPIO:', err.message);
        process.exit(1);
    }
}

// Initialize WebSocket connection
function connectWebSocket() {
    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
    }

    ws = new WebSocket(WS_SERVER);

    ws.on('open', () => {
        console.log('Connected to WebSocket server');
    });

    ws.on('close', () => {
        console.log('Disconnected from WebSocket server');
        // Attempt to reconnect
        reconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
    });
}

// Send trigger message to server
function sendTrigger() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'trigger' }));
    } else {
        console.warn('WebSocket not connected - trigger not sent');
    }
}

// Cleanup on exit
function cleanup() {
    console.log('Cleaning up...');
    if (button) {
        button.unexport();
    }
    if (ws) {
        ws.close();
    }
    process.exit(0);
}

// Handle cleanup on process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the handler
console.log('Starting GPIO handler...');
initGPIO();
connectWebSocket(); 