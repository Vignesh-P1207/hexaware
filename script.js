// ===== CINEMATIC SOUND ENGINE =====
class SoundEngine {
    constructor() { this.ctx = null; }
    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        // Create reverb for cinematic depth
        this.reverb = this.ctx.createConvolver();
        const len = this.ctx.sampleRate * 2, buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.8);
        }
        this.reverb.buffer = buf;
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.3;
        this.reverb.connect(this.reverbGain);
        this.reverbGain.connect(this.ctx.destination);
    }
    _wet(node) { node.connect(this.reverb); node.connect(this.ctx.destination); }

    // Deep metallic impact tick — like a heavy clock in a sci-fi vault
    tick() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        // Sub-bass thud
        const sub = this.ctx.createOscillator(), sg = this.ctx.createGain();
        sub.type = 'sine'; sub.frequency.setValueAtTime(55, t);
        sub.frequency.exponentialRampToValueAtTime(30, t + 0.3);
        sg.gain.setValueAtTime(0.4, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        sub.connect(sg); this._wet(sg); sub.start(t); sub.stop(t + 0.3);
        // Metallic ping
        const ping = this.ctx.createOscillator(), pg = this.ctx.createGain();
        ping.type = 'triangle'; ping.frequency.setValueAtTime(2200, t);
        ping.frequency.exponentialRampToValueAtTime(800, t + 0.08);
        pg.gain.setValueAtTime(0.12, t); pg.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        ping.connect(pg); this._wet(pg); ping.start(t); ping.stop(t + 0.2);
        // Short noise transient
        const nb = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
        const nd = nb.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 4);
        const ns = this.ctx.createBufferSource(), ng = this.ctx.createGain();
        ns.buffer = nb; ng.gain.setValueAtTime(0.15, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        ns.connect(ng); ng.connect(this.ctx.destination); ns.start(t); ns.stop(t + 0.05);
    }

    // Tension riser — increasingly urgent, like a heartbeat accelerating
    tickUrgent() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        // Double-hit bass like a heartbeat
        [0, 0.08].forEach(offset => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'sine'; o.frequency.setValueAtTime(45, t + offset);
            o.frequency.exponentialRampToValueAtTime(25, t + offset + 0.15);
            g.gain.setValueAtTime(0.5, t + offset);
            g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.15);
            o.connect(g); this._wet(g); o.start(t + offset); o.stop(t + offset + 0.15);
        });
        // Dissonant steel scrape
        const scrape = this.ctx.createOscillator(), scg = this.ctx.createGain();
        scrape.type = 'sawtooth'; scrape.frequency.setValueAtTime(3000, t);
        scrape.frequency.exponentialRampToValueAtTime(150, t + 0.15);
        scg.gain.setValueAtTime(0.06, t); scg.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        scrape.connect(scg); scg.connect(this.ctx.destination); scrape.start(t); scrape.stop(t + 0.15);
        // Filtered noise hit
        const nb = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
        const nd = nb.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 3);
        const ns = this.ctx.createBufferSource(), flt = this.ctx.createBiquadFilter(), ng = this.ctx.createGain();
        ns.buffer = nb; flt.type = 'bandpass'; flt.frequency.value = 800; flt.Q.value = 5;
        ng.gain.setValueAtTime(0.2, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        ns.connect(flt); flt.connect(ng); ng.connect(this.ctx.destination); ns.start(t); ns.stop(t + 0.1);
    }

    // Cinematic explosion — layered sub-bass, debris crackle, shockwave ring
    boom() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        // LAYER 1: Sub-bass earthquake drop
        const sub = this.ctx.createOscillator(), sg = this.ctx.createGain();
        sub.type = 'sine'; sub.frequency.setValueAtTime(60, t);
        sub.frequency.exponentialRampToValueAtTime(15, t + 2.5);
        sg.gain.setValueAtTime(0.7, t); sg.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
        sub.connect(sg); sg.connect(this.ctx.destination); sub.start(t); sub.stop(t + 2.5);
        // LAYER 2: Distorted mid-range crunch
        const dist = this.ctx.createOscillator(), dg = this.ctx.createGain(), ws = this.ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x)); }
        ws.curve = curve; ws.oversample = '4x';
        dist.type = 'sawtooth'; dist.frequency.setValueAtTime(120, t);
        dist.frequency.exponentialRampToValueAtTime(25, t + 1);
        dg.gain.setValueAtTime(0.3, t); dg.gain.exponentialRampToValueAtTime(0.001, t + 1);
        dist.connect(ws); ws.connect(dg); dg.connect(this.ctx.destination); dist.start(t); dist.stop(t + 1);
        // LAYER 3: Massive noise shockwave with LP filter sweep
        const nLen = this.ctx.sampleRate * 2;
        const nb = this.ctx.createBuffer(2, nLen, this.ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = nb.getChannelData(ch);
            for (let i = 0; i < nLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nLen, 1.5);
        }
        const ns = this.ctx.createBufferSource(), flt = this.ctx.createBiquadFilter(), ng = this.ctx.createGain();
        ns.buffer = nb; flt.type = 'lowpass';
        flt.frequency.setValueAtTime(8000, t); flt.frequency.exponentialRampToValueAtTime(100, t + 1.5);
        ng.gain.setValueAtTime(0.55, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 2);
        ns.connect(flt); flt.connect(ng); this._wet(ng); ns.start(t); ns.stop(t + 2);
        // LAYER 4: High ring-out (cinematic metallic tail)
        [1480, 2960, 4440].forEach((f, i) => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'sine'; o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0.04 - i * 0.01, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 1.5 - i * 0.3);
            o.connect(g); this._wet(g); o.start(t); o.stop(t + 1.5);
        });
    }

    // Sci-fi whoosh — sweeping harmonic with stereo pan
    whoosh() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        // Harmonic sweep
        [1, 2, 3].forEach(harmonic => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain(), pan = this.ctx.createStereoPanner();
            o.type = harmonic === 1 ? 'sine' : 'triangle';
            o.frequency.setValueAtTime(100 * harmonic, t);
            o.frequency.exponentialRampToValueAtTime(1200 * harmonic, t + 0.3);
            o.frequency.exponentialRampToValueAtTime(80 * harmonic, t + 0.7);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.12 / harmonic, t + 0.15);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
            pan.pan.setValueAtTime(-1, t); pan.pan.linearRampToValueAtTime(1, t + 0.7);
            o.connect(g); g.connect(pan); this._wet(pan); o.start(t); o.stop(t + 0.7);
        });
        // Airy noise layer
        const nb = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
        const nd = nb.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / nd.length) * 0.5;
        const ns = this.ctx.createBufferSource(), flt = this.ctx.createBiquadFilter(), ng = this.ctx.createGain();
        ns.buffer = nb; flt.type = 'bandpass'; flt.frequency.setValueAtTime(500, t);
        flt.frequency.exponentialRampToValueAtTime(4000, t + 0.3);
        flt.frequency.exponentialRampToValueAtTime(200, t + 0.6);
        ng.gain.setValueAtTime(0.08, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        ns.connect(flt); flt.connect(ng); ng.connect(this.ctx.destination); ns.start(t); ns.stop(t + 0.6);
    }

    // Epic cinematic reveal — rising chord with shimmer
    reveal() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        // Majestic chord: Cmaj7 spread across octaves
        const chord = [130.81, 164.81, 196, 246.94, 261.63, 329.63, 392, 523.25];
        chord.forEach((freq, i) => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = i < 4 ? 'sine' : 'triangle';
            o.frequency.setValueAtTime(freq * 0.5, t + i * 0.08);
            o.frequency.linearRampToValueAtTime(freq, t + i * 0.08 + 0.4);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.08, t + i * 0.08 + 0.3);
            g.gain.setValueAtTime(0.08, t + i * 0.08 + 1);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 2.5);
            o.connect(g); this._wet(g); o.start(t + i * 0.08); o.stop(t + i * 0.08 + 2.5);
        });
        // Shimmer — detuned high sine pair
        [2093, 2097].forEach(f => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = 'sine'; o.frequency.value = f;
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.03, t + 0.8);
            g.gain.exponentialRampToValueAtTime(0.001, t + 3);
            o.connect(g); this._wet(g); o.start(t); o.stop(t + 3);
        });
    }

    // "GO!" — massive cinematic riser hit
    go() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        // Riser sweep
        const rise = this.ctx.createOscillator(), rg = this.ctx.createGain();
        rise.type = 'sawtooth'; rise.frequency.setValueAtTime(80, t);
        rise.frequency.exponentialRampToValueAtTime(3000, t + 0.25);
        rg.gain.setValueAtTime(0.25, t); rg.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        rise.connect(rg); rg.connect(this.ctx.destination); rise.start(t); rise.stop(t + 0.35);
        // Impact hit
        const hit = this.ctx.createOscillator(), hg = this.ctx.createGain();
        hit.type = 'sine'; hit.frequency.setValueAtTime(50, t + 0.25);
        hit.frequency.exponentialRampToValueAtTime(20, t + 0.7);
        hg.gain.setValueAtTime(0.6, t + 0.25); hg.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
        hit.connect(hg); this._wet(hg); hit.start(t + 0.25); hit.stop(t + 0.7);
        // Noise crash
        const nb = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.3, this.ctx.sampleRate);
        const nd = nb.getChannelData(0);
        for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 3);
        const ns = this.ctx.createBufferSource(), ng = this.ctx.createGain();
        ns.buffer = nb; ng.gain.setValueAtTime(0.3, t + 0.25);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        ns.connect(ng); ng.connect(this.ctx.destination); ns.start(t + 0.25); ns.stop(t + 0.55);
    }
}

