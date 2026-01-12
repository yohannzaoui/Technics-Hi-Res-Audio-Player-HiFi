const audio = document.getElementById('audio');
const statusFunc = document.getElementById('status-function');
const fileNameDisp = document.getElementById('file-name');
const formatInfo = document.getElementById('format-info');
const trackGrid = document.getElementById('track-grid');
const canvas = document.getElementById('vu-meter');
const ctx = canvas.getContext('2d');
const fileIn = document.getElementById('file-in');
const modal = document.getElementById('artModal');
const modalImg = document.getElementById('modalImg');

const m1 = document.getElementById('m1'), m2 = document.getElementById('m2'), 
      s1 = document.getElementById('s1'), s2 = document.getElementById('s2');

let playlist = [], currentIndex = 0, currentArtURL = "";
let audioCtx, analyser, dataArray, timeMode = 'elapsed', vuVisible = true, repeatMode = 0, isShuffle = false;
let pointA = null, pointB = null, lastVolume = 0, previousStatus = "READY";

window.onload = () => { audio.volume = 0.2; };

function changeVolume(delta) { 
    audio.volume = Math.min(1, Math.max(0, audio.volume + delta)); 
    showVolume(); 
}
function showVolume() { 
    if (!statusFunc.innerText.includes("VOLUME")) previousStatus = statusFunc.innerText; 
    statusFunc.innerText = `VOLUME: ${Math.round(audio.volume * 10)}`; 
}
function hideVolume() { statusFunc.innerText = previousStatus; }

function handleOpen() { fileIn.click(); }
fileIn.onchange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) { playlist = files; currentIndex = 0; updateTrackDisplay(); loadTrack(0); statusFunc.innerText = "READY"; }
};

function loadTrack(index) {
    const file = playlist[index];
    if (audio.src) URL.revokeObjectURL(audio.src);
    audio.src = URL.createObjectURL(file);
    formatInfo.innerText = file.name.split('.').pop().toUpperCase();
    formatInfo.style.opacity = "1";
    
    if (window.jsmediatags) {
        window.jsmediatags.read(file, {
            onSuccess: function(tag) {
                const t = tag.tags;
                fileNameDisp.innerText = `${t.artist || "UNKNOWN"} - ${t.album || "UNKNOWN"} - ${t.title || file.name}`.toUpperCase();
                if (currentArtURL) URL.revokeObjectURL(currentArtURL);
                if (t.picture) {
                    const { data, format } = t.picture;
                    currentArtURL = URL.createObjectURL(new Blob([new Uint8Array(data)], { type: format }));
                    modalImg.src = currentArtURL;
                } else { modalImg.src = "img/Technics_logo.png"; }
                updateMediaSession(t.title || file.name, t.artist || "TECHNICS", t.album || "CD PLAYER");
            },
            onError: function() { fileNameDisp.innerText = file.name.toUpperCase(); modalImg.src = "img/Technics_logo.png"; }
        });
    }
    updateTrackDisplay(); audio.load();
}

function openArtModal() { if(playlist.length > 0) modal.style.display = "flex"; }
function closeArtModal() { modal.style.display = "none"; }

function updateMediaSession(t, a, al) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: t, artist: a, album: al, artwork: [{ src: 'img/favicon_512.png', sizes: '512x512', type: 'image/png' }] });
        navigator.mediaSession.setActionHandler('play', handlePlay);
        navigator.mediaSession.setActionHandler('pause', handlePause);
        navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    }
}

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser(); analyser.fftSize = 256;
        const source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser); analyser.connect(audioCtx.destination);
        dataArray = new Uint8Array(analyser.frequencyBinCount); drawVU();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function handlePlay() { if(playlist.length > 0){ initAudio(); audio.play(); statusFunc.innerText = "PLAY"; } }
function handlePause() { audio.pause(); statusFunc.innerText = "PAUSE"; }
function handleStop() { audio.pause(); audio.currentTime = 0; statusFunc.innerText = "STOP"; pointA = pointB = null; document.getElementById('ind-ab').classList.remove('active'); }

function nextTrack() {
    if(playlist.length === 0) return;
    if(repeatMode === 1) { audio.currentTime = 0; handlePlay(); return; }
    currentIndex = isShuffle ? Math.floor(Math.random() * playlist.length) : (currentIndex + 1) % playlist.length;
    loadTrack(currentIndex); handlePlay();
}

function prevTrack() {
    if(playlist.length === 0) return;
    if(repeatMode === 1 || audio.currentTime > 3) { audio.currentTime = 0; handlePlay(); return; }
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentIndex); handlePlay();
}

function toggleShuffle() { isShuffle = !isShuffle; document.getElementById('ind-shuffle').classList.toggle('active', isShuffle); }
function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    document.getElementById('ind-repeat1').classList.toggle('active', repeatMode === 1);
    document.getElementById('ind-repeatAll').classList.toggle('active', repeatMode === 2);
}

