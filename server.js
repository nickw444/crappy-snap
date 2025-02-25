const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the public directory
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Create HTTP server
const server = require('http').createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connections store
let connections = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');
    connections.add(ws);

    // Handle messages from clients (including GPIO handler)
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            // Forward trigger messages to all web clients
            if (message.type === 'trigger') {
                console.log('Received trigger - broadcasting to clients');
                connections.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'trigger' }));
                    }
                });
            }
        } catch (err) {
            console.error('Error processing WebSocket message:', err);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        connections.delete(ws);
    });
});

// Handle photo upload
app.post('/upload', (req, res) => {
    const { imageData } = req.body;
    
    // Remove the data URL prefix to get just the base64 data
    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '');
    
    // Generate filename with timestamp
    const filename = `photo_${new Date().toISOString().replace(/:/g, '-')}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    
    // Save the file
    fs.writeFile(filepath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving file:', err);
            res.status(500).json({ error: 'Failed to save photo' });
            return;
        }
        
        res.json({ 
            message: 'Photo saved successfully',
            filename: filename
        });
    });
});

// Start server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 