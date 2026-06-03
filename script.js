// Senior Programmer Approach: Vanilla JS Typing Engine
// No dependencies, absolute performance, high reliability.

const languages = {
    english: ["the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when"],
    spanish: ["el", "la", "de", "que", "y", "en", "un", "ser", "se", "no", "haber", "por", "con", "su", "para", "como", "estar", "tener", "todo", "pero", "más", "hacer", "o", "poder", "decir", "este", "ir", "otro", "ese", "la", "si", "me", "ya", "ver", "porque", "dar", "cuando", "él", "muy", "sin", "vez", "mucho", "saber", "qué", "sobre", "mi", "alguno", "mismo", "yo", "también"],
    programming: ["function", "const", "let", "var", "return", "if", "else", "switch", "case", "break", "continue", "for", "while", "do", "try", "catch", "finally", "throw", "async", "await", "import", "export", "class", "extends", "static", "public", "private", "protected", "interface", "type", "enum", "new", "this", "super", "typeof", "instanceof", "yield", "delete", "void", "true", "false", "null", "undefined"]
};

class TypoEngine {
    constructor() {
        this.status = 'idle'; // idle, typing, finished
        this.mode = 'words';
        this.language = 'english';
        this.targetText = '';
        this.input = '';
        this.startTime = null;
        this.endTime = null;
        this.timer = null;
        this.history = []; // [{wpm, time}]
        
        this.soundEnabled = localStorage.getItem('sound') === 'true';
        this.audioCtx = null;
        
        this.initDOM();
        this.initEvents();
        this.loadSettings();
        this.generateTest();
        this.renderKeyboard();
    }

    initDOM() {
        this.nodes = {
            body: document.body,
            words: document.getElementById('words-container'),
            input: document.getElementById('hidden-input'),
            wpm: document.getElementById('wpm-val'),
            acc: document.getElementById('acc-val'),
            time: document.getElementById('time-val'),
            pb: document.getElementById('pb-value'),
            gameView: document.getElementById('game-view'),
            resultView: document.getElementById('result-view'),
            finalWpm: document.getElementById('final-wpm'),
            finalAcc: document.getElementById('final-acc'),
            chart: document.getElementById('wpm-chart'),
            restartBtn: document.getElementById('restart-btn'),
            themeToggle: document.getElementById('theme-toggle'),
            soundToggle: document.getElementById('sound-toggle'),
            customModal: document.getElementById('custom-modal'),
            customTextarea: document.getElementById('custom-textarea'),
            customStartBtn: document.getElementById('custom-start-btn'),
            customCancelBtn: document.getElementById('custom-cancel-btn'),
            keyboard: document.getElementById('keyboard')
        };
    }