audio.onended = () => { if(repeatMode === 1) { audio.currentTime = 0; audio.play(); } else if(repeatMode === 2 || currentIndex < playlist.length - 1) { nextTrack(); } else { handleStop(); } };
audio.ontimeupdate = () => {
    if (pointA !== null && pointB !== null && audio.currentTime >= pointB) audio.currentTime = pointA;
    let t = (timeMode === 'remaining' && audio.duration) ? (audio.duration - audio.currentTime) : audio.currentTime;
    if(isNaN(t)) t = 0;
    const mm = Math.floor(t / 60).toString().padStart(2, '0');
    const ss = Math.floor(t % 60).toString().padStart(2, '0');
    m1.innerText = mm[0]; m2.innerText = mm[1]; s1.innerText = ss[0]; s2.innerText = ss[1];
};

function drawVU() {
    requestAnimationFrame(drawVU);
    if(!analyser || !vuVisible) return;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0; for(let i = 0; i < 15; i++) sum += dataArray[i];
    let currentVol = sum / 15;
    if (currentVol < lastVolume) lastVolume -= 1.5; else lastVolume = currentVol;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const segments = 22, gap = 8, startX = 60, segW = ((canvas.width - startX) / segments) - gap;
    for(let ch = 0; ch < 2; ch++) {
        let y = (ch === 0) ? 10 : 65; 
        ctx.fillStyle = "#24ff8a"; ctx.font = "bold 32px sans-serif";
        ctx.fillText(ch === 0 ? "L" : "R", 10, y + 28);
        let level = (ch === 0) ? lastVolume : lastVolume * (0.95 + Math.random()*0.1);
        for(let i = 0; i < segments; i++) {
            let threshold = (i / segments) * 255;
            if (level > threshold && level > 10) { ctx.fillStyle = (i > 18) ? "#ff3333" : (i > 15 ? "#ff9d00" : "#24ff8a"); }
            else { ctx.fillStyle = "#111"; }
            ctx.fillRect(startX + i * (segW + gap), y, segW, 35);
        }
    }
}

function toggleTime() { timeMode = (timeMode === 'elapsed' ? 'remaining' : 'elapsed'); }
function toggleVUMode() { vuVisible = !vuVisible; document.getElementById('vu-container').style.visibility = vuVisible ? "visible" : "hidden"; }
function skip(v) { audio.currentTime += v; }
function handleAB() {
    const ind = document.getElementById('ind-ab');
    if (pointA === null) { pointA = audio.currentTime; ind.classList.add('active'); }
    else if (pointB === null) pointB = audio.currentTime;
    else { pointA = pointB = null; ind.classList.remove('active'); }
}
function doShuttle(v) { if(v != 0) { audio.currentTime += (v * 0.4); statusFunc.innerText = v > 0 ? "SEARCH >>" : "<< SEARCH"; } }
function resetShuttle() { document.getElementById('shuttle').value = 0; if (audio.src) statusFunc.innerText = audio.paused ? "PAUSE" : "PLAY"; }
function updateTrackDisplay() {
    trackGrid.innerHTML = '';
    playlist.forEach((_, i) => {
        const span = document.createElement('span');
        span.className = 'track-num' + (i === currentIndex ? ' active' : '');
        span.innerText = (i + 1);
        trackGrid.appendChild(span);
    });
}
function handleClose() {
    handleStop(); playlist = []; currentIndex = 0; audio.src = ""; fileIn.value = "";
    m1.innerText = "0"; m2.innerText = "0"; s1.innerText = "0"; s2.innerText = "0";
    statusFunc.innerText = "NO DISC"; fileNameDisp.innerText = "- - - - -";
    formatInfo.style.opacity = "0"; trackGrid.innerHTML = "";
    isShuffle = false; repeatMode = 0; modalImg.src = "img/Technics_logo.png";
    document.querySelectorAll('.ind').forEach(el => el.classList.remove('active'));
}
function runAutoCue() {
    if (playlist.length === 0) return;
    statusFunc.innerText = "AUTO CUE"; audio.pause(); audio.currentTime = 0;
    setTimeout(() => { audio.currentTime = 0.1; statusFunc.innerText = "A.CUE READY"; }, 800);
}
function runPeak() {
    if (playlist.length === 0) return;
    statusFunc.innerText = "PEAK SEARCH";
    let peakTime = audio.duration * 0.75;
    setTimeout(() => {
        audio.currentTime = peakTime; audio.play(); statusFunc.innerText = "PEAK FOUND";
        setTimeout(() => { audio.pause(); audio.currentTime = 0; statusFunc.innerText = "READY"; }, 3000);
    }, 1500);
}

// Service Worker Register
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log('SW Registration failed', err));
    });
}