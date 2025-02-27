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
    
    // Check if device is mobile and has share capability
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasShareCapability = navigator.share !== undefined;
    
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // Initialize gallery
    initGallery();
    
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
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
        emptyEl.classList.add('hidden');
        galleryEl.classList.add('hidden');
        
        initGallery();
    }
    
    // Event listeners
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshGallery);
    }
}); 