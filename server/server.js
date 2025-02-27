const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const sessionManager = require('./session-manager');
const qrGenerator = require('./qr-generator');

// Note: This application requires the JWT_SECRET environment variable to be set
// The session-manager.js file will check for this and exit if it's not set

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Create HTTP server
const server = require('http').createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connections store
let connections = new Set();

// Set up session timeout checking
const SESSION_CHECK_INTERVAL = 10000; // Check every 10 seconds
setInterval(() => {
    const expiredSessions = sessionManager.checkExpiredSessions();
    
    // Notify clients about expired sessions
    if (expiredSessions.length > 0) {
        expiredSessions.forEach(sessionId => {
            console.log(`Session expired: ${sessionId}`);
            connections.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ 
                        type: 'session_timeout', 
                        sessionId 
                    }));
                }
            });
        });
    }
}, SESSION_CHECK_INTERVAL);

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
app.post('/upload', async (req, res) => {
    const { imageData } = req.body;
    
    // Remove the data URL prefix to get just the base64 data
    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, '');
    
    // Generate filename with session ID and sequence number
    const filename = sessionManager.generatePhotoFilename();
    const filepath = path.join(uploadsDir, filename);
    
    // Get the current session
    const session = sessionManager.getOrCreateSession();
    
    // Generate QR code for the session
    let qrCodeDataUrl;
    try {
        qrCodeDataUrl = await qrGenerator.generateQRCodeForSession(session.id);
    } catch (err) {
        console.error('Error generating QR code:', err);
        qrCodeDataUrl = null;
    }
    
    // Save the file
    fs.writeFile(filepath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving file:', err);
            res.status(500).json({ error: 'Failed to save photo' });
            return;
        }
        
        // Generate token for the session
        const token = sessionManager.generateToken(session.id);
        // Create the gallery URL
        const galleryUrl = `${req.protocol}://${req.get('host')}/gallery?token=${token}`;
        
        res.json({ 
            message: 'Photo saved successfully',
            filename: filename,
            sessionId: session.id,
            qrCodeDataUrl: qrCodeDataUrl,
            galleryUrl: galleryUrl
        });
    });
});

// Gallery page route
app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'gallery.html'));
});

// API endpoint to get photos for a session
app.get('/api/photos', (req, res) => {
    const { token } = req.query;
    
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    
    // Verify the token and get the session ID
    const sessionId = sessionManager.verifyToken(token);
    
    if (!sessionId) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get all photos for the session
    const photos = sessionManager.getSessionPhotos(sessionId, uploadsDir);
    
    // Return the photo list
    res.json({
        sessionId: sessionId,
        photos: photos.map(filename => ({
            filename,
            url: `/uploads/${filename}`
        }))
    });
});

// Serve photos from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// Start server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 