'use strict';

const MOODS = {
    easy: { 
        tiempo: 90, 
        palabras: ["DRIVE", "BOARD", "CABLE", "MOUSE", "PANEL", "CHIPS", "TOUCH", "POWER", "RESET", "INPUT", "PRINT", "CLICK", "FILES", "SETUP", "SOUND"] 
    },
    medium: { 
        tiempo: 60, 
        palabras: ["ARRAY", "LOGIC", "BUILD", "DEBUG", "TRACE", "STACK", "QUEUE", "SCOPE", "ASYNC", "FETCH", "CONST", "QUERY", "INDEX", "PATCH", "SHELL"] 
    },
    hard: { 
        tiempo: 30, 
        palabras: ["PROXY", "CLOUD", "NODES", "PORTS", "ADMIN", "TOOLS", "TOKEN", "CACHE", "LOGIN", "HTTPS", "LINUX", "MODEM", "WIFIS", "VAULT", "ROOTS"] 
    }
};

let palabraSecreta = "";
let tiempoRestante = 0;
let timerId = null;
let rachaActual = 0;
let modoActual = "";
let rachaMax = localStorage.getItem("shadowCodeStreak") || 0;

let isMuted = false;
const bgMusic = document.getElementById("bg-music");
const alarmSound = document.getElementById("alarm-sound");

const SOUNDS = {
    menu: "sounds.game/menu-music.mp3",
    game: "sounds.game/game-music.mp3",
    alarm: "sounds.game/alarm-music.mp3"
};

function showScreen(screenId) {
    const screens = ['mode-selection', 'game-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'flex';
}

function startGame(diff) {
    modoActual = diff;
    const config = MOODS[diff];
    palabraSecreta = config.palabras[Math.floor(Math.random() * config.palabras.length)];
    tiempoRestante = config.tiempo;

    showScreen("game-screen");
    
    const board = document.getElementById("board");
    if (board) board.innerHTML = "";
    const inputGuess = document.getElementById("user-guess");
    if (inputGuess) {
        inputGuess.disabled = false;
        inputGuess.value = "";
        inputGuess.style.color = "";
        inputGuess.style.borderColor = "";
    }
    document.body.classList.remove("win-active", "alarm-active");
    const timerSpan = document.getElementById("timer");
    if (timerSpan) timerSpan.textContent = tiempoRestante;

    const modeTitleElem = document.getElementById("game-mode-title");
    if (modeTitleElem) {
        let modeName = "", modeColor = "";
        switch(diff) {
            case 'easy': modeName = "MODO JUNIOR"; modeColor = "#00ff88"; break;
            case 'medium': modeName = "MODO AGENTE"; modeColor = "#ffcc00"; break;
            case 'hard': modeName = "MODO NETRUNNER"; modeColor = "#ff3366"; break;
        }
        modeTitleElem.textContent = modeName;
        modeTitleElem.style.color = modeColor;
        modeTitleElem.style.textShadow = `0 0 8px ${modeColor}`;
        modeTitleElem.setAttribute('data-mode', diff);
    }

    const statusElem = document.getElementById("game-status");
    if (statusElem) statusElem.textContent = "Estado: Operando Hackeo";

    const oldCanvas = document.getElementById("matrix-canvas");
    if (oldCanvas) {
        clearInterval(oldCanvas.dataset.rainId);
        oldCanvas.remove();
    }

    startTimer();
    alarmSound.pause();
    alarmSound.currentTime = 0;
    playMusic('game');
}

function startTimer() {
    clearInterval(timerId);
    timerId = setInterval(() => {
        if (tiempoRestante > 0) {
            tiempoRestante--;
            const timerSpan = document.getElementById("timer");
            if (timerSpan) timerSpan.textContent = tiempoRestante;
        } else {
            gameOver(false);
        }
    }, 1000);
}

function procesarIntento() {
    const entrada = document.getElementById("user-guess");
    if (!entrada) return;
    const suposicion = entrada.value.toUpperCase();
    const tablero = document.getElementById("board");
    if (suposicion.length !== 5) return;

    const listaPalabrasModo = MOODS[modoActual].palabras;

    if (!listaPalabrasModo.includes(suposicion)) {
        entrada.style.color = "#ff4d4d";
        entrada.style.borderColor = "#ff4d4d";
        entrada.classList.add("error-shake");
        setTimeout(() => entrada.classList.remove("error-shake"), 500);
        return;
    } else {
        entrada.style.color = "#22d3ee";
        entrada.style.borderColor = "#22d3ee";
    }

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 5; i++) {
        const cuadro = document.createElement("div");
        cuadro.classList.add("tile");
        cuadro.textContent = suposicion[i];
        if (suposicion[i] === palabraSecreta[i]) {
            cuadro.classList.add("correct");
        } else if (palabraSecreta.includes(suposicion[i])) {
            cuadro.classList.add("partial");
        }
        fragment.appendChild(cuadro);
    }
    tablero.appendChild(fragment);

    entrada.value = "";
    if (suposicion === palabraSecreta) {
        rachaActual++;
        if (rachaActual > rachaMax) {
            rachaMax = rachaActual;
            localStorage.setItem("shadowCodeStreak", rachaMax);
        }
        gameOver(true);
    }
}

