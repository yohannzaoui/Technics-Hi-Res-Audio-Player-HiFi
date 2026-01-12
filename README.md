---

# Technics SL-PS740A Digital Audio Player - Technical Documentation

This project is a high-fidelity web-based reproduction of the **Technics SL-PS740A** CD Player interface. It is designed as a Progressive Web App (PWA) with a focus on visual accuracy and vintage audio aesthetics.

## 🛠 Features & Capabilities

### 1. High-Fidelity Display (VFD Style)

* **Stable Digit System:** Uses a custom "slotting" system (individual `<span>` per digit) to ensure the time display remains perfectly still, even when the number "1" is displayed.
* **Technics Branding:** Integrated **70px** high-resolution logo with a realistic relief/shadow effect.
* **Integrated VU Meter:** Dual-channel (L/R) frequency visualizer based on the Web Audio API, styled after vintage vacuum fluorescent displays.
* **Status Indicators:** Real-time feedback for `PLAY`, `PAUSE`, `STOP`, and search modes.

### 2. Audio Control Engine

* **MASH 1-BIT DAC Simulation:** A visual nod to Technics' proprietary technology.
* **Jog Shuttle:** Functional slider for variable-speed track searching.
* **A-B Repeat:** Set specific loop points within a track.
* **Playback Modes:** Support for **Shuffle** (simplified display) and **Repeat** (1 / All).
* **Advanced Tools:** Includes `Auto Cue` and `Peak Search` visual simulations.

### 3. Modern Connectivity

* **Media Session API:** Seamless integration with OS-level media controls (Lock screen, Keyboard media keys, Chrome media hub).
* **PWA Ready:** Includes manifest and meta tags for "Add to Home Screen" installation on iOS and Android.
* **Responsive Dark Mode:** Strictly enforced dark theme with high-contrast VFD green (`#24ff8a`) and red (`#ff3333`) accents.

---

## 🏗 Code Structure Overview

### CSS Variables

The interface relies on a central color palette for easy maintenance:

```css
:root {
    --bg-color: #080808;
    --panel-color: #141414;
    --vfd-green: #24ff8a;
    --vfd-red: #ff3333;
}

```

### Key Logic Modules

* **Audio Context:** Initializes the `AnalyserNode` for the VU meter upon the first user interaction.
* **Time Formatting:** Calculates elapsed/remaining time and maps characters to the stable grid.
* **Playlist Management:** Handles multiple file uploads and maintains the active track state.

---

## 📂 File Requirements

To ensure the application works correctly, the following directory structure is expected:

* `index.html` (The core application)
* `manifest.json` (PWA configuration)
* `img/`
* `Technics_logo.png` (70px height recommended)
* `favicon_512.png` (For PWA and Media Session artwork)



---

## 📝 Recent Modifications (2026-01-12)

* **Logo Size:** Increased to **70px** for better brand visibility.
* **Button UI:** Removed vertical bars from `<<` and `>>` navigation buttons.
* **Timer Stability:** Implemented the character-width fix to prevent text "jumping".
* **Shuffle Logic:** Simplified the indicator text to "SHUFFLE" instead of "SHUFFLE ON".

---