    initEvents() {
        this.nodes.input.addEventListener('input', (e) => this.handleInput(e));
        this.nodes.input.addEventListener('blur', () => {
            if (this.status !== 'finished') document.getElementById('focus-notice').style.opacity = '1';
        });
        this.nodes.input.addEventListener('focus', () => {
            document.getElementById('focus-notice').style.opacity = '0';
        });
        
        document.getElementById('typing-box').addEventListener('click', () => this.nodes.input.focus());

        this.nodes.restartBtn.addEventListener('click', () => this.restart());
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.mode = e.target.dataset.mode;
                if (this.mode === 'custom') {
                    this.nodes.customModal.style.display = 'flex';
                } else {
                    this.restart();
                }
            });
        });

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.language = e.target.dataset.lang;
                this.restart();
            });
        });

        this.nodes.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.nodes.soundToggle.addEventListener('click', () => this.toggleSound());

        this.nodes.customStartBtn.addEventListener('click', () => {
            const text = this.nodes.customTextarea.value.trim();
            if (text) {
                this.targetText = text;
                this.nodes.customModal.style.display = 'none';
                this.restart(true);
            }
        });

        this.nodes.customCancelBtn.addEventListener('click', () => {
            this.nodes.customModal.style.display = 'none';
            this.mode = 'words';
            document.querySelector('[data-mode="words"]').classList.add('active');
            document.querySelector('[data-mode="custom"]').classList.remove('active');
        });

        window.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.key === 'Enter') {
                this.restart();
            }
            // Keyboard visual feedback
            const keyNode = document.querySelector(`.kb-key[data-key="${e.key.toLowerCase()}"]`);
            if (keyNode) keyNode.classList.add('active');
            if (e.key === ' ') {
                const spaceNode = document.querySelector('.kb-key.space');
                if (spaceNode) spaceNode.classList.add('active');
            }
        });

        window.addEventListener('keyup', (e) => {
            const keyNode = document.querySelector(`.kb-key[data-key="${e.key.toLowerCase()}"]`);
            if (keyNode) keyNode.classList.remove('active');
            if (e.key === ' ') {
                const spaceNode = document.querySelector('.kb-key.space');
                if (spaceNode) spaceNode.classList.remove('active');
            }
        });
    }

    loadSettings() {
        const pb = localStorage.getItem('pb') || 0;
        this.nodes.pb.textContent = pb;
        
        const theme = localStorage.getItem('theme') || 'dark';
        this.nodes.body.setAttribute('data-theme', theme);
        this.updateThemeIcons(theme);

        this.updateSoundIcons();
    }

    generateTest() {
        if (this.mode !== 'custom') {
            const list = languages[this.language];
            const words = [];
            for (let i = 0; i < 25; i++) {
                words.push(list[Math.floor(Math.random() * list.length)]);
            }
            this.targetText = words.join(' ');
        }
        this.renderWords();
    }

    renderWords() {
        this.nodes.words.innerHTML = '';
        this.targetText.split(' ').forEach((word, wIdx) => {
            const wordEl = document.createElement('div');
            wordEl.className = 'word';
            word.split('').forEach((char, cIdx) => {
                const charEl = document.createElement('span');
                charEl.className = 'char';
                charEl.textContent = char;
                wordEl.appendChild(charEl);
            });
            // Add space char after word except last one
            if (wIdx < this.targetText.split(' ').length - 1) {
                const spaceEl = document.createElement('span');
                spaceEl.className = 'char';
                spaceEl.textContent = ' ';
                wordEl.appendChild(spaceEl);
            }
            this.nodes.words.appendChild(wordEl);
        });
        this.updateCaret();
    }

    updateCaret() {
        document.querySelectorAll('.char').forEach(el => el.classList.remove('current'));
        const chars = document.querySelectorAll('.char');
        if (chars[this.input.length]) {
            chars[this.input.length].classList.add('current');
        }
    }

    handleInput(e) {
        if (this.status === 'finished') return;
        
        const value = e.target.value;
        
        if (this.status === 'idle' && value.length > 0) {
            this.startTest();
        }

        this.input = value;
        this.playClick();
        this.validateInput();
        this.updateCaret();

        if (this.input.length >= this.targetText.length) {
            this.finishTest();
        }
    }

    validateInput() {
        const chars = document.querySelectorAll('.char');
        chars.forEach((charEl, i) => {
            if (i < this.input.length) {
                if (this.input[i] === this.targetText[i]) {
                    charEl.className = 'char correct';
                } else {
                    charEl.className = 'char incorrect';
                }
            } else {
                charEl.className = 'char';
            }
        });
    }

    startTest() {
        this.status = 'typing';
        this.startTime = Date.now();
        this.nodes.body.classList.add('typing');
        this.timer = setInterval(() => this.updateStats(), 100);
    }

    updateStats() {
        const now = Date.now();
        const duration = (now - this.startTime) / 1000;
        
        const stats = this.calculateStats(duration);
        this.nodes.wpm.textContent = stats.wpm;
        this.nodes.acc.textContent = stats.acc + '%';
        this.nodes.time.textContent = Math.floor(duration) + 's';

        // History tracking for chart
        const seconds = Math.floor(duration);
        if (seconds > this.history.length) {
            this.history.push({ wpm: stats.wpm, time: seconds });
        }
    }

    calculateStats(duration) {
        let correct = 0;
        for (let i = 0; i < this.input.length; i++) {
            if (this.input[i] === this.targetText[i]) correct++;
        }
        
        const wpm = duration > 0 ? Math.round((correct / 5) / (duration / 60)) : 0;
        const acc = this.input.length > 0 ? Math.round((correct / this.input.length) * 100) : 100;
        
        return { wpm, acc };
    }

    finishTest() {
        this.status = 'finished';
        this.endTime = Date.now();
        clearInterval(this.timer);
        this.nodes.body.classList.remove('typing');
        
        const finalStats = this.calculateStats((this.endTime - this.startTime) / 1000);
        
        // PB Check
        const currentPb = Number(localStorage.getItem('pb')) || 0;
        if (finalStats.wpm > currentPb) {
            localStorage.setItem('pb', finalStats.wpm);
            this.nodes.pb.textContent = finalStats.wpm;
        }

        this.showResults(finalStats);
    }

    showResults(stats) {
        this.nodes.gameView.style.display = 'none';
        this.nodes.resultView.style.display = 'block';
        this.nodes.finalWpm.textContent = stats.wpm;
        this.nodes.finalAcc.textContent = stats.acc + '%';
        this.drawChart();
    }

    restart(skipGeneration = false) {
        clearInterval(this.timer);
        this.status = 'idle';
        this.input = '';
        this.nodes.input.value = '';
        this.history = [];
        this.nodes.body.classList.remove('typing');
        this.nodes.gameView.style.display = 'flex';
        this.nodes.resultView.style.display = 'none';
        
        if (!skipGeneration) this.generateTest();
        else this.renderWords();

        this.nodes.wpm.textContent = '0';
        this.nodes.acc.textContent = '100%';
        this.nodes.time.textContent = '0s';
        this.nodes.input.focus();
    }

    toggleTheme() {
        const current = this.nodes.body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.nodes.body.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        this.updateThemeIcons(next);
    }

    updateThemeIcons(theme) {
        if (theme === 'dark') {
            document.querySelector('.sun-icon').style.display = 'block';
            document.querySelector('.moon-icon').style.display = 'none';
        } else {
            document.querySelector('.sun-icon').style.display = 'none';
            document.querySelector('.moon-icon').style.display = 'block';
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('sound', this.soundEnabled);
        this.updateSoundIcons();
        if (this.soundEnabled) this.initAudio();
    }

    updateSoundIcons() {
        if (this.soundEnabled) {
            document.querySelector('.volume-on').style.display = 'block';
            document.querySelector('.volume-off').style.display = 'none';
        } else {
            document.querySelector('.volume-on').style.display = 'none';
            document.querySelector('.volume-off').style.display = 'block';
        }
    }

    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playClick() {
        if (!this.soundEnabled) return;
        this.initAudio();
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    renderKeyboard() {
        const layout = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
            ['space']
        ];

        this.nodes.keyboard.innerHTML = '';
        layout.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'kb-row';
            row.forEach(key => {
                const keyEl = document.createElement('div');
                keyEl.className = `kb-key ${key === 'space' ? 'space' : ''}`;
                keyEl.dataset.key = key;
                keyEl.textContent = key === 'space' ? '' : key;
                rowEl.appendChild(keyEl);
            });
            this.nodes.keyboard.appendChild(rowEl);
        });
    }

    drawChart() {
        if (this.history.length < 2) return;
        
        const svg = this.nodes.chart;
        const width = svg.clientWidth || 600;
        const height = 200;
        const padding = 20;

        const maxWpm = Math.max(...this.history.map(h => h.wpm), 10);
        const timeRange = this.history.length;

        let points = '';
        this.history.forEach((h, i) => {
            const x = padding + (i / (timeRange - 1)) * (width - 2 * padding);
            const y = height - padding - (h.wpm / maxWpm) * (height - 2 * padding);
            points += `${x},${y} `;
        });

        svg.innerHTML = `
            <polyline points="${points}" />
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--sub-alt-color)" stroke-width="1" />
            <text x="${padding}" y="${height - 5}" fill="var(--sub-color)" font-size="10">0s</text>
            <text x="${width - padding - 20}" y="${height - 5}" fill="var(--sub-color)" font-size="10">${timeRange}s</text>
        `;
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.typo = new TypoEngine();
});