function gameOver(exito) {
    clearInterval(timerId);
    bgMusic.pause();
    alarmSound.pause();
    alarmSound.currentTime = 0;

    const overlay = document.getElementById("overlay");
    if (!overlay) return;
    overlay.classList.remove("hidden");
    overlay.innerHTML = "";

    if (exito) {
        document.body.classList.add("win-active");
        matrixRain(true);

        const victoryHTML = `
            <div class="victory-panel">
                <h1>🔓 ACCESO CONCEDIDO</h1>
                <div class="victory-subtitle">SISTEMA INFILTRADO CON ÉXITO</div>
                <div class="victory-stats">
                    <div class="stat-item"><span class="stat-label">ESTADO</span><span class="stat-value compromise">COMPROMETIDO</span></div>
                    <div class="stat-item"><span class="stat-label">RACHA ACTUAL</span><span class="stat-value">${rachaActual}x 🔥</span></div>
                    <div class="stat-item"><span class="stat-label">RÉCORD UNERG</span><span class="stat-value">${rachaMax}x</span></div>
                </div>
                <div class="victory-buttons">
                    <button class="btn-victory primary" onclick="reiniciarJuego()">NUEVA INFILTRACIÓN</button>
                    <button class="btn-victory secondary" onclick="window.location.reload()">VOLVER AL NÚCLEO</button>
                </div>
                <div class="victory-footer">PROTOCOLO DE VICTORIA EJECUTADO POR: CSIRT-UNERG</div>
            </div>
        `;
        overlay.innerHTML = victoryHTML;
    } 
    else {
        // === DERROTA MEJORADA ===
        rachaActual = 0;
        document.body.classList.add("alarm-active");
        if (!isMuted) {
            alarmSound.src = SOUNDS.alarm;
            alarmSound.volume = 0.4;
            alarmSound.play().catch(e => console.log);
        }

        const central = document.createElement("div");
        central.className = "defeat-central";
        central.innerHTML = `
            <div class="defeat-icon">⛔</div>
            <h2>ACCESO DENEGADO</h2>
            <p>Has sido detectado. La sesión ha sido terminada.</p>
            <div class="defeat-stats">
                <div>RACHA PERDIDA: <span>${rachaActual}x</span></div>
            </div>
            <button class="btn-defeat" onclick="location.reload()">REINFILTRARSE</button>
        `;
        overlay.appendChild(central);
        
        const numVentanas = 4;
        for (let i = 0; i < numVentanas; i++) {
            const win = document.createElement("div");
            win.className = "error-window";
            const positions = [
                {top:  "40%", left: "15%"},               
                { top: "15%", left: "10%" },
                { top: "55%", left: "65%" },
                { top: "30%", left: "75%" }
            ];

            win.style.top = positions[i].top;
            win.style.left = positions[i].left;
            win.style.zIndex = 10000 + i;
            win.style.animationDelay = `${i * 0.1}s`;
            
            const sessionId = Math.random().toString(16).toUpperCase().substring(2, 8);
            win.innerHTML = `
                <div class="error-header">
                    <span>⚠️ CRITICAL_ERROR.EXE</span>
                    <span>✖</span>
                </div>
                <div class="error-body">
                    <div class="error-alert">ALERTA</div>
                    <p>INTRUSO DETECTADO</p>
                    <div class="error-incident">
                        INCIDENTE: #${sessionId}<br>
                        ESTADO: SISTEMA COMPROMETIDO
                    </div>
                    <button class="error-retry" onclick="location.reload()">REINTENTAR</button>
                </div>
            `;
            overlay.appendChild(win);
        }
    }
}

