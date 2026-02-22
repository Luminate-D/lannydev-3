console.log('Hello there :3');

const notesData = [];
const NOTES_PER_PAGE = 10;

const fetchNotes = async (page) => {
    const res = await fetch(`https://notes.lanny.dev/notes?page=${page}&limit=${NOTES_PER_PAGE}`);
    return await res.json();
};

const renderNotes = async (page) => {
    const list = document.getElementById('notesList');
    if (!list) return;

    const { notes, hasNext } = await fetchNotes(page);
    list.innerHTML = notes.length
        ? notes.map((n, i) => `
            <div class="note-item">
                <div class="note-timestamp">${n.created_at}</div>
                <p class="note-text">${n.text}</p>
            </div>
            ${i < notes.length - 1 ? '<hr class="note-delimiter">' : ''}
        `).join('')
        : `<div class="notes-empty">No more notes :(</div>`;

    document.getElementById('notesPageNum').textContent = page;
    document.getElementById('notesPrev').classList.toggle('disabled', page <= 1);
    document.getElementById('notesNext').classList.toggle('disabled', !hasNext);
};

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
        const m = Math.floor(audio.currentTime / 60);
        const s = Math.floor(audio.currentTime % 60);
        timeDisplay.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    });

    progressContainer?.addEventListener('click', e => {
        const rect = progressContainer.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });

    audio?.addEventListener('ended', () => {
        playBtn.textContent = '▶';
        isPlaying = false;
        progressBar.style.width = '0%';
    });

    document.querySelectorAll('.tonality').forEach(t => t.addEventListener('click', () => {
        new Audio(`assets/${t.dataset.sound}`).play();
    }));

    document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

    const redDot = document.getElementById('redDot');
    const overlay = document.getElementById('overlay');
    const overlayCircle = document.querySelector('.overlay-circle');
    const redDotOverlay = document.getElementById('redDotOverlay');
    let animating = false;

    const syncCircle = () => {
        if (!overlayCircle || !redDot) return;
        const r = redDot.getBoundingClientRect();
        Object.assign(overlayCircle.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const maxDist = Math.max(
            Math.hypot(cx, cy),
            Math.hypot(window.innerWidth - cx, cy),
            Math.hypot(cx, window.innerHeight - cy),
            Math.hypot(window.innerWidth - cx, window.innerHeight - cy)
        );
        document.documentElement.style.setProperty('--overlay-scale', Math.ceil((maxDist / (r.width / 2)) * 1.05));
    };

    redDot && overlay && overlayCircle && (() => {
        const open = () => { if (animating) return; animating = true; syncCircle(); overlay.classList.add('open'); setTimeout(() => { overlay.classList.add('show-content'); animating = false; }, 700); };
        const close = () => { if (animating) return; animating = true; overlay.classList.remove('show-content'); setTimeout(() => { overlay.classList.remove('open'); animating = false; }, 300); };
        redDot.addEventListener('click', open);
        redDotOverlay.addEventListener('click', close);
        window.addEventListener('resize', syncCircle);
        syncCircle();
    })();

    let currentPage = 1;
    renderNotes(currentPage);
    document.getElementById('notesPrev')?.addEventListener('click', () => currentPage > 1 && renderNotes(--currentPage));
    document.getElementById('notesNext')?.addEventListener('click', () => renderNotes(++currentPage));
    document.getElementById('notesPostBtn')?.addEventListener('click', async () => {
        const input = document.getElementById('notesInput');
        const text = input.value.trim();
        if (!text) return;

        await fetch('https://notes.lanny.dev/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text }),
        });

        input.value = '';
        renderNotes(currentPage);
    });
});