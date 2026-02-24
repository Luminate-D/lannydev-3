const fetchCompositions = async () => {
    return [
        {
            id: 1,
            releaseDate: '2025-11-23T00:00:00.000Z',
            name: 'Waltz in C♯ minor',
            audio: 'assets/compositions/waltzcsharp.mp3',
            pdf: 'assets/compositions/waltzcsharp.pdf',
            dedication: 'tous mes proches, amis et connaissances',
        }, {
            id: 2,
            releaseDate: '2026-02-24T00:00:00.000Z',
            name: 'Marche in A minor',
            audio: 'assets/compositions/marchaminor.mp3',
            pdf: 'assets/compositions/marchaminor.pdf',
            dedication: 'l’irréversible',
        },
    ];
};

const formatDate = (isoString) => {
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

const createAudioPlayer = (src, id) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'audio-player comp-audio-player';

    const playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.textContent = '▶';

    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressContainer.appendChild(progressBar);

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const timeDisplay = document.createElement('span');
    timeDisplay.className = 'time-display';
    timeDisplay.textContent = '0:00';

    const audio = new Audio(src);
    let isPlaying = false;

    audio.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = formatTime(audio.duration);
    });

    playBtn.addEventListener('click', () => {
        // Pause all other composition players
        document.querySelectorAll('.comp-audio-player').forEach(p => {
            if (p !== wrapper) {
                const otherBtn = p.querySelector('.play-btn');
                const otherAudio = p._audio;
                if (otherAudio && !otherAudio.paused) {
                    otherAudio.pause();
                    otherBtn.textContent = '▶';
                    p._isPlaying = false;
                }
            }
        });

        isPlaying ? audio.pause() : audio.play();
        playBtn.textContent = isPlaying ? '▶' : '⏸';
        isPlaying = !isPlaying;
    });

    audio.addEventListener('timeupdate', () => {
        const pct = (audio.currentTime / audio.duration) * 100 || 0;
        progressBar.style.width = pct + '%';
        if (isPlaying) {
            timeDisplay.textContent = formatTime(audio.currentTime);
        }
    });

    progressContainer.addEventListener('click', e => {
        const rect = progressContainer.getBoundingClientRect();
        audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });

    audio.addEventListener('ended', () => {
        playBtn.textContent = '▶';
        isPlaying = false;
        progressBar.style.width = '0%';
        timeDisplay.textContent = formatTime(audio.duration);
    });

    wrapper._audio = audio;
    wrapper._isPlaying = false;

    wrapper.appendChild(playBtn);
    wrapper.appendChild(progressContainer);
    wrapper.appendChild(timeDisplay);

    return wrapper;
};

const renderCompositions = async () => {
    const list = document.getElementById('compositionsList');
    if (!list) return;

    list.innerHTML = '<div class="comp-loading">loading...</div>';

    let compositions;
    try {
        compositions = await fetchCompositions();
    } catch {
        list.innerHTML = '<div class="comp-loading">failed to load :(</div>';
        return;
    }

    if (!compositions.length) {
        list.innerHTML = '<div class="comp-loading">nothing here yet</div>';
        return;
    }

    list.innerHTML = '';

    compositions.forEach((comp, i) => {
        const card = document.createElement('div');
        card.className = 'comp-card';

        // header: name left, dedication right
        const header = document.createElement('div');
        header.className = 'comp-header';

        const nameWrap = document.createElement('div');
        nameWrap.className = 'comp-name-wrap';

        if (comp.releaseDate) {
            const date = document.createElement('span');
            date.className = 'comp-release-date';
            date.textContent = formatDate(comp.releaseDate);
            nameWrap.appendChild(date);
        }

        const name = document.createElement('span');
        name.className = 'comp-name';
        name.textContent = comp.name;
        nameWrap.appendChild(name);

        header.appendChild(nameWrap);

        if (comp.dedication) {
            const ded = document.createElement('span');
            ded.className = 'comp-dedication';
            ded.textContent = `Á ${comp.dedication}`;
            header.appendChild(ded);
        }

        // player row: full-width player + download button
        const playerRow = document.createElement('div');
        playerRow.className = 'comp-player-row';

        const player = createAudioPlayer(comp.audio, comp.id);
        playerRow.appendChild(player);

        const downloadBtn = document.createElement('a');
        downloadBtn.className = 'comp-download-btn';
        downloadBtn.href = comp.pdf;
        downloadBtn.download = '';
        downloadBtn.textContent = 'PDF SCORE';
        downloadBtn.title = 'Download PDF score';

        const actions = document.createElement('div');
        actions.className = 'comp-actions';
        actions.appendChild(downloadBtn);
        playerRow.appendChild(actions);

        card.appendChild(header);
        card.appendChild(playerRow);

        list.appendChild(card);

        if (i < compositions.length - 1) {
            const hr = document.createElement('hr');
            hr.className = 'comp-delimiter';
            list.appendChild(hr);
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const redDotIMadeThose = document.getElementById('redDotIMadeThose');
    const compositionsOverlay = document.getElementById('compositionsOverlay');
    const compositionsOverlayCircle = document.getElementById('compositionsOverlayCircle');
    const redDotCompositionsOverlay = document.getElementById('redDotCompositionsOverlay');
    const heroIMadeThose = document.getElementById('heroIMadeThose');

    if (!redDotIMadeThose || !compositionsOverlay) return;

    let animating = false;
    let loaded = false;

    const syncCircle = () => {
        const r = redDotIMadeThose.getBoundingClientRect();
        Object.assign(compositionsOverlayCircle.style, {
            left: r.left + 'px',
            top: r.top + 'px',
            width: r.width + 'px',
            height: r.height + 'px',
        });

        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const maxDist = Math.max(
            Math.hypot(cx, cy),
            Math.hypot(window.innerWidth - cx, cy),
            Math.hypot(cx, window.innerHeight - cy),
            Math.hypot(window.innerWidth - cx, window.innerHeight - cy),
        );
        compositionsOverlayCircle.style.setProperty(
            '--comp-overlay-scale',
            Math.ceil((maxDist / (r.width / 2)) * 1.05)
        );
    };

    const toggle = (open = true) => {
        if (animating) return;
        animating = true;

        if (open) {
            syncCircle();
            compositionsOverlay.classList.add('open');
            setTimeout(() => {
                compositionsOverlay.classList.add('show-content');
                animating = false;
            }, 700);

            if (!loaded) {
                loaded = true;
                void renderCompositions();
            }
        } else {
            // Stop all audio
            document.querySelectorAll('.comp-audio-player').forEach(p => {
                if (p._audio) p._audio.pause();
            });

            compositionsOverlay.classList.remove('show-content');
            setTimeout(() => {
                compositionsOverlay.classList.remove('open');
                animating = false;
            }, 300);
        }
    };

    redDotIMadeThose.addEventListener('click', () => toggle(true));
    redDotCompositionsOverlay.addEventListener('click', () => toggle(false));
    window.addEventListener('resize', syncCircle);
    syncCircle();

    const observer = new MutationObserver(() => {
        const isOpen = compositionsOverlay.classList.contains('open');
        heroIMadeThose.style.opacity = isOpen ? '0' : '';
        heroIMadeThose.style.pointerEvents = isOpen ? 'none' : '';
    });
    observer.observe(compositionsOverlay, { attributes: true, attributeFilter: ['class'] });
});
