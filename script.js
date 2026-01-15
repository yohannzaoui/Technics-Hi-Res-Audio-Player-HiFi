const audio = new Audio();
audio.crossOrigin = "anonymous";
let playlist = [], currentIndex = 0;
let currentArt = "img/favicon.png", currentMeta = "Technics - Audio Systems - Professional";
let repeatMode = 0, isRandom = false, timeMode = 0, isVUOn = true;
let pointA = null, pointB = null, isPeakSearching = false;
let inputBuffer = "", inputTimeout = null, volDisplayTimeout = null;
let audioCtx, analyzer, dataArray, searchInterval = null;

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
    timeLabel.innerText = "VOLUME";
    timeSep.style.opacity = "0";
    let volPerc = Math.round(audio.volume * 100);
    const s = volPerc.toString().padStart(2, '0');
    document.getElementById('m-d1').innerText = " ";
    document.getElementById('m-d2').innerText = s.length > 2 ? s[0] : " ";
    document.getElementById('s-d1').innerText = s.length > 2 ? s[1] : s[0];
    document.getElementById('s-d2').innerText = s.length > 2 ? s[2] : s[1];
    volDisplayTimeout = setTimeout(() => {
        volDisplayTimeout = null;
        timeLabel.innerText = timeMode === 0 ? "Min : Sec" : "- Min : Sec";
        timeSep.style.opacity = "1";
        updateTimeDisplay();
    }, 2000);
}

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

document.getElementById('ab-btn').onclick = () => {
    if (playlist.length === 0) return;
    const abVfd = document.getElementById('vfd-ab');
    if (pointA === null) { 
        pointA = audio.currentTime; 
        abVfd.classList.add('active', 'vfd-input-blink'); 
    }
    else if (pointB === null) {
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
};

document.getElementById('power-reset-btn').onclick = () => {
    audio.pause(); audio.src = ""; audio.volume = 0.02;
    document.getElementById('vol-knob').style.transform = `rotate(-110deg)`;
    playlist = []; currentIndex = 0; pointA = null; pointB = null;
    document.querySelectorAll('.vfd-indicator').forEach(el => el.classList.remove('active', 'vfd-input-blink'));
    updateDig('t', 0); updateGrid();
    document.getElementById('tray-front').classList.add('open');
    showVolumeDisplay();
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

function setupKnob(id, callback) {
    const el = document.getElementById(id);
    let startY, startRot = (id === 'vol-knob' ? -110 : 0), currentRot = startRot;
    el.onmouseenter = () => { if(id === 'vol-knob') showVolumeDisplay(); };
    el.onmousedown = (e) => {
        startY = e.clientY;
        document.onmousemove = (me) => {
            let diff = (startY - me.clientY);
            currentRot = startRot + diff;
            el.style.transform = `rotate(${currentRot}deg)`;
            callback(diff);
            if(id === 'vol-knob') showVolumeDisplay();
        };
        document.onmouseup = () => { startRot = currentRot; document.onmousemove = null; };
    };
}

setupKnob('vol-knob', (diff) => { audio.volume = Math.max(0, Math.min(1, audio.volume + (diff / 5000))); });
setupKnob('jog-knob', (diff) => { if(!audio.paused) audio.currentTime += (diff / 100); });

function updateDig(prefix, val) {
    const s = Math.floor(Math.abs(val)).toString().padStart(2, '0');
    document.getElementById(`${prefix}-d1`).innerText = s[s.length-2] || "0";
    document.getElementById(`${prefix}-d2`).innerText = s[s.length-1] || "0";
}

function updateTimeDisplay() {
    if(volDisplayTimeout || isPeakSearching) return; 
    let d = timeMode === 0 ? audio.currentTime : (audio.duration || 0) - audio.currentTime;
    const mins = Math.floor(d / 60).toString().padStart(2, '0'), secs = Math.floor(d % 60).toString().padStart(2, '0');
    document.getElementById('m-d1').innerText = mins[mins.length-2] || "0";
    document.getElementById('m-d2').innerText = mins[mins.length-1] || "0";
    document.getElementById('s-d1').innerText = secs[secs.length-2] || "0";
    document.getElementById('s-d2').innerText = secs[secs.length-1] || "0";
}

function updateGrid() {
    // Condition : Playlist STRICTEMENT supérieure à 20 pour afficher la flèche rouge
    document.getElementById('over-arrow').classList.toggle('active', playlist.length > 20);
    
    for(let i=1; i<=20; i++) {
        const el = document.getElementById(`gn-${i}`);
        el.classList.toggle('loaded', i <= playlist.length);
        el.classList.toggle('active-track', i === currentIndex + 1 && playlist.length > 0);
    }
}

function loadTrack(idx) {
    if (!playlist.length) return;
    if (isRandom && idx !== currentIndex) {
        idx = Math.floor(Math.random() * playlist.length);
    }
    currentIndex = (idx + playlist.length) % playlist.length;
    audio.src = URL.createObjectURL(playlist[currentIndex]);
    updateDig('t', currentIndex + 1);
    updateGrid(); audio.play();
    document.getElementById('main-time-display').classList.remove('vfd-blink-pause'); 
    setupAudio(); extractMetadata(playlist[currentIndex]);
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
            } else currentArt = "img/favicon.png";
        }
    });
}

document.getElementById('file-input').onchange = (e) => { 
    playlist = Array.from(e.target.files); 
    if(playlist.length) { document.getElementById('tray-front').classList.remove('open'); loadTrack(0); }
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
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = audioCtx.createMediaElementSource(audio);
    analyzer = audioCtx.createAnalyser(); analyzer.fftSize = 64;
    src.connect(analyzer); analyzer.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyzer.frequencyBinCount);
    renderVU();
}

function renderVU() {
    requestAnimationFrame(renderVU);
    if (!analyzer || !isVUOn || isPeakSearching) return;
    analyzer.getByteFrequencyData(dataArray);
    ['meter-L', 'meter-R'].forEach((id, idx) => {
        const el = document.getElementById(id);
        const val = Math.floor((dataArray[idx + 2] / 255) * 40);
        for (let i = 0; i < 40; i++) el.children[i].className = 'meter-segment' + (i < val ? (i > 34 ? ' on-red' : ' on-blue') : '');
    });
}

['meter-L', 'meter-R'].forEach(id => {
    const el = document.getElementById(id);
    for(let i=0; i<40; i++) el.appendChild(document.createElement('div')).className = 'meter-segment';
});

audio.volume = 0.02;