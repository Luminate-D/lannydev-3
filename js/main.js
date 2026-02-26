import './notes.js';
import './imadethose.js';
import './webring.js';
import './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.querySelector('.progress-container');
    const timeDisplay = document.getElementById('timeDisplay');

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    let isPlaying = false;

    audio?.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = formatTime(audio.duration);
    });

    playBtn?.addEventListener('click', () => {
        isPlaying ? audio.pause() : audio.play();
        playBtn.textContent = isPlaying ? '▶' : '⏸';
        isPlaying = !isPlaying;
    });

    audio?.addEventListener('timeupdate', () => {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + '%';
        if (isPlaying) {
            timeDisplay.textContent = formatTime(audio.currentTime);
        }
    });

    progressContainer?.addEventListener('click', e => {
        const rect = progressContainer.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });

    audio?.addEventListener('ended', () => {
        playBtn.textContent = '▶';
        isPlaying = false;
        progressBar.style.width = '0%';
        timeDisplay.textContent = formatTime(audio.duration);
    });

    document.querySelectorAll('.tonality').forEach(t => t.addEventListener('click', () => new Audio(`assets/${t.dataset.sound}`).play()));
    document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
});
