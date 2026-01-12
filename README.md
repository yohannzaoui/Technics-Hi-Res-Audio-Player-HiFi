---

# Technics SL-PS740A Digital Audio Player - Documentation

## ⚙️ Core Specifications

* "Brand: Technics"
* "Model: SL-PS740A"
* "Technology: MASH 1-BIT DAC Simulation"
* "Visual Style: Vintage VFD (Vacuum Fluorescent Display)"
* "Language: English Only"
* "Theme: Dark Mode Only"

---

## 🚀 Key Features

### 1. Advanced Time Display

* **Anti-Jumping Logic**: Implementation of a "Slot-Based" grid where each digit is contained in a fixed-width `<span>`. This prevents the UI from shifting when the digit "1" appears.
* **Dual Mode**: Toggle between "Elapsed Time" and "Remaining Time".
* **Visual Polish**: High-glow green text with a 15px radial blur for a realistic phosphor effect.

### 2. Brand Identity

* **Logo**: High-definition `Technics_logo.png` set to exactly **70px** height.
* **Relief Effect**: Custom CSS filters applied to the logo for a 3D metallic look:
`filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.8)) drop-shadow(0px 1px 0px rgba(255,255,255,0.1));`

### 3. Integrated Audio Tools

* **VU Meter**: Dual-channel (L/R) canvas-based visualizer with peak-hold simulation.
* **Jog Shuttle**: A functional range slider for manual track scrubbing with dynamic status feedback (`SEARCH >>`).
* **Indicators**:
* "SHUFFLE: Displays only the word 'SHUFFLE' when active."
* "REPEAT: Cycles through 'Repeat 1' and 'Repeat All'."
* "A-B: Visual indicator for loop points."



---

## 📂 Project Structure

> /Project-Root
> ├── **index.html** (Core application & logic)
> ├── **manifest.json** (PWA identity & icons)
> ├── **sw.js** (Service Worker for offline support)
> └── img/
> ├── Technics_logo.png (70px height)
> └── favicon_512.png (App icon & Media Artwork)

---

## 📱 PWA & Installation Guide

### 1. Features

* **Standalone Mode**: The app runs in full-screen without the browser URL bar.
* **Offline Ready**: Assets are cached by the `sw.js` (Service Worker) for instant loading.
* **OS Integration**: Control playback via the lock screen and system media widgets.

### 2. How to Install

* **On iOS (Safari)**: Tap the **Share** button → Select **"Add to Home Screen"**.
* **On Android (Chrome)**: Tap the **Three Dots** menu → Select **"Install App"**.
* **On Desktop (Chrome/Edge)**: Click the **Install Icon** in the address bar.

---

## 🛠 Recent Fixes (2026-01-12)

| Feature | Update Description |
| --- | --- |
| **PWA Support** | Added `sw.js` and `manifest.json` for full standalone installation. |
| **Logo** | Resized to **70px** for better visual balance. |
| **Navigation** | Removed vertical bars from `<<` and `>>` buttons. |
| **Stability** | Separated timer digits into individual containers to stop text movement. |
| **Shuffle** | Changed indicator label from "SHUFFLE ON" to just "SHUFFLE". |

---

## 📖 User Guide Summary

* **Jog Shuttle**: Use the bottom slider for variable-speed scrubbing.
* **A-B Repeat**: Press once for Start, twice for End, three times to Clear.
* **Time Mode**: Tap the "Time" button to toggle between Elapsed and Remaining.

---
