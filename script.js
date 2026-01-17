const audio = new Audio();
audio.crossOrigin = "anonymous";
let playlist = [], currentIndex = 0;
let currentArt = "img/Technics_cover.png", currentMeta = "Technics - CD Player - SL-PS740A";
let repeatMode = 0, isRandom = false, timeMode = 0, isVUOn = true;
let pointA = null, pointB = null, isPeakSearching = false;
let inputBuffer = "", inputTimeout = null, volDisplayTimeout = null;
let audioCtx, analyzer, dataArray, searchInterval = null;
let preMuteVolume = 0.02;
let isMuted = false;
let volRepeatInterval = null;
let vuMultiplier = 1.2;
let bassFilter, trebleFilter;
let bassLevel = 0;   
let trebleLevel = 0;

const gridWrapper = document.getElementById('grid-numbers-wrapper');
for(let i=1; i<=20; i++) {
    const s = document.createElement('span'); 
    s.className='grid-num'; 
    s.id=`gn-${i}`; 
    s.innerText=i; 
    gridWrapper.appendChild(s);
}

function showVolumeDisplay() {
    if (volDisplayTimeout) clearTimeout(volDisplayTimeout);
    const timeLabel = document.getElementById('time-label');
    const timeSep = document.getElementById('time-sep');
    
    if (isMuted) {
        timeLabel.innerText = "MUTE";
        document.getElementById('m-d1').innerText = " ";
        document.getElementById('m-d2').innerText = " ";
        document.getElementById('s-d1').innerText = "0";
        document.getElementById('s-d2').innerText = "0";
    } else {
        timeLabel.innerText = "VOLUME";
        let volPerc = Math.round(audio.volume * 99);
        const s = volPerc.toString().padStart(2, '0');
        document.getElementById('m-d1').innerText = " ";
        document.getElementById('m-d2').innerText = " ";
        document.getElementById('s-d1').innerText = s[0];
        document.getElementById('s-d2').innerText = s[1];
    }
    timeSep.style.opacity = "0";
}

function hideVolumeDisplay() {
    if (isMuted) return;
    if (volDisplayTimeout) clearTimeout(volDisplayTimeout);
    const timeLabel = document.getElementById('time-label');
    const timeSep = document.getElementById('time-sep');
    timeLabel.innerText = timeMode === 0 ? "Min : Sec" : "- Min : Sec";
    timeSep.style.opacity = "1";
    updateTimeDisplay();
}

const volUp = document.getElementById('vol-up-btn');
const volDown = document.getElementById('vol-down-btn');
const muteBtn = document.getElementById('mute-btn');

[volUp, volDown].forEach(btn => {
    btn.onmouseenter = showVolumeDisplay;
    btn.onmouseleave = () => {
        stopVolRepeat();
        hideVolumeDisplay();
    };
});

function startVolRepeat(dir) {
    stopVolRepeat();
    isMuted = false;
    const adjust = () => {
        if (dir === 1) audio.volume = Math.min(1, audio.volume + (1/99));
        else audio.volume = Math.max(0, audio.volume - (1/99));
        showVolumeDisplay();
    };
    adjust();
    volRepeatInterval = setInterval(adjust, 100);
}

function stopVolRepeat() {
    if (volRepeatInterval) {
        clearInterval(volRepeatInterval);
        volRepeatInterval = null;
    }
}

volUp.onmousedown = () => startVolRepeat(1);
volUp.onmouseup = stopVolRepeat;
volDown.onmousedown = () => startVolRepeat(-1);
volDown.onmouseup = stopVolRepeat;

muteBtn.onclick = () => {
    if (!isMuted) {
        preMuteVolume = audio.volume;
        audio.volume = 0;
        isMuted = true;
        showVolumeDisplay();
    } else {
        audio.volume = preMuteVolume;
        isMuted = false;
        hideVolumeDisplay();
    }
};

function startSearch(dir) {
    if (!playlist.length || isPeakSearching) return;
    audio.muted = true;
    searchInterval = setInterval(() => {
        audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + (dir * 2)));
        updateTimeDisplay();
    }, 100);
}

function stopSearch() {
    if (searchInterval) {
        clearInterval(searchInterval);
        searchInterval = null;
        audio.muted = false;
    }
}

document.getElementById('fwd-btn').onmousedown = () => startSearch(1);
document.getElementById('fwd-btn').onmouseup = stopSearch;
document.getElementById('rew-btn').onmousedown = () => startSearch(-1);
document.getElementById('rew-btn').onmouseup = stopSearch;

