// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const captureButton = document.getElementById('capture-btn');
const flash = document.querySelector('.flash');
const countdown = document.getElementById('countdown');
const debugOverlay = document.getElementById('debug-overlay');
const debugResolution = document.getElementById('debug-resolution');
const debugFps = document.getElementById('debug-fps');
const debugFrameTime = document.getElementById('debug-frame-time');
const debugAspect = document.getElementById('debug-aspect');
const errorOverlay = document.getElementById('error-overlay');
const cameraSelect = document.getElementById('camera-select');
const reviewTimeInput = document.getElementById('review-time');
const showButtonInput = document.getElementById('show-button');
const reviewProgress = document.getElementById('review-progress');
const qrCodeContainer = document.getElementById('qr-code-container');
const qrCodeElement = document.getElementById('qr-code');

// Debug state
let isDebugVisible = localStorage.getItem('debugVisible') === 'true';
let frameCount = 0;
let lastVideoTimestamp = 0;
let lastFpsUpdate = 0;
let currentFps = 0;

// Load persisted settings
const reviewTime = parseFloat(localStorage.getItem('reviewTime')) || 3;
const showButton = localStorage.getItem('showButton') !== 'false'; // Default to true if not set

// Initialize debug settings
reviewTimeInput.value = reviewTime;
showButtonInput.checked = showButton;
if (!showButton) {
    captureButton.classList.add('hidden');
}

// Handle review time change
reviewTimeInput.addEventListener('change', () => {
    const value = parseFloat(reviewTimeInput.value);
    if (value >= 1 && value <= 10) {
        localStorage.setItem('reviewTime', value);
    }
});

// Handle show button change
showButtonInput.addEventListener('change', () => {
    const value = showButtonInput.checked;
    localStorage.setItem('showButton', value);
    captureButton.classList.toggle('hidden', !value);
});

// Connection state
let isReconnecting = false;
let reconnectAttempt = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000; // 2 seconds

// Camera settings
const constraints = {
    video: {
        width: { min: 1280, ideal: 2560, max: 3840 },
        height: { min: 720, ideal: 1440, max: 2160 },
        facingMode: 'user',
        aspectRatio: 16/9,
        frameRate: { ideal: 30 }
    }
};

// WebSocket connection
let ws;
let wsReconnectTimer;

// Session state
let currentSessionId = null;
let sessionGalleryUrl = null;

// Initialize WebSocket connection
function initWebSocket() {
    // Close existing connection if any
    if (ws) {
        ws.close();
    }

    // Create new WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
        console.log('WebSocket connected');
        if (wsReconnectTimer) {
            clearTimeout(wsReconnectTimer);
            wsReconnectTimer = null;
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 2 seconds
        wsReconnectTimer = setTimeout(initWebSocket, 2000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            
            // Handle session timeout message
            if (message.type === 'session_timeout' && message.sessionId === currentSessionId) {
                // Hide QR code when session times out
                qrCodeContainer.style.display = 'none';
                currentSessionId = null;
                sessionGalleryUrl = null;
            }
            // Handle trigger message
            else if (message.type === 'trigger' && !captureButton.disabled) {
                startCountdownAndCapture();
            }
        } catch (err) {
            console.error('Error processing WebSocket message:', err);
        }
    };
}

// Initialize debug overlay visibility
if (isDebugVisible) {
    debugOverlay.classList.add('visible');
}

// Populate camera select dropdown
async function populateCameraSelect() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        // Clear existing options
        cameraSelect.innerHTML = '';
        
        // Add options for each camera
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.length + 1}`;
            cameraSelect.appendChild(option);
        });

        // Select the saved camera if it exists
        const savedCameraId = localStorage.getItem('selectedCamera');
        if (savedCameraId) {
            const exists = Array.from(cameraSelect.options).some(option => option.value === savedCameraId);
            if (exists) {
                cameraSelect.value = savedCameraId;
            }
        }
    } catch (err) {
        console.error('Error enumerating devices:', err);
    }
}

// Handle camera selection change
async function handleCameraChange() {
    const selectedCamera = cameraSelect.value;
    localStorage.setItem('selectedCamera', selectedCamera);

    // Update constraints with selected camera
    const newConstraints = {
        ...constraints,
        video: {
            ...constraints.video,
            deviceId: { exact: selectedCamera }
        }
    };

    try {
        // Stop all tracks
        if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }

        // Start new stream with selected camera
        const stream = await navigator.mediaDevices.getUserMedia(newConstraints);
        video.srcObject = stream;
        setupStreamMonitoring(stream);

        // Update debug info
        const track = stream.getVideoTracks()[0];
        console.log('Selected camera settings:', track.getSettings());
    } catch (err) {
        console.error('Error switching camera:', err);
        handleStreamError('Camera switch failed');
    }
}

// Monitor video stream health
function setupStreamMonitoring(stream) {
    const videoTrack = stream.getVideoTracks()[0];
    
    // Handle track ending (user stops camera, device disconnected, etc.)
    videoTrack.onended = () => {
        handleStreamError('Track ended');
    };

    // Check if video is actually getting frames
    let lastTime = video.currentTime;
    const videoStallCheck = setInterval(() => {
        if (video.currentTime === lastTime && !video.paused) {
            handleStreamError('Video stalled');
            clearInterval(videoStallCheck);
        }
        lastTime = video.currentTime;
    }, 1000);

    // Clear interval when track ends
    videoTrack.onended = () => {
        clearInterval(videoStallCheck);
        handleStreamError('Track ended');
    };
}

// Handle stream errors
async function handleStreamError(reason) {
    console.error('Stream error:', reason);
    errorOverlay.classList.add('visible');
    captureButton.disabled = true;

    // Stop all tracks
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }

    // Attempt to reconnect if not already trying
    if (!isReconnecting) {
        isReconnecting = true;
        reconnectAttempt = 0;
        attemptReconnect();
    }
}

// Attempt to reconnect to camera
async function attemptReconnect() {
    if (reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Max reconnection attempts reached');
        isReconnecting = false;
        return;
    }

    reconnectAttempt++;
    console.log(`Reconnection attempt ${reconnectAttempt}/${MAX_RECONNECT_ATTEMPTS}`);

    try {
        // Get the selected camera ID
        const selectedCamera = localStorage.getItem('selectedCamera');
        
        // Use the selected camera's constraints, or fall back to default if none selected
        const reconnectConstraints = selectedCamera ? {
            ...constraints,
            video: {
                ...constraints.video,
                deviceId: { exact: selectedCamera }
            }
        } : constraints;

        const stream = await navigator.mediaDevices.getUserMedia(reconnectConstraints);
        video.srcObject = stream;
        errorOverlay.classList.remove('visible');
        captureButton.disabled = false;
        isReconnecting = false;
        reconnectAttempt = 0;
        setupStreamMonitoring(stream);
        console.log('Successfully reconnected to camera');

        // Refresh the camera list after reconnection
        await populateCameraSelect();
        
        // Ensure the dropdown shows the correct camera
        if (selectedCamera) {
            cameraSelect.value = selectedCamera;
        }
    } catch (err) {
        console.error('Reconnection failed:', err);
        setTimeout(attemptReconnect, RECONNECT_DELAY);
    }
}

// Debug stats update using video frame callback
function updateVideoStats(now, metadata) {
    const frameTime = metadata.mediaTime - lastVideoTimestamp;
    lastVideoTimestamp = metadata.mediaTime;
    frameCount++;

    // Update stats every second
    if (now - lastFpsUpdate >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        frameCount = 0;
        lastFpsUpdate = now;

        // Update debug info
        debugFps.textContent = `${currentFps}`;
        debugFrameTime.textContent = `${(frameTime * 1000).toFixed(1)}ms`;
        debugResolution.textContent = `${video.videoWidth}x${video.videoHeight}`;
        debugAspect.textContent = (video.videoWidth / video.videoHeight).toFixed(3);
    }

    // Request next video frame
    if (isDebugVisible && video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(updateVideoStats);
    }
}

// Toggle debug overlay
function toggleDebug() {
    isDebugVisible = !isDebugVisible;
    debugOverlay.classList.toggle('visible');
    localStorage.setItem('debugVisible', isDebugVisible);

    if (isDebugVisible && video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(updateVideoStats);
    }
}

// Flash animation
function triggerFlash() {
    flash.classList.remove('active');
    // Force a reflow to ensure the animation runs again
    void flash.offsetWidth;
    flash.classList.add('active');
}

// Initialize the camera
async function initCamera() {
    try {
        // First enumerate devices to get camera list and labels
        await navigator.mediaDevices.getUserMedia({ video: true });
        await populateCameraSelect();

        // Get saved camera ID or use default constraints
        const savedCameraId = localStorage.getItem('selectedCamera');
        const initialConstraints = savedCameraId ? {
            ...constraints,
            video: {
                ...constraints.video,
                deviceId: { exact: savedCameraId }
            }
        } : constraints;

        // Initialize with selected or default camera
        const stream = await navigator.mediaDevices.getUserMedia(initialConstraints);
        video.srcObject = stream;
        
        // Log the actual resolution we got
        video.onloadedmetadata = () => {
            console.log(`Camera resolution: ${video.videoWidth}x${video.videoHeight}`);
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            const settings = track.getSettings();
            console.log('Camera capabilities:', capabilities);
            console.log('Active settings:', settings);

            // Initialize debug stats if visible
            if (isDebugVisible && video.requestVideoFrameCallback) {
                video.requestVideoFrameCallback(updateVideoStats);
            } else if (isDebugVisible) {
                // Fallback for browsers that don't support requestVideoFrameCallback
                console.warn('requestVideoFrameCallback not supported - FPS measurement may be inaccurate');
                debugFps.textContent = `~${settings.frameRate || 'unknown'}`;
            }
        };

        // Setup stream monitoring
        setupStreamMonitoring(stream);

    } catch (err) {
        console.error('Error accessing camera:', err);
        handleStreamError('Initial connection failed');
    }
}

// Animate countdown number
function animateNumber(number) {
    return new Promise(resolve => {
        countdown.textContent = number;
        countdown.className = 'animate-in';
        
        // Animate in
        setTimeout(() => {
            countdown.className = 'visible';
        }, 100);
        
        // Start animate out
        setTimeout(() => {
            countdown.className = 'animate-out';
        }, 900);
        
        // Complete animation
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}

// State tracking
let reviewTimeout = null;
let isInReviewMode = false;

// Function to end review mode
function endReviewMode() {
    if (reviewTimeout) {
        clearTimeout(reviewTimeout);
        reviewTimeout = null;
    }
    if (isInReviewMode) {
        photo.style.display = 'none';
        video.style.display = 'block';
        isInReviewMode = false;
        
        // Reset and hide progress bar
        reviewProgress.style.transition = 'none';
        reviewProgress.style.transform = 'scaleX(0)';
        reviewProgress.classList.remove('active');
        
        // Note: We no longer hide the QR code here
        // The QR code will remain visible until the session times out
    }
}

// Start countdown and capture
async function startCountdownAndCapture() {
    // Don't start if button is disabled
    if (captureButton.disabled) {
        return;
    }

    // If in review mode, just end the review
    if (isInReviewMode) {
        endReviewMode();
        return;
    }

    // End any ongoing review (shouldn't be needed now but keeping for safety)
    endReviewMode();
    
    captureButton.disabled = true;
    
    // Countdown animation
    await animateNumber(3);
    await animateNumber(2);
    await animateNumber(1);
    
    // Take photo
    await capturePhoto();
    
    captureButton.disabled = false;
}

// Capture photo
async function capturePhoto() {
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    // Convert canvas to image but don't show it yet
    const imageData = canvas.toDataURL('image/jpeg', 1.0);
    photo.src = imageData;
    
    // Ensure the new image is loaded before showing it
    await new Promise(resolve => {
        photo.onload = resolve;
    });
    
    // Hide video and show flash simultaneously
    video.style.display = 'none';
    photo.style.display = 'block';
    isInReviewMode = true;
    
    // Trigger flash effect
    triggerFlash();
    
    // Save the photo
    try {
        await savePhoto(imageData);
        console.log('Photo saved successfully');
    } catch (err) {
        console.error('Error saving photo:', err);
        alert('Failed to save photo. Please try again.');
    }
    
    // Start review timer animation
    const duration = reviewTimeInput.value;
    reviewProgress.style.transition = `transform ${duration}s linear`;
    reviewProgress.classList.add('active');
    // Force a reflow to ensure the transition starts
    void reviewProgress.offsetWidth;
    reviewProgress.style.transform = 'scaleX(1)';
    
    // Set timeout for review mode
    reviewTimeout = setTimeout(() => {
        endReviewMode();
    }, duration * 1000);
}

// Save photo to server
async function savePhoto(imageData) {
    const response = await fetch('/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData })
    });
    
    if (!response.ok) {
        throw new Error('Failed to save photo');
    }
    
    const result = await response.json();
    
    // Update session information
    currentSessionId = result.sessionId;
    sessionGalleryUrl = result.galleryUrl;
    
    // Display QR code if available
    if (result.qrCodeDataUrl) {
        displayQRCode(result.qrCodeDataUrl, result.galleryUrl);
    }
    
    return result;
}

// Display QR code
function displayQRCode(dataUrl, galleryUrl) {
    // Create image element for QR code with a link wrapper
    const qrLink = document.createElement('a');
    qrLink.href = galleryUrl;
    qrLink.target = '_blank'; // Open in new tab
    qrLink.innerHTML = `<img src="${dataUrl}" alt="QR Code">`;
    
    // Clear previous content and add the new linked QR code
    qrCodeElement.innerHTML = '';
    qrCodeElement.appendChild(qrLink);
    
    // Show QR code container
    qrCodeContainer.style.display = 'block';
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Event listeners
captureButton.addEventListener('click', startCountdownAndCapture);
document.addEventListener('keydown', (e) => {
    if (e.key === 'd') {
        toggleDebug();
    } else if (e.key === ' ' && !captureButton.disabled) {
        // Prevent page scroll on space press
        e.preventDefault();
        startCountdownAndCapture();
    } else if (e.key.toLowerCase() === 'f') {
        // Toggle fullscreen
        e.preventDefault();
        toggleFullscreen();
    }
});
cameraSelect.addEventListener('change', handleCameraChange);

// Initialize camera and WebSocket when page loads
initCamera();
initWebSocket(); 