// ========== Rest Timer Component ==========
const Timer = {
    overlay: null,
    intervalId: null,
    remaining: 0,
    total: 0,
    audioCtx: null,
    onComplete: null,

    show(seconds, nextInfo, onComplete) {
        this.total = seconds;
        this.remaining = seconds;
        this.onComplete = onComplete;

        const overlay = document.createElement('div');
        overlay.className = 'timer-overlay';
        overlay.id = 'timer-overlay';

        const circumference = 2 * Math.PI * 100;

        overlay.innerHTML = `
            <div class="timer-label">Descanso</div>
            <div class="timer-circle">
                <svg viewBox="0 0 220 220">
                    <circle class="timer-circle-bg" cx="110" cy="110" r="100"/>
                    <circle class="timer-circle-progress" cx="110" cy="110" r="100"
                        stroke-dasharray="${circumference}"
                        stroke-dashoffset="0"/>
                </svg>
                <div class="timer-time" id="timer-display">${this.formatTime(seconds)}</div>
            </div>
            ${nextInfo ? `<div class="timer-next">${nextInfo}</div>` : ''}
            <button class="timer-skip" id="timer-skip">Saltar</button>
            <div class="timer-add-btns">
                <button class="timer-add-btn" data-add="15">+15s</button>
                <button class="timer-add-btn" data-add="30">+30s</button>
            </div>
        `;

        document.body.appendChild(overlay);
        this.overlay = overlay;

        overlay.querySelector('#timer-skip').addEventListener('click', () => this.skip());
        overlay.querySelectorAll('.timer-add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const add = parseInt(btn.dataset.add);
                this.remaining += add;
                this.total += add;
            });
        });

        this.startCountdown();
    },

    startCountdown() {
        const circumference = 2 * Math.PI * 100;
        const display = this.overlay.querySelector('#timer-display');
        const progress = this.overlay.querySelector('.timer-circle-progress');

        this.intervalId = setInterval(() => {
            this.remaining -= 1;

            if (this.remaining <= 0) {
                this.remaining = 0;
                display.textContent = this.formatTime(0);
                this.playBeep();
                this.tryVibrate();
                clearInterval(this.intervalId);
                this.intervalId = null;

                // Auto-close after short delay
                setTimeout(() => this.dismiss(), 800);
                return;
            }

            display.textContent = this.formatTime(this.remaining);

            const fraction = 1 - (this.remaining / this.total);
            const offset = circumference * fraction;
            progress.style.strokeDashoffset = -offset;

            // Beep at 3 seconds remaining
            if (this.remaining === 3) {
                this.playBeep();
            }
        }, 1000);
    },

    skip() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.dismiss();
    },

    dismiss() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.onComplete) {
            this.onComplete();
            this.onComplete = null;
        }
    },

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}`;
    },

    tryVibrate() {
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
    },

    playBeep() {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = this.audioCtx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {
            // Audio not available, silent fallback
        }
    },

    // Pre-init audio context on user gesture (needed for iOS)
    initAudio() {
        if (!this.audioCtx) {
            try {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                // Create silent buffer to unlock audio
                const buffer = this.audioCtx.createBuffer(1, 1, 22050);
                const source = this.audioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioCtx.destination);
                source.start(0);
            } catch (e) {}
        }
    }
};
