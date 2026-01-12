---

# Technics SL-PS740A Digital Audio Player - Documentation

##  Core Specifications

* **Author & Owner**: Yohann Zaoui
* **Copyright**: Copyright © 2026 Yohann Zaoui. All rights reserved.
* **Brand**: Technics
* **Model**: SL-PS740A
* **Technology**: MASH 1-BIT DAC Simulation
* **Visual Style**: Vintage VFD (Vacuum Fluorescent Display)
* **Language**: English Only
* **Theme**: Dark Mode Only

---

## 🚀 Key Features

### 1. Advanced Time & Status Display

* **Anti-Jumping Logic**: Implementation of a "Slot-Based" grid where each digit is contained in a fixed-width `<span>`. This prevents the UI from shifting when the digit "1" appears.
* **Dual Mode**: Toggle between "Elapsed Time" and "Remaining Time".
* **Visual Polish**: High-glow green text with a 15px radial blur for a realistic phosphor effect.
* **Red Alert Indicators**: Active track numbers and file format info are displayed in **VFD Red** for high contrast and professional look.

### 2. Brand Identity

* **Logo**: High-definition `Technics_logo.png` set to exactly **70px** height.
* **Relief Effect**: Custom CSS filters applied to the logo for a 3D metallic look:
`filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.8));`
* **Metadata**: Author and copyright tags embedded in the HTML header for official ownership.

### 3. Integrated Audio Tools

* **VU Meter**: Dual-channel (L/R) canvas-based visualizer with peak-hold simulation and warm color gradients (Green to Red).
* **Jog Shuttle**: A functional range slider for manual track scrubbing with dynamic status feedback (`SEARCH >>`).
* **Format Info**: Real-time file extension detection (MP3, WAV, FLAC, etc.) displayed in **bright red**.
* **Indicators**:
* **SHUFFLE**: Active indicator when playback is randomized.
* **REPEAT**: Cycles through "Repeat 1" and "Repeat All".
* **A-B**: Visual indicator for loop points.



---

## 🛠 Technical Credits & Dependencies

| Library / Tool | Purpose |
| --- | --- |
| **jsmediatags** | Client-side parsing of ID3/MP4/FLAC tags to display Artist, Album, and Title. |
| **DS-Digital** | High-fidelity VFD font for the 7-segment time display. |
| **Canvas API** | Low-latency rendering of the dual-channel VU meters. |
| **Media Session API** | Synchronization with system-level playback controls and lock screen. |

### Metadata Management

The player automatically extracts embedded **Album Art** from audio files using `jsmediatags`. If a file contains no image, the system falls back to the default Technics Branding. Clicking the track name opens a high-definition modal of the artwork.

---

## 📂 Project Structure

> /Project-Root
> ├── **index.html** (Core application, Metadata & Logic)
> ├── **manifest.json** (PWA identity & icons)
> ├── **sw.js** (Service Worker for offline support)
> └── img/
> ├── **Technics_logo.png** (70px height)
> └── **favicon_512.png** (App icon & Media Artwork)

---

## 📱 PWA & Installation Guide

### 1. Features

* **Standalone Mode**: The app runs in full-screen without the browser URL bar.
* **Offline Ready**: Assets are cached by the `sw.js` (Service Worker) for instant loading.
* **OS Integration**: Control playback via the lock screen and system media widgets (Media Session API).

### 2. How to Install

* **On iOS (Safari)**: Tap the **Share** button → Select **"Add to Home Screen"**.
* **On Android (Chrome)**: Tap the **Three Dots** menu → Select **"Install App"**.
* **On Desktop (Chrome/Edge)**: Click the **Install Icon** in the address bar.

---

## 📖 User Guide

### 1. Track Navigation

* **Play/Pause**: Toggles playback. Status shows `PLAY` or `PAUSE`.
* **Next/Previous (`>>` / `<<`)**: Quick navigation between files in the playlist.
* **Stop**: Resets timer, clears A-B points, and puts the player in `STOP` mode.

### 2. Jog Shuttle (Search Mode)

* Move the slider at the bottom to scrub through the track.
* The status display will indicate search direction (`SEARCH >>` or `<< SEARCH`).
* The slider resets to 0 (neutral) automatically when released.

### 3. A-B Repeat Function

* **Press 1**: Sets Point A (Start).
* **Press 2**: Sets Point B (End) and begins looping.
* **Press 3**: Clears the loop points and resumes normal playback.

---

## 🛠 Recent Fixes (2026-01-12)

| Feature | Update Description |
| --- | --- |
| **Ownership** | Added **Yohann Zaoui** as author and copyright owner in meta tags. |
| **Format Info** | New dedicated indicator displaying file extension in **Red VFD** color. |
| **Visuals** | Active track numbers in the grid now glow in **Red** for better visibility. |
| **PWA Support** | Full integration of `sw.js` script for standalone install. |
| **Audio Logic** | Fixed volume display persistence and peak search simulation. |

---