document.getElementById('plus-10-btn').onclick = () => {
    if (!playlist.length) return;
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    updateTimeDisplay();
};

document.getElementById('minus-10-btn').onclick = () => {
    if (!playlist.length) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
    updateTimeDisplay();
};

document.getElementById('peak-btn').onclick = async () => {
    if (!playlist.length || isPeakSearching) return;
    isPeakSearching = true; audio.pause();
    const timeLabel = document.getElementById('time-label');
    const originalLabel = timeLabel.innerText;
    timeLabel.innerText = "PEAK SEARCH";
    document.getElementById('main-time-display').classList.add('vfd-input-blink');
    let maxVal = 0, peakTime = 0;
    const step = audio.duration / 50;
    for(let i=0; i < 50; i++) {
        audio.currentTime = i * step;
        await new Promise(r => setTimeout(r, 40));
        analyzer.getByteFrequencyData(dataArray);
        let currentMax = Math.max(...dataArray);
        if(currentMax > maxVal) { maxVal = currentMax; peakTime = audio.currentTime; }
    }
    audio.currentTime = peakTime;
    document.getElementById('main-time-display').classList.remove('vfd-input-blink');
    timeLabel.innerText = "PEAK FOUND";
    const simulatedVal = Math.floor((maxVal / 255) * 40);
    ['meter-L', 'meter-R'].forEach(id => {
        const el = document.getElementById(id);
        for (let i = 0; i < simulatedVal; i++) el.children[i].className = 'meter-segment' + (i > 34 ? ' on-red' : ' on-blue');
    });
    setTimeout(() => { timeLabel.innerText = originalLabel; isPeakSearching = false; updateTimeDisplay(); }, 2000);
};

document.getElementById('vu-btn').onclick = () => {
    isVUOn = !isVUOn;
    const labels = [document.getElementById('lbl-L'), document.getElementById('lbl-R')];
    if (!isVUOn) {
        labels.forEach(l => l.className = 'vu-label');
        ['meter-L', 'meter-R'].forEach(id => {
            const el = document.getElementById(id);
            for (let i = 0; i < 40; i++) el.children[i].className = 'meter-segment';
        });
    } else labels.forEach(l => l.className = 'vu-label on');
};


// Appelle cette fonction à chaque clic A/B
document.getElementById('ab-btn').onclick = () => {
    if (playlist.length === 0) return;
    const abVfd = document.getElementById('vfd-ab');

    if (pointA === null) { 
        pointA = audio.currentTime; 
        abVfd.classList.add('active', 'vfd-input-blink'); 
    } else if (pointB === null) {
        if (audio.currentTime > pointA) { 
            pointB = audio.currentTime; 
            abVfd.classList.remove('vfd-input-blink'); 
            abVfd.classList.add('active'); 
            audio.currentTime = pointA; 
        }
    } else { 
        pointA = null; 
        pointB = null; 
        abVfd.classList.remove('active', 'vfd-input-blink'); 
    }

    renderABLoop(); // met à jour la barre
};

document.getElementById('power-reset-btn').onclick = () => {
    audio.pause(); audio.src = ""; audio.volume = 0.02;
    playlist = []; currentIndex = 0; pointA = null; pointB = null; isMuted = false;
    document.querySelectorAll('.vfd-indicator').forEach(el => el.classList.remove('active', 'vfd-input-blink'));
    updateDig('t', 0); updateGrid();
    document.getElementById('tray-front').classList.add('open');
    showVolumeDisplay();
    setTimeout(hideVolumeDisplay, 2000);
};

document.getElementById('play-btn').onclick = () => {
    if (!playlist.length || isPeakSearching) return;
    const timeDisplay = document.getElementById('main-time-display');
    if (audio.paused) {
        audio.play();
        timeDisplay.classList.remove('vfd-blink-pause');
    } else {
        audio.pause();
        timeDisplay.classList.add('vfd-blink-pause');
    }
};

document.getElementById('stop-btn').onclick = () => { 
    audio.pause(); 
    audio.currentTime = 0; 
    document.getElementById('main-time-display').classList.remove('vfd-blink-pause'); 
    updateTimeDisplay();
};

