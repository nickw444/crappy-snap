const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Secret key for JWT signing - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Session timeout in milliseconds (2 minutes)
const SESSION_TIMEOUT = 2 * 60 * 1000;

class SessionManager {
    constructor() {
        this.currentSession = null;
        this.lastPhotoTime = null;
        this.sessionCounter = {};
        this.activeSessions = new Map(); // Map to track active sessions and their last activity time
        this.recentlyExpiredSessions = []; // Array to track recently expired sessions
    }

    /**
     * Get or create a session based on current state
     * @returns {Object} Session information
     */
    getOrCreateSession() {
        const now = Date.now();
        
        // Check if we need a new session
        if (!this.currentSession || !this.lastPhotoTime || (now - this.lastPhotoTime > SESSION_TIMEOUT)) {
            // Create a new session
            this.currentSession = {
                id: uuidv4(),
                createdAt: now
            };
            
            // Initialize counter for this session
            this.sessionCounter[this.currentSession.id] = 0;
            
            // Add to active sessions
            this.activeSessions.set(this.currentSession.id, now);
            
            console.log(`Created new session: ${this.currentSession.id}`);
        }
        
        // Update last photo time
        this.lastPhotoTime = now;
        
        // Update activity time for the session
        this.activeSessions.set(this.currentSession.id, now);
        
        return this.currentSession;
    }

    /**
     * Check for expired sessions and return their IDs
     * @returns {Array} Array of expired session IDs
     */
    checkExpiredSessions() {
        const now = Date.now();
        const expiredSessions = [];
        
        // Clear the recently expired sessions array
        this.recentlyExpiredSessions = [];
        
        // Check each active session
        for (const [sessionId, lastActivity] of this.activeSessions.entries()) {
            if (now - lastActivity > SESSION_TIMEOUT) {
                expiredSessions.push(sessionId);
                this.recentlyExpiredSessions.push(sessionId);
                this.activeSessions.delete(sessionId);
            }
        }
        
        return expiredSessions;
    }

    /**
     * Generate a filename for a photo in the current session
     * @returns {String} Filename
     */
    generatePhotoFilename() {
        const session = this.getOrCreateSession();
        
        // Increment the counter for this session
        this.sessionCounter[session.id]++;
        
        // Format the sequence number with leading zeros
        const sequenceNumber = String(this.sessionCounter[session.id]).padStart(3, '0');
        
        return `session_${session.id}_${sequenceNumber}.jpg`;
    }

    /**
     * Generate a JWT token for a session
     * @param {String} sessionId - The session ID
     * @returns {String} JWT token
     */
    generateToken(sessionId) {
        return jwt.sign({ sessionId }, JWT_SECRET, { expiresIn: '7d' });
    }

    /**
     * Verify a JWT token and extract the session ID
     * @param {String} token - The JWT token
     * @returns {String|null} Session ID or null if invalid
     */
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded.sessionId;
        } catch (err) {
            console.error('Token verification failed:', err.message);
            return null;
        }
    }

    /**
     * Get all photos for a session
     * @param {String} sessionId - The session ID
     * @param {String} uploadsDir - Path to uploads directory
     * @returns {Array} Array of photo filenames
     */
    getSessionPhotos(sessionId, uploadsDir) {
        try {
            const files = fs.readdirSync(uploadsDir);
            
            // Filter files by session ID
            return files.filter(file => 
                file.startsWith(`session_${sessionId}_`) && 
                (file.endsWith('.jpg') || file.endsWith('.jpeg'))
            ).sort();
        } catch (err) {
            console.error('Error reading session photos:', err);
            return [];
        }
    }
}

module.exports = new SessionManager(); 