// ===== HACKATHON REVEAL CONTROLLER =====
class HackathonReveal {
    constructor() {
        this.screens = {
            click: document.getElementById('click-screen'),
            countdown: document.getElementById('countdown-screen'),
            burst: document.getElementById('burst-screen'),
            assemble: document.getElementById('assemble-screen'),
            reveal: document.getElementById('reveal-screen')
        };
        this.sound = new SoundEngine();
        this.isStarted = false;
        this.init();
    }

    init() {
        this.initParticles('particle-canvas');
        this.screens.click.addEventListener('click', () => {
            if (!this.isStarted) {
                this.isStarted = true;
                this.sound.init();
                this.runLoadingBar();
            }
        });
    }

    async runLoadingBar() {
        const title = document.getElementById('loading-title');
        if (title) title.textContent = 'INITIALIZING CORE ASSETS...';
        const bar = document.getElementById('loading-bar');
        const pct = document.getElementById('loading-percent');
        let progress = 0;
        await new Promise(resolve => {
            const iv = setInterval(() => {
                progress += Math.random() * 4 + 1;
                if (progress >= 100) { progress = 100; clearInterval(iv); resolve(); }
                if (bar) bar.style.width = progress + '%';
                if (pct) pct.textContent = Math.floor(progress) + '%';
                if (title && progress > 40 && progress < 80) title.textContent = 'ESTABLISHING CONNECTION...';
                if (title && progress >= 80) title.textContent = 'SYNCING DATA...';
            }, 50);
        });
        if (title) title.textContent = 'SYSTEM READY.';
        await this.sleep(400);
        this.startSequence();
    }