function updateDig(prefix, val) {
    const s = Math.floor(Math.abs(val)).toString().padStart(2, '0');
    document.getElementById(`${prefix}-d1`).innerText = s[s.length-2] || "0";
    document.getElementById(`${prefix}-d2`).innerText = s[s.length-1] || "0";
}

function updateTimeDisplay() {
    const timeLabel = document.getElementById('time-label');
    if(timeLabel.innerText === "VOLUME" || timeLabel.innerText === "MUTE" || timeLabel.innerText === "VU SENSE" || timeLabel.innerText === "BASS" || 
       timeLabel.innerText === "TREBLE" ||isPeakSearching) return; 
    let d = timeMode === 0 ? audio.currentTime : (audio.duration || 0) - audio.currentTime;
    const mins = Math.floor(d / 60).toString().padStart(2, '0'), secs = Math.floor(d % 60).toString().padStart(2, '0');
    document.getElementById('m-d1').innerText = mins[mins.length-2] || "0";
    document.getElementById('m-d2').innerText = mins[mins.length-1] || "0";
    document.getElementById('s-d1').innerText = secs[secs.length-2] || "0";
    document.getElementById('s-d2').innerText = secs[secs.length-1] || "0";
}

function updateGrid() {
    // On vérifie si la playlist dépasse 20
    const hasOver20 = playlist.length > 20;
    const overArrow = document.getElementById('over-arrow');
    
    if (overArrow) {
        overArrow.classList.toggle('active', hasOver20);
    }

    // Mise à jour des petits numéros (1-20)
    for(let i=1; i<=20; i++) {
        const el = document.getElementById(`gn-${i}`);
        if (el) {
            el.classList.toggle('loaded', i <= playlist.length);
            el.classList.toggle('active-track', i === currentIndex + 1 && playlist.length > 0);
        }
    }
}

// Media Session API for Chrome/Edge
function updateMediaSession() {
    if ('mediaSession' in navigator && playlist.length > 0) {
        const currentFile = playlist[currentIndex];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentFile.name.replace(/\.[^/.]+$/, ""),
            artist: "Technics SL-PS740A",
            album: "Compact Disc Digital Audio",
            artwork: [
                { src: currentArt, sizes: '512x512', type: 'image/png' }
            ]
        });
    }
}

function loadTrack(idx) {
    if (!playlist.length) return;
    if (isRandom && idx !== currentIndex) {
        idx = Math.floor(Math.random() * playlist.length);
    }
    currentIndex = (idx + playlist.length) % playlist.length;
    const currentFile = playlist[currentIndex];
    audio.src = URL.createObjectURL(playlist[currentIndex]);
    const formatDisplay = document.getElementById('file-format-display');
    if (formatDisplay && currentFile.name) {
        // split('.') coupe le nom au point, pop() prend le dernier morceau (l'extension)
        formatDisplay.innerText = currentFile.name.split('.').pop().toUpperCase();
    }
    updateDig('t', currentIndex + 1);
    updateGrid(); 
    audio.play();
    updateMediaSession(); // Sync with Browser Controls
    document.getElementById('main-time-display').classList.remove('vfd-blink-pause'); 
    setupAudio(); 
    extractMetadata(playlist[currentIndex]);
}

if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => document.getElementById('play-btn').click());
    navigator.mediaSession.setActionHandler('pause', () => document.getElementById('play-btn').click());
    navigator.mediaSession.setActionHandler('previoustrack', () => loadTrack(currentIndex - 1));
    navigator.mediaSession.setActionHandler('nexttrack', () => loadTrack(currentIndex + 1));
    navigator.mediaSession.setActionHandler('stop', () => document.getElementById('stop-btn').click());
}

audio.onended = () => {
    if (repeatMode === 1) audio.play();
    else if (isRandom || repeatMode === 2 || currentIndex < playlist.length - 1) loadTrack(currentIndex + 1);
};

audio.ontimeupdate = () => {
    if (pointA !== null && pointB !== null && audio.currentTime >= pointB) audio.currentTime = pointA;
    updateTimeDisplay();
};

function handleNumKey(num) {
    if (!playlist.length) return;
    clearTimeout(inputTimeout);
    inputBuffer += num;
    document.getElementById('t-d1').parentElement.classList.add('vfd-input-blink');
    updateDig('t', parseInt(inputBuffer));
    if (inputBuffer.length >= 2) executeJump();
    else inputTimeout = setTimeout(() => { executeJump(); }, 2000);
}

