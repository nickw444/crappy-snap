document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const galleryEl = document.getElementById('gallery');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const errorMessageEl = document.getElementById('error-message');
    const emptyEl = document.getElementById('empty');
    const lightboxEl = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const closeBtn = document.getElementById('close-btn');
    
    // State
    let photos = [];
    let currentPhotoIndex = -1;
    
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
            photoItem.innerHTML = `<img src="${photo.url}" alt="Photo ${index + 1}" loading="lazy">`;
            
            // Add click event to open lightbox
            photoItem.addEventListener('click', () => {
                openLightbox(index);
            });
            
            galleryEl.appendChild(photoItem);
        });
        
        // Hide loading, show gallery
        loadingEl.classList.add('hidden');
        galleryEl.classList.remove('hidden');
    }
    
    /**
     * Open lightbox with a specific photo
     * @param {number} index - Index of the photo to display
     */
    function openLightbox(index) {
        if (index < 0 || index >= photos.length) return;
        
        currentPhotoIndex = index;
        lightboxImg.src = photos[index].url;
        lightboxEl.classList.remove('hidden');
        
        // Update navigation button states
        updateNavButtons();
        
        // Add swipe gesture support for mobile
        setupSwipeGestures();
    }
    
    /**
     * Close the lightbox
     */
    function closeLightbox() {
        lightboxEl.classList.add('hidden');
        lightboxImg.src = '';
    }
    
    /**
     * Navigate to the previous photo
     */
    function prevPhoto() {
        if (currentPhotoIndex > 0) {
            openLightbox(currentPhotoIndex - 1);
        }
    }
    
    /**
     * Navigate to the next photo
     */
    function nextPhoto() {
        if (currentPhotoIndex < photos.length - 1) {
            openLightbox(currentPhotoIndex + 1);
        }
    }
    
    /**
     * Update navigation button states based on current photo
     */
    function updateNavButtons() {
        prevBtn.style.visibility = currentPhotoIndex > 0 ? 'visible' : 'hidden';
        nextBtn.style.visibility = currentPhotoIndex < photos.length - 1 ? 'visible' : 'hidden';
    }
    
    /**
     * Setup swipe gesture support for the lightbox
     */
    function setupSwipeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        lightboxEl.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        lightboxEl.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left, go to next photo
                nextPhoto();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right, go to previous photo
                prevPhoto();
            }
        }
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
    
    // Event listeners
    prevBtn.addEventListener('click', prevPhoto);
    nextBtn.addEventListener('click', nextPhoto);
    closeBtn.addEventListener('click', closeLightbox);
    
    // Close lightbox when clicking outside the image
    lightboxEl.addEventListener('click', e => {
        if (e.target === lightboxEl) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (lightboxEl.classList.contains('hidden')) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                prevPhoto();
                break;
            case 'ArrowRight':
                nextPhoto();
                break;
            case 'Escape':
                closeLightbox();
                break;
        }
    });
}); 