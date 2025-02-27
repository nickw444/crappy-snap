const QRCode = require('qrcode');
const sessionManager = require('./session-manager');

// Get base URL from environment variable or use default
const DEFAULT_BASE_URL = 'http://localhost:3000';
const BASE_URL = process.env.BASE_URL || DEFAULT_BASE_URL;

class QRGenerator {
    /**
     * Generate a QR code data URL for a session
     * @param {String} sessionId - The session ID
     * @param {String} baseUrl - The base URL for the gallery (optional, defaults to environment variable or localhost)
     * @returns {Promise<String>} QR code data URL
     */
    async generateQRCodeForSession(sessionId, baseUrl = BASE_URL) {
        // Generate a JWT token for the session
        const token = sessionManager.generateToken(sessionId);
        
        // Create the gallery URL with the token
        const galleryUrl = `${baseUrl}/gallery?token=${token}`;
        
        // Generate QR code as data URL
        try {
            const qrDataUrl = await QRCode.toDataURL(galleryUrl, {
                errorCorrectionLevel: 'M',
                margin: 2,
                width: 300,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            return qrDataUrl;
        } catch (err) {
            console.error('Error generating QR code:', err);
            throw err;
        }
    }
}

module.exports = new QRGenerator(); 