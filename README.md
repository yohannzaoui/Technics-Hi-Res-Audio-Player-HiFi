Technics SL-PS 740 Digital Audio Player
A MASH 1-BIT DAC Inspired Web Interface
This project is a high-fidelity web-based audio player designed to replicate the aesthetic and ergonomic experience of the legendary Technics SL-PS 740 CD player from the early 1990s. It features a custom-built VFD (Vacuum Fluorescent Display) simulation and a reactive Jog Shuttle control.
📻 Key Features
1. Authentic VFD Simulation
The display panel is divided into three logical sections, mimicking the original hardware:
 * Function Line: Displays current operations (PLAYING, PAUSE, STOP, AUTO CUE, SEARCH).
 * Time Counter: A high-contrast emerald green digital clock showing elapsed or remaining time.
 * Track Info: Displays the filename of the loaded digital media in a permanent uppercase scrolling-style font.
2. Calibrated VU-Meter
Unlike standard web visualizers, this VU-meter is specifically tuned for a vintage feel:
 * Segmented Display: 22 discrete segments per channel.
 * Damping Logic: Integrated physics-based damping to simulate the slight inertia of gas-discharge displays.
 * Low Sensitivity: Calibrated with a high threshold to prevent "jitter" and provide a stable, professional level-reading experience.
3. Jog Shuttle Control
 * Velocity Search: Moving the slider allows for variable-speed scrubbing through the track.
 * Status Feedback: The display switches to SEARCH >> or << SEARCH during manipulation.
 * Auto-Reset: Upon release, the slider snaps back to center, and the display instantly restores the previous playback state (PLAYING or PAUSE).
4. Technics Specialized Functions
 * Auto Cue: Resets the laser (playback head) to the exact beginning of the track and enters pause mode.
 * Peak Search: Scans the entire audio file to find the highest volume peak and plays it for 2 seconds—a classic feature for setting recording levels.
🛠 Technical Specifications
| Feature | Specification |
|---|---|
| Core Engine | HTML5 Web Audio API |
| Visuals | HTML5 Canvas (Hardware Accelerated) |
| Compatibility | Optimized for iPadOS (Safari), Chrome, and Firefox |
| Formats | MP3, FLAC, ALAC (M4A), WAV, AAC |
| Theme | Fixed Dark Mode (VFD Fluorescent) |
🚀 How to Use
 * Load Media: Click the "LOAD AUDIO FILE" zone at the bottom to select a file from your device.
 * Playback: Use the PLAY/PAUSE/STOP buttons for standard control.
 * Navigation: * Use +10s / -10s for quick skips.
   * Use the JOG SHUTTLE slider for precise positioning.
 * Time Toggle: Click TIME to switch between elapsed time and remaining time.
 * Peak Search: Use the PEAK button to automatically find the loudest part of your song.
💾 Persistence
The player uses localStorage to remember your preferences:
 * Your preferred Time Mode (Elapsed vs Remaining) is saved automatically and restored when you reopen the browser.
> Note: This application is designed to run entirely client-side. No audio data is ever uploaded to a server; all processing happens locally on your device's 1-BIT MASH emulated logic.
> 
