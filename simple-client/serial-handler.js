const WebSocket = require('ws');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Configuration
const WS_SERVER = process.env.WS_SERVER || 'ws://localhost:3000';
const SERIAL_PATH = process.env.SERIAL_PATH || '/dev/ttyUSB0';  // Windows: 'COM3'
const BAUD_RATE = 115200;
const RECONNECT_DELAY = 2000;

let ws;
let serialPort;
let reconnectTimer;
let wsReconnectTimer;

// Initialize Serial Port
function initSerial() {
    try {
        serialPort = new SerialPort({
            path: SERIAL_PATH,
            baudRate: BAUD_RATE
        });

        const parser = serialPort.pipe(new ReadlineParser());

        // Handle incoming serial data
        parser.on('data', (data) => {
            const message = data.trim();
            
            if (message === 'TRIGGER:PRESS') {
                console.log('Button pressed - sending trigger');
                sendTrigger('press');
            } else if (message === 'TRIGGER:HOLD') {
                console.log('Button held - sending hold trigger');
                sendTrigger('hold');
            } else if (message.startsWith('DEBUG:')) {
                // Extract and log the ADC value
                const adcValue = parseInt(message.split(':')[1]);
                console.log(`ADC Value: ${adcValue}`);
                
                // Optional: You could send this to the web client for debugging
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ 
                        type: 'debug',
                        value: adcValue
                    }));
                }
            }
        });

        serialPort.on('error', (err) => {
            console.error('Serial port error:', err.message);
            // Attempt to reconnect
            setTimeout(initSerial, RECONNECT_DELAY);
        });

        console.log(`Serial port initialized on ${SERIAL_PATH} at ${BAUD_RATE} baud`);
    } catch (err) {
        console.error('Failed to initialize serial port:', err.message);
        // Attempt to reconnect
        setTimeout(initSerial, RECONNECT_DELAY);
    }
}

// Initialize WebSocket connection
function connectWebSocket() {
    if (wsReconnectTimer) {
        clearTimeout(wsReconnectTimer);
    }

    ws = new WebSocket(WS_SERVER);

    ws.on('open', () => {
        console.log('Connected to WebSocket server');
    });

    ws.on('close', () => {
        console.log('Disconnected from WebSocket server');
        // Attempt to reconnect
        wsReconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
    });
}

// Send trigger message to server
function sendTrigger(type = 'press') {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
            type: 'trigger',
            triggerType: type
        }));
    } else {
        console.warn('WebSocket not connected - trigger not sent');
    }
}

// Cleanup on exit
function cleanup() {
    console.log('Cleaning up...');
    if (serialPort) {
        serialPort.close();
    }
    if (ws) {
        ws.close();
    }
    process.exit(0);
}

// Handle cleanup on process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// List available serial ports (helpful for setup)
SerialPort.list().then(ports => {
    console.log('Available serial ports:');
    ports.forEach(port => {
        console.log(`${port.path} - ${port.manufacturer || 'Unknown manufacturer'}`);
    });
}).catch(err => {
    console.error('Error listing serial ports:', err);
});

// Start the handler
console.log('Starting serial handler...');
initSerial();
connectWebSocket(); 