// pas de pause en fin de playlist si on clique sur PREV/NEXT


document.getElementById('next-btn').onclick = () => {
    if (checkLock()) return;
    if (isABActive()) return;

    // Si on est sur la dernière piste et qu'on appuie sur Next
    if (currentIndex === playlist.length - 1) {
        // On force la lecture (true) pour repartir au début automatiquement
        loadTrack(0, true);
    } else {
        // Sinon, on suit la logique normale (garde la pause si on était en pause)
        loadTrack(currentIndex + 1);
    }
};

document.getElementById('prev-btn').onclick = () => {
    if (checkLock()) return;
    if (isABActive()) return;

    if (currentIndex === 0) {
        // Si on recule depuis la première piste, on va à la fin et on joue
        loadTrack(playlist.length - 1, true);
    } else {
        loadTrack(currentIndex - 1);
    }
};