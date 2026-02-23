const NOTE_HEIGHT_PX = 105;
const MIN_NOTES_PER_PAGE = 5;

const calcNotesPerPage = () =>
    Math.max(MIN_NOTES_PER_PAGE, Math.floor(window.innerHeight * 0.65 / NOTE_HEIGHT_PX));

const fetchNotes = async (page) => {
    const res = await fetch(`https://notes.lanny.dev/notes?page=${page}&limit=${calcNotesPerPage()}`);
    return res.json();
};

const formatDate = (isoString) => {
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} – ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const renderNoteItem = (n, i, arr) => `
    <div class="note-item">
        <div class="note-timestamp">${formatDate(n.created_at)}</div>
        <p class="note-text">${n.content}</p>
    </div>
    ${i < arr.length - 1 ? '<hr class="note-delimiter">' : ''}
`;

const renderNotes = async (page) => {
    const list = document.getElementById('notesList');
    if (!list) return;

    const { notes, hasNext } = await fetchNotes(page);

    list.innerHTML = notes.length
        ? notes.map(renderNoteItem).join('')
        : '<div class="notes-empty">No more notes :(</div>';

    document.getElementById('notesPageNum').textContent = page;
    document.getElementById('notesPrev').classList.toggle('disabled', page <= 1);
    document.getElementById('notesNext').classList.toggle('disabled', !hasNext);
};


document.addEventListener('DOMContentLoaded', () => {
    const redDot        = document.getElementById('redDot');
    const overlay       = document.getElementById('overlay');
    const overlayCircle = document.querySelector('.overlay-circle');
    const redDotOverlay = document.getElementById('redDotOverlay');
    let animating = false;

    const syncCircle = () => {
        if (!overlayCircle || !redDot) return;

        const r = redDot.getBoundingClientRect();
        Object.assign(overlayCircle.style, {
            left:   r.left   + 'px',
            top:    r.top    + 'px',
            width:  r.width  + 'px',
            height: r.height + 'px',
        });

        const cx = r.left + r.width / 2;
        const cy = r.top  + r.height / 2;
        const maxDist = Math.max(
            Math.hypot(cx, cy),
            Math.hypot(window.innerWidth - cx, cy),
            Math.hypot(cx, window.innerHeight - cy),
            Math.hypot(window.innerWidth - cx, window.innerHeight - cy),
        );

        document.documentElement.style.setProperty(
            '--overlay-scale',
            Math.ceil((maxDist / (r.width / 2)) * 1.05)
        );
    };

    if (redDot && overlay && overlayCircle) {
        const toggle = (open = true) => {
            if (animating) return;
            animating = true;

            if (open) {
                syncCircle();

                overlay.classList.add('open');
                setTimeout(() => {
                    overlay.classList.add('show-content');
                    animating = false;
                }, 700);
            } else {
                overlay.classList.remove('show-content');
                setTimeout(() => {
                    overlay.classList.remove('open');
                    animating = false;
                }, 300);
            }

        }

        redDot.addEventListener('click', () => toggle(true));
        redDotOverlay.addEventListener('click', () => toggle(false));
        window.addEventListener('resize', syncCircle);
        syncCircle();
    }


    // Notes

    let currentPage = 1;
    void renderNotes(currentPage);

    document.getElementById('notesPrev')?.addEventListener('click', () => {
        if (currentPage > 1) void renderNotes(--currentPage);
    });

    document.getElementById('notesNext')?.addEventListener('click', () => {
        void renderNotes(++currentPage);
    });


    // Post note

    const postBtn      = document.getElementById('notesPostBtn');
    const notesInput   = document.getElementById('notesInput');
    let rateLimitTimer = null;

    const startRateLimit = () => {
        let seconds = 60;

        postBtn.disabled = true;
        postBtn.textContent = '1:00';

        rateLimitTimer = setInterval(() => {
            seconds--;
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            postBtn.textContent = `${m}:${String(s).padStart(2, '0')}`;

            if (seconds <= 0) {
                clearInterval(rateLimitTimer);
                rateLimitTimer = null;
                postBtn.disabled = false;
                postBtn.textContent = 'POST';
            }
        }, 1000);
    };

    const sendNote = async () => {
        const text = notesInput?.value.trim();
        if (!text || postBtn?.disabled) return;

        await fetch('https://notes.lanny.dev/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text }),
        });

        notesInput.value = '';
        void renderNotes(currentPage);
        startRateLimit();
    };

    postBtn?.addEventListener('click', sendNote);
    notesInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void sendNote();
        }
    });

});