function matrixRain(isVictory = true) {
    const oldCanvas = document.getElementById("matrix-canvas");
    if (oldCanvas) oldCanvas.remove();
    
    const canvas = document.createElement("canvas");
    canvas.id = "matrix-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "9995";
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$";
    const fontSize = 28;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ff88";
        ctx.font = `bold ${fontSize}px "Fira Mono", monospace`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00ff88";
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        ctx.shadowBlur = 0;
    }
    const rainId = setInterval(draw, 35);
    canvas.dataset.rainId = rainId;
}

function reiniciarJuego() {
    const overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.add("hidden");
    
    const canvas = document.getElementById("matrix-canvas");
    if (canvas) {
        if (canvas.dataset.rainId) clearInterval(parseInt(canvas.dataset.rainId));
        canvas.remove();
    }
    document.body.classList.remove("win-active", "alarm-active");
    if (modoActual) {
        startGame(modoActual);
    } else {
        showScreen("mode-selection");
    }
}

function playMusic(type) {
    if (SOUNDS[type]) bgMusic.src = SOUNDS[type];
    bgMusic.volume = 0.5;
    if (!isMuted && bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Autoplay bloqueado"));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const particlesContainer = document.getElementById("particles");
    if (particlesContainer) {
        for (let i = 0; i < 40; i++) {
            const p = document.createElement("div");
            p.classList.add("particle");
            const size = 2 + Math.random() * 6;
            p.style.width = size + "px";
            p.style.height = size + "px";
            p.style.left = Math.random() * 100 + "%";
            p.style.animationDuration = 8 + Math.random() * 15 + "s";
            p.style.animationDelay = Math.random() * 20 + "s";
            particlesContainer.appendChild(p);
        }
    }
    showScreen("mode-selection");

    const btnEjecutar = document.getElementById("execute-btn");
    const btnAtras = document.getElementById("back-btn");
    const inputGuess = document.getElementById("user-guess");
    if (btnEjecutar) btnEjecutar.onclick = procesarIntento;
    if (btnAtras) btnAtras.onclick = () => location.reload();
    if (inputGuess) {
        inputGuess.onkeypress = (e) => { if (e.key === 'Enter') procesarIntento(); };
    }

    const muteBtn = document.getElementById("mute-btn");
    if (muteBtn) {
        muteBtn.onclick = function() {
            isMuted = !isMuted;
            this.textContent = isMuted ? "🔇" : "🔊";
            if (isMuted) {
                bgMusic.pause();
                alarmSound.pause();
            } else {
                if (!document.getElementById("overlay").classList.contains("hidden")) {
                    if (document.body.classList.contains("alarm-active")) alarmSound.play();
                } else {
                    bgMusic.play();
                }
            }
        };
    }
});

document.addEventListener('click', () => {
    if (bgMusic.paused && !isMuted && !modoActual) {
        playMusic('menu');
    }
}, { once: true });

window.startGame = startGame;
window.reiniciarJuego = reiniciarJuego;