function executeJump() {
    document.getElementById('t-d1').parentElement.classList.remove('vfd-input-blink');
    let trackNum = parseInt(inputBuffer);
    if (!isNaN(trackNum) && trackNum > 0 && trackNum <= playlist.length) loadTrack(trackNum - 1);
    else updateDig('t', currentIndex + 1);
    inputBuffer = "";
}

function extractMetadata(file) {
    jsmediatags.read(file, {
        onSuccess: (tag) => {
            const t = tag.tags;
            currentMeta = `${t.artist || "Unknown Artist"} - ${t.album || "Unknown Album"} - ${t.title || file.name}`;
            const p = t.picture;
            if (p) {
                let b64 = ""; for(let i=0; i<p.data.length; i++) b64 += String.fromCharCode(p.data[i]);
                currentArt = `data:${p.format};base64,${window.btoa(b64)}`;
            } else currentArt = "img/Technics_cover.png";
            updateMediaSession(); // Re-sync with actual tag metadata
        }
    });
}

function openPlaylist() {
    if (playlist.length === 0) return;
    const container = document.getElementById('track-list-container');
    container.innerHTML = "";
    
    playlist.forEach((file, idx) => {
        const item = document.createElement('div');
        item.className = 'track-item' + (idx === currentIndex ? ' active' : '');
        item.innerText = `${(idx + 1).toString().padStart(2, '0')}. ${file.name}`;
        item.onclick = () => {
            loadTrack(idx);
            document.getElementById('playlist-modal').style.display = 'none';
        };
        container.appendChild(item);
    });
    
    document.getElementById('playlist-modal').style.display = 'flex';
}

document.getElementById('file-input').onchange = (e) => { 
    playlist = Array.from(e.target.files); 
    if(playlist.length) { 
        document.getElementById('tray-front').classList.remove('open'); 
        loadTrack(0); 
        updateGrid(); // <--- AJOUTE CETTE LIGNE ICI
    }
};

document.getElementById('next-btn').onclick = () => loadTrack(currentIndex + 1);
document.getElementById('prev-btn').onclick = () => loadTrack(currentIndex - 1);
document.getElementById('eject-btn').onclick = () => document.getElementById('tray-front').classList.toggle('open');
document.getElementById('random-btn').onclick = () => { 
    isRandom = !isRandom; 
    document.getElementById('vfd-random').classList.toggle('active', isRandom); 
};
document.getElementById('repeat-btn').onclick = () => { 
    repeatMode = (repeatMode + 1) % 3;
    document.getElementById('vfd-repeat-1').classList.toggle('active', repeatMode === 1);
    document.getElementById('vfd-repeat-all').classList.toggle('active', repeatMode === 2);
};

document.getElementById('time-btn').onclick = () => { 
    timeMode = (timeMode + 1) % 2; 
    const label = document.getElementById('time-label');
    label.innerText = (timeMode === 0) ? "Min : Sec" : "- Min : Sec";
    updateTimeDisplay();
};

function openArt() { 
    document.getElementById('art-image').src = currentArt; 
    document.getElementById('art-info').innerText = currentMeta;
    document.getElementById('art-modal').style.display = 'flex'; 
}

function setupAudio() {
    if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
    return;
}
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = audioCtx.createMediaElementSource(audio);
    
    // Création des filtres
    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = "lowshelf";
    bassFilter.frequency.value = 200;
    bassFilter.gain.value = bassLevel;

    trebleFilter = audioCtx.createBiquadFilter();
    trebleFilter.type = "highshelf";
    trebleFilter.frequency.value = 3000;
    trebleFilter.gain.value = trebleLevel;

    // Analyseur pour le VUMètre
    analyzer = audioCtx.createAnalyser(); 
    analyzer.fftSize = 64;
    dataArray = new Uint8Array(analyzer.frequencyBinCount);

    // CHAÎNE DE CONNEXION : Source -> Bass -> Treble -> Analyser -> Sortie
    src.connect(bassFilter);
    bassFilter.connect(trebleFilter);
    trebleFilter.connect(analyzer);
    analyzer.connect(audioCtx.destination);

    renderVU();
}

