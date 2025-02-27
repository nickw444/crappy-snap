document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const galleryEl = document.getElementById('gallery');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const errorMessageEl = document.getElementById('error-message');
    const emptyEl = document.getElementById('empty');
    const refreshBtn = document.getElementById('refresh-btn');
    
    // State
    let photos = [];
    let sessionId = null;
    let ws = null;
    
    // Check if device is mobile and has share capability
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasShareCapability = navigator.share !== undefined;
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // Initialize gallery
    initGallery();
    
    // Initialize WebSocket connection
    initWebSocket();
    
    /**
     * Initialize WebSocket connection
     */
    function initWebSocket() {
        // Create WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}`;
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('WebSocket connection established');
        };
        
        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                
                // Handle new photo message
                if (message.type === 'new_photo' && message.sessionId === sessionId) {
                    console.log('New photo notification received, refreshing gallery');
                    refreshGallery();
                }
            } catch (err) {
                console.error('Error processing WebSocket message:', err);
            }
        };
        
        ws.onclose = () => {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after a delay
            setTimeout(initWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    /**
     * Initialize the gallery
     */
    async function initGallery() {
        if (!token) {
            showError('No access token provided. Please scan the QR code again.');
            return;
        }
        
        try {
            // Fetch photos for the session
            const response = await fetch(`/api/photos?token=${encodeURIComponent(token)}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load photos');
            }
            
            const data = await response.json();
            photos = data.photos || [];
            sessionId = data.sessionId;
            
            // Show appropriate view based on photo count
            if (photos.length === 0) {
                showEmpty();
            } else {
                renderGallery();
            }
        } catch (err) {
            showError(err.message || 'Failed to load photos');
        }
    }
    
    /**
     * Render the gallery with photos
     */
    function renderGallery() {
        // Clear gallery
        galleryEl.innerHTML = '';
        
        // Add each photo to the gallery
        photos.forEach((photo, index) => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            
            // Create image element
            const img = document.createElement('img');
            img.src = photo.url;
            img.alt = `Photo ${index + 1}`;
            img.loading = 'lazy';
            
            // Add image to photo item
            photoItem.appendChild(img);
            
            // Add click event - different behavior based on device type
            photoItem.addEventListener('click', () => {
                if (isMobile && hasShareCapability) {
                    // Mobile with share capability - open share sheet
                    sharePhoto(photo, index);
                } else {
                    // Desktop/tablet or mobile without share - download directly
                    downloadPhoto(photo, index);
                }
            });
            
            galleryEl.appendChild(photoItem);
        });
        
        // Hide loading, show gallery
        loadingEl.classList.add('hidden');
        galleryEl.classList.remove('hidden');
    }
    
    /**
     * Share a photo if Web Share API is available
     * @param {Object} photo - Photo object with URL
     * @param {number} index - Index of the photo
     */
    async function sharePhoto(photo, index) {
        if (!navigator.share) return;
        
        try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            const file = new File([blob], `photo-${index + 1}.jpg`, { type: 'image/jpeg' });
            
            await navigator.share({
                title: 'Photo from Crappy Snap',
                text: 'Check out this photo from Crappy Snap!',
                files: [file]
            });
        } catch (err) {
            console.error('Error sharing photo:', err);
            // Fallback to opening the image in a new tab
            window.open(photo.url, '_blank');
        }
    }
    
    /**
     * Download a photo
     * @param {Object} photo - Photo object with URL
     * @param {number} index - Index of the photo
     */
    function downloadPhoto(photo, index) {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `photo-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        loadingEl.classList.add('hidden');
        errorMessageEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
    
    /**
     * Show empty state
     */
    function showEmpty() {
        loadingEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
    }
    
    /**
     * Refresh the gallery
     */
    function refreshGallery() {
        // If gallery is already visible, show a subtle loading indicator
        // instead of hiding the gallery completely
        if (!galleryEl.classList.contains('hidden')) {
            galleryEl.classList.add('refreshing');
        } else {
            loadingEl.classList.remove('hidden');
            errorEl.classList.add('hidden');
            emptyEl.classList.add('hidden');
        }
        
        // Store current photo count to check if new photos were added
        const previousPhotoCount = photos.length;
        
        // Fetch updated photos
        fetch(`/api/photos?token=${encodeURIComponent(token)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to refresh gallery');
                }
                return response.json();
            })
            .then(data => {
                photos = data.photos || [];
                
                // Remove refreshing class
                galleryEl.classList.remove('refreshing');
                
                // Show appropriate view based on photo count
                if (photos.length === 0) {
                    galleryEl.classList.add('hidden');
                    showEmpty();
                } else {
                    // If new photos were added, show a notification
                    if (photos.length > previousPhotoCount && previousPhotoCount > 0) {
                        showNotification(`${photos.length - previousPhotoCount} new photo${photos.length - previousPhotoCount > 1 ? 's' : ''} added!`);
                    }
                    
                    renderGallery();
                }
            })
            .catch(err => {
                console.error('Error refreshing gallery:', err);
                // Don't show error if it's just a refresh - keep showing the old photos
                if (galleryEl.classList.contains('hidden')) {
                    showError(err.message || 'Failed to refresh gallery');
                }
                galleryEl.classList.remove('refreshing');
            });
    }
    
    /**
     * Show a temporary notification
     * @param {string} message - Message to display
     */
    function showNotification(message) {
        // Create notification element if it doesn't exist
        let notificationEl = document.getElementById('notification');
        if (!notificationEl) {
            notificationEl = document.createElement('div');
            notificationEl.id = 'notification';
            notificationEl.className = 'notification';
            document.body.appendChild(notificationEl);
        }
        
        // Set message and show notification
        notificationEl.textContent = message;
        notificationEl.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notificationEl.classList.remove('show');
        }, 3000);
    }
    
    // Event listeners
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshGallery);
    }
}); 