    initParticles(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
                size: Math.random() * 2 + .5, alpha: Math.random() * .4 + .1
            });
        }
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(153,194,232,${p.alpha})`; ctx.fill();
            });
            for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(153,194,232,${.06 * (1 - dist / 100)})`; ctx.lineWidth = .5; ctx.stroke();
                }
            }
            requestAnimationFrame(animate);
        };
        animate();
        window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
    }

    switchScreen(from, to) {
        this.screens[from].classList.remove('active');
        this.screens[to].classList.add('active');
    }

    async startSequence() {
        await this.sleep(200);
        this.switchScreen('click', 'countdown');
        this.initParticles('countdown-particles');
        // Play the countdown audio file
        this.countdownAudio = new Audio('audio.mp3');
        this.countdownAudio.volume = 1;
        this.countdownAudio.play().catch(() => { });
        await this.runCountdown();
        // Stop countdown audio when done
        if (this.countdownAudio) { this.countdownAudio.pause(); this.countdownAudio = null; }
        this.switchScreen('countdown', 'burst');
        this.sound.boom();
        await this.runBurst();
        this.switchScreen('burst', 'assemble');
        this.initParticles('assemble-canvas');
        this.sound.whoosh();
        await this.runAssemble();
        this.switchScreen('assemble', 'reveal');
        this.initParticles('reveal-particles');
        this.sound.reveal();
        await this.runReveal();
    }

    async runCountdown() {
        const numEl = document.getElementById('countdown-number');
        const labelEl = document.getElementById('countdown-label');
        const unitEl = document.getElementById('countdown-unit');
        for (let i = 10; i >= 1; i--) {
            numEl.textContent = i;
            numEl.style.animation = 'none'; void numEl.offsetWidth;
            numEl.style.animation = 'countPulse 0.8s ease-out';
            if (i <= 3) {
                numEl.style.background = 'linear-gradient(180deg,#ff6a00,#ff3d00 40%,#cc2200)';
                numEl.style.webkitBackgroundClip = 'text'; numEl.style.backgroundClip = 'text';
                numEl.style.filter = 'drop-shadow(0 0 60px rgba(255,50,0,.9))';
                labelEl.style.color = 'rgba(255,106,0,.9)';
                this.screenShake(this.screens.countdown, i);
            } else if (i <= 5) {
                numEl.style.filter = 'drop-shadow(0 0 40px rgba(255,106,0,.6))';
            }
            await this.sleep(i <= 3 ? 650 : i <= 5 ? 800 : 900);
        }
        this.sound.go();
        numEl.textContent = 'GO!'; labelEl.textContent = ''; unitEl.textContent = '';
        numEl.style.fontSize = 'clamp(100px,20vw,200px)';
        numEl.style.background = 'linear-gradient(180deg,#ff6a00,#ff3d00)';
        numEl.style.webkitBackgroundClip = 'text'; numEl.style.backgroundClip = 'text';
        numEl.style.filter = 'drop-shadow(0 0 80px rgba(255,106,0,1))';
        numEl.style.animation = 'none'; void numEl.offsetWidth;
        numEl.style.animation = 'countPulse 0.5s ease-out';
        await this.sleep(500);
    }

    screenShake(screen, intensity) {
        const amt = (4 - intensity) * 5; let n = 6;
        const iv = setInterval(() => {
            screen.style.transform = `translate(${(Math.random() - .5) * amt}px,${(Math.random() - .5) * amt}px)`;
            if (--n <= 0) { clearInterval(iv); screen.style.transform = ''; }
        }, 50);
    }

    async runBurst() {
        const canvas = document.getElementById('burst-canvas'), ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const cx = canvas.width / 2, cy = canvas.height / 2;
        document.getElementById('flash-overlay').classList.add('active');
        this.createDebris();
        const parts = [], colors = ['#f27e52', '#e05a2a', '#99c2e8', '#0f4475', '#fff', '#ffcc00', '#f27e52'];
        for (let i = 0; i < 180; i++) {
            const a = (Math.PI * 2 / 180) * i + (Math.random() - .5) * .5, s = Math.random() * 8 + 3;
            parts.push({
                x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
                size: Math.random() * 5 + 2, color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1, decay: Math.random() * .015 + .006
            });
        }
        let shockR = 0, shockA = 1, frame = 0;
        const anim = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (shockA > 0) {
                ctx.beginPath(); ctx.arc(cx, cy, shockR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(242,126,82,${shockA})`; ctx.lineWidth = 3; ctx.stroke();
                ctx.beginPath(); ctx.arc(cx, cy, shockR * .7, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(153,194,232,${shockA * .4})`; ctx.lineWidth = 2; ctx.stroke();
                shockR += 14; shockA -= .025;
            }
            parts.forEach(p => {
                ctx.globalAlpha = p.alpha; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 12; ctx.fill();
                ctx.shadowBlur = 0; ctx.globalAlpha = 1;
                p.x += p.vx; p.y += p.vy; p.vx *= .98; p.vy *= .98; p.alpha -= p.decay; p.size *= .99;
            });
            if (frame < 25) {
                const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
                g.addColorStop(0, `rgba(255,255,255,${Math.max(0, 1 - frame / 25)})`);
                g.addColorStop(.3, `rgba(255,106,0,${Math.max(0, .5 - frame / 50)})`);
                g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            if (++frame < 80) requestAnimationFrame(anim);
        };
        anim();
        await this.sleep(1600);
    }

    createDebris() {
        const c = document.getElementById('debris-container'); c.innerHTML = '';
        const cols = ['#f27e52', '#e05a2a', '#99c2e8', '#0f4475', '#fff', '#ffcc00'];
        for (let i = 0; i < 35; i++) {
            const el = document.createElement('div'); el.classList.add('debris');
            const a = Math.random() * Math.PI * 2, d = Math.random() * 500 + 200;
            el.style.setProperty('--tx', `${Math.cos(a) * d}px`);
            el.style.setProperty('--ty', `${Math.sin(a) * d}px`);
            el.style.setProperty('--rot', `${(Math.random() - .5) * 1440}deg`);
            el.style.setProperty('--size', `${Math.random() * 10 + 4}px`);
            el.style.setProperty('--duration', `${Math.random() * .8 + .6}s`);
            el.style.setProperty('--color', cols[Math.floor(Math.random() * cols.length)]);
            c.appendChild(el);
            requestAnimationFrame(() => el.classList.add('animate'));
        }
    }

    async runAssemble() {
        await this.sleep(300);
        document.getElementById('assemble-logo').classList.add('visible');
        await this.sleep(800);
        document.getElementById('assemble-text').classList.add('visible');
        this.sound.whoosh();
        await this.sleep(600);
        document.getElementById('assemble-presents').classList.add('visible');
        await this.sleep(1200);
    }

    async runReveal() {
        await this.sleep(200);
        document.getElementById('logo-container').classList.add('visible');
        await this.sleep(600);
        document.getElementById('hackathon-title').classList.add('visible');
        this.sound.reveal();
        await this.sleep(800);
        document.getElementById('quote-section').classList.add('visible');
    }

    sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

window.addEventListener('DOMContentLoaded', () => new HackathonReveal());