function renderVU() {
    requestAnimationFrame(renderVU);
    if (!analyzer || !isVUOn || isPeakSearching) return;
    analyzer.getByteFrequencyData(dataArray);

    ['meter-L', 'meter-R'].forEach((id, idx) => {
        const el = document.getElementById(id);
        
        // --- MODIFICATION ICI ---
        // On multiplie la donnée brute par vuMultiplier avant de calculer le nombre de segments
        let rawVal = dataArray[idx + 2] * vuMultiplier; 
        const val = Math.floor((rawVal / 255) * 40);
        // -------------------------

        for (let i = 0; i < 40; i++) {
            el.children[i].className = 'meter-segment' + (i < val ? (i > 34 ? ' on-red' : ' on-blue') : '');
        }
    });
}

['meter-L', 'meter-R'].forEach(id => {
    const el = document.getElementById(id);
    for(let i=0; i<40; i++) el.appendChild(document.createElement('div')).className = 'meter-segment';
});

audio.volume = 0.02;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('PWA Service Worker Registered'))
            .catch(err => console.log('Service Worker Error', err));
    });
}


// Affiche la sensibilité au survol
function showVUSense() {
    if (volDisplayTimeout) clearTimeout(volDisplayTimeout);
    
    const timeLabel = document.getElementById('time-label');
    const timeSep = document.getElementById('time-sep');
    
    timeLabel.innerText = "VU SENSE";
    timeSep.style.opacity = "0";

    // On prépare la valeur (ex: 1.2 -> 12)
    let displayVal = Math.round(vuMultiplier * 10).toString().padStart(2, '0');
    
    document.getElementById('m-d1').innerText = " ";
    document.getElementById('m-d2').innerText = " ";
    document.getElementById('s-d1').innerText = displayVal[0];
    document.getElementById('s-d2').innerText = displayVal[1];
}

// Modifie la valeur quand on clique (et met à jour l'affichage)
function adjustVUSense(change) {
    vuMultiplier += change;
    if (vuMultiplier < 0.2) vuMultiplier = 0.2;
    if (vuMultiplier > 8.0) vuMultiplier = 8.0;
    
    showVUSense(); // Met à jour les chiffres immédiatement
}

// Lance le délai de 1.5s quand la souris quitte le bouton
function startVUTimeout() {
    if (volDisplayTimeout) clearTimeout(volDisplayTimeout);
    volDisplayTimeout = setTimeout(hideVolumeDisplay, 1500);
}

function toggleVUHatch() {
    const hatch = document.getElementById('vu-hatch-block');
    if (hatch.classList.contains('hatch-closed')) {
        hatch.classList.remove('hatch-closed');
        hatch.classList.add('hatch-open');
    } else {
        hatch.classList.remove('hatch-open');
        hatch.classList.add('hatch-closed');
    }
}


function adjustBass(change) {
    // On limite entre -10 et +10 dB
    bassLevel = Math.max(-10, Math.min(10, bassLevel + change));
    if (bassFilter) {
        bassFilter.gain.setTargetAtTime(bassLevel, audioCtx.currentTime, 0.01);
    }
    showToneDisplay("BASS", bassLevel);
}

function adjustTreble(change) {
    trebleLevel = Math.max(-10, Math.min(10, trebleLevel + change));
    if (trebleFilter) {
        trebleFilter.gain.setTargetAtTime(trebleLevel, audioCtx.currentTime, 0.01);
    }
    showToneDisplay("TREBLE", trebleLevel);
}

function showToneDisplay(label, value) {
    if (volDisplayTimeout) clearTimeout(volDisplayTimeout);
    
    const timeLabel = document.getElementById('time-label');
    const timeSep = document.getElementById('time-sep');
    
    timeLabel.innerText = label;
    timeSep.style.opacity = "0";

    // Affichage du signe (+ ou -) et de la valeur
    const sign = value >= 0 ? "+" : "-";
    const valStr = Math.abs(value).toString().padStart(2, '0');
    
    document.getElementById('m-d1').innerText = sign;
    document.getElementById('m-d2').innerText = " ";
    document.getElementById('s-d1').innerText = valStr[0];
    document.getElementById('s-d2').innerText = valStr[1];

    // Retour à l'affichage normal après 1.5s
    volDisplayTimeout = setTimeout(hideVolumeDisplay, 1500);
}

// Lance le délai de 1.5s quand la souris quitte les boutons Tone
function startToneTimeout() {
    if (volDisplayTimeout) clearTimeout(volDisplayTimeout);
    volDisplayTimeout = setTimeout(hideVolumeDisplay, 1500);
}


function toggleToneHatch() {
    const hatch = document.getElementById('tone-hatch-block');
    hatch.classList.toggle('hatch-open');
}
