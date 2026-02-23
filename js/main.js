import './notes.js';
import './imadethose.js';

document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.querySelector('.progress-container');
    const timeDisplay = document.getElementById('timeDisplay');

    let isPlaying = false;
    playBtn?.addEventListener('click', () => {
        isPlaying ? audio.pause() : audio.play();
        playBtn.textContent = isPlaying ? '▶' : '⏸';
        isPlaying = !isPlaying;
    });

    audio?.addEventListener('timeupdate', () => {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + '%';
        const m = Math.floor(audio.currentTime / 60), s = Math.floor(audio.currentTime % 60);
        timeDisplay.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    });

    progressContainer?.addEventListener('click', e => {
        const rect = progressContainer.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });

    audio?.addEventListener('ended', () => { playBtn.textContent = '▶'; isPlaying = false; progressBar.style.width = '0%'; });

    document.querySelectorAll('.tonality').forEach(t => t.addEventListener('click', () => new Audio(`assets/${t.dataset.sound}`).play()));
    document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
});
