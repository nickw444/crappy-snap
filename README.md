# Crappy Snap (v3) 📸 📸

A modern, web-based photo booth application that combines browser-based camera capture with hardware integration for a responsive photo booth experience.

## Overview

The system architecture combines a web interface, WebSocket communication, and hardware integration to create a seamless photo capture system.

```
System Architecture:

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Web Browser   │◄────────│   Web Server    │◄────────│ Serial Handler  │
│   (Frontend)    │         │    (Node.js)    │         │    (Node.js)    │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         │                           │                           │
         │         WebSocket         │         Serial            │
         │                           │        Protocol           │
         │                           │                           │
┌────────┴────────┐          ┌───────┴─────────┐         ┌───────┴─────────┐
│  Media Capture  │          │   File System   │         │    ESP8266      │
│   (getUserMedia)│          │   (Photo Store) │         │    (Firmware)   │
└─────────────────┘          └─────────────────┘         └─────────────────┘
                                                                 │
                                                                 │
                                                         ┌───────┴─────────┐
                                                         │  Physical       │
                                                         │  Button         │
                                                         └─────────────────┘
```

### Sequence Diagram

![Sequence Diagram](./docs/sequence.png)

## Original Requirements

1. Basic photo booth functionality with live preview
2. Physical button trigger support
3. High-resolution photo capture (2K)
4. Flash effect
5. Review period for captured photos
6. Debug overlay with camera statistics
7. Support for multiple cameras
8. Fullscreen mode
9. Responsive design

## Origina Prompt

> I am creating a  party photo booth application where users will:
> 
> * see a live preview of the camera view on screen
> * be able to tap "capture" on the screen
> * when capture is tapped, a high resolution photo is taken and saved
> * the photo is then shown to the user for a short period (2-5 seconds)
> * then return to live preview.
>
> The camera will be connected to the browser via USB using Webcam (UVC) protocol. 
>
> Create me a new prototype for this web application that will;
>
> * Show the live video stream on screen 
> * Show a button that a user can click to capture the photo
> * Save the photo to disk

## Limitations Compared to Original crappy-snap

This implementation differs from the [original crappy-snap project](https://github.com/nickw444/crappy-snap/tree/4a36ef86c55dcdf6979d62239c7da82bc7a9237c) in several important ways:

**Camera Integration & Image Quality**:
- Original: Uses gphoto2 to trigger a DSLR camera, capturing full-resolution photos (RAW/high-quality JPEGs) directly from the camera's sensor to SD card
- Current: Limited to the webcam/UVC stream resolution (usually 1080p) with quality loss from multiple compression steps

**Control & Dependencies**:
- Original: Full access to camera settings (aperture, shutter speed, etc.) but requires gphoto2 and compatible DSLR
- Current: Limited camera control but works with any UVC-compatible webcam or DSLR in webcam mode

Despite these limitations, this implementation offers advantages in simplicity, broader device compatibility, and easier setup without requiring specialized camera control libraries.

**Note on Quality**: For a party photo booth where the primary goal is capturing fun moments rather than professional-quality photography, the resolution and quality provided by this implementation (up to 2K) is more than sufficient. These photos are intended to capture the spirit and enjoyment of the event, not serve as high-resolution keepsakes. The immediacy and reliability of the system outweigh the benefits of marginally higher image quality.

## Key Features

- **Live Preview**: Full-screen camera preview with support for multiple cameras
- **High Resolution**: Captures photos at up to 2K resolution
- **Hardware Integration**: ESP8266-based button interface via serial connection
- **Review Mode**: Configurable review period with progress indicator
- **Debug Overlay**: Real-time camera statistics and settings
- **Multiple Triggers**: Support for:
  - Physical button (short press)
  - Physical button (long hold)
  - Space bar
  - On-screen button
- **Responsive Design**: Scales appropriately for different screen sizes
- **Visual Feedback**: Flash effect and large countdown display

## Technical Implementation

### Frontend (Browser)
- Pure JavaScript with no external dependencies
- Media Capture and Streams API for camera access
- WebSocket for real-time communication
- CSS animations for visual effects
- Responsive design using viewport units

### Backend (Node.js)
- Express.js for web server
- WebSocket for real-time communication
- Serial port handling for ESP8266 integration
- File system management for photo storage

### Hardware Interface (ESP8266)
- Simple serial protocol
- Debounced button handling
- Support for both short and long press
- Auto-reconnection capability

## Setup and Usage

1. Install dependencies:
```bash
npm install
```

2. Flash the ESP8266:
- Upload `button_handler.ino` to your ESP8266
- Connect button between GPIO4 (ESP8266 pin 2) and GND

3. Start the server:
```bash
npm start
```

4. Start the serial handler:
```bash
npm run serial
```

## Controls

- `Space`: Take photo
- `F`: Toggle fullscreen
- `D`: Toggle debug overlay
- Physical button: Take photo
- Physical button (hold): Alternative trigger (not yet used)

## Configuration

Debug overlay (`D` key) provides access to:
- Camera selection
- Review time adjustment
- Button visibility toggle
- Real-time statistics

## Technical Notes

- Uses internal pull-up resistor on ESP8266
- WebSocket ensures low-latency triggers
- Handles camera disconnection gracefully
- Supports hot-plugging of ESP8266
- Persists settings in localStorage
- Automatically reconnects to selected camera

## Future Enhancements

Potential improvements identified:
1. Multiple button support
2. LED feedback
3. Sound effects
4. Gallery view
5. Social sharing
6. Print integration
7. Custom overlays
8. Session management 