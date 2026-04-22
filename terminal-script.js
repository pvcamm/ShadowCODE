'use strict';

const MOODS = {
    easy: { 
        intentos: 6, 
        palabras: ["DRIVE", "BOARD", "CABLE", "MOUSE", "PANEL", "CHIPS", "TOUCH", "POWER", "RESET", "INPUT", "PRINT", "CLICK", "FILES", "SETUP", "SOUND", "CYBER", "MEDIA", "LOCAL", "ERROR"] 
    },
    medium: { 
        intentos: 6, 
        palabras: ["ARRAY", "LOGIC", "BUILD", "DEBUG", "TRACE", "STACK", "QUEUE", "SCOPE", "ASYNC", "FETCH", "CONST", "QUERY", "INDEX", "PATCH", "SHELL", "VIRUS", "CHASH", "RETRY"] 
    },
    hard: { 
        intentos: 6, 
        palabras: ["PROXY", "CLOUD", "NODES", "PORTS", "ADMIN", "TOOLS", "TOKEN", "CACHE", "LOGIN", "HTTPS", "LINUX", "MODEM", "WIFIS", "VAULT", "ROOTS", "FRAME", "ASTRO", "CHMOD", "CLONE"] 
    }
};

let palabraSecreta = "";
let intentosRestantes = 0;
let rachaActual = 0;
let modoActual = "";
let rachaMax = localStorage.getItem("passwordleStreak") || 0;
            localStorage.setItem("passwordleStreak", rachaMax);

let isMuted = false;
const bgMusic = document.getElementById("bg-music");
const alarmSound = document.getElementById("alarm-sound");

const SOUNDS = {
    menu: "sounds.game/menu-music.mp3",
    game: "sounds.game/game-music.mp3",
    alarm: "sounds.game/alarm-music.mp3"
};

function showScreen(screenId) {
    const screens = ['mode-selection', 'game-screen', 'loading-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'flex';
}

function playLoadingAnimation() {
    showScreen('loading-screen');
    const word = "CARGANDO";
    const tiles = [];
    for(let i=0; i<8; i++) {
        const t = document.getElementById(`load-${i}`);
        if(t) {
            t.textContent = "";
            t.className = "title-tile"; 
            t.style.transform = "scale(1)";
            t.style.transition = "transform 0.1s";
            tiles.push(t);
        }
    }
    
    let i = 0;
    const typeInterval = setInterval(() => {
        if(i < word.length) {
            tiles[i].textContent = word[i];
            tiles[i].style.transform = "scale(1.15)";
            const idx = i;
            setTimeout(() => { tiles[idx].style.transform = "scale(1)"; }, 250);
            i++;
        } else {
            clearInterval(typeInterval);
            setTimeout(() => {
                const colors = ["correct", "partial", "incorrect", "incorrect", "correct", "partial", "incorrect", "correct"];
                tiles.forEach((t, idx) => {
                    setTimeout(() => {
                        t.classList.add(colors[idx % colors.length]);
                        t.style.transform = "rotateX(360deg)";
                        t.style.transition = "transform 0.6s ease";
                    }, idx * 100); 
                });
                
                setTimeout(() => {
                    showScreen('game-screen');
                    playMusic('game');
                    startFlashingCursor(currentRow, 0);
                }, 1500);
            }, 800);
        }
    }, 350);
}

function startGame(diff) {
    modoActual = diff;
    const config = MOODS[diff];
    palabraSecreta = config.palabras[Math.floor(Math.random() * config.palabras.length)];
    intentosRestantes = config.intentos;

    // Remove direct showScreen("game-screen") to let loading sequence act instead
    
    maxCols = palabraSecreta.length;
    maxRows = intentosRestantes;
    currentRow = 0;
    currentGuess = "";
    gameIsOver = false;
    
    // reset virtual keyboard
    document.querySelectorAll(".key").forEach(k => {
       k.className = k.className.replace(/(correct|partial|incorrect)/g, "").trim();
    });
    
    renderEmptyBoard();
    document.body.classList.remove("win-active", "alarm-active");
    const attemptsSpan = document.getElementById("attempts-left");
    if (attemptsSpan) attemptsSpan.textContent = intentosRestantes;

    const targetMsg = document.getElementById("target-length-msg");
    if (targetMsg) targetMsg.textContent = `[ INGRESE CÓDIGO DE ${palabraSecreta.length} CARACTERES ]`;

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

    alarmSound.pause();
    alarmSound.currentTime = 0;
    
    // Initiates sequence
    playLoadingAnimation();
}

// NEW VIRTUAL KEYBOARD & GRID MECHANICS
let currentGuess = "";
let currentRow = 0;
let maxCols = 5;
let maxRows = 6;
let flashingInterval = null;
let gameIsOver = false;

function renderEmptyBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${maxCols}, 1fr)`;
    for(let r = 0; r < maxRows; r++) {
        for(let c = 0; c < maxCols; c++) {
            const tile = document.createElement("div");
            tile.className = "tile empty";
            tile.id = `tile-${r}-${c}`;
            board.appendChild(tile);
        }
    }
}

function startFlashingCursor(r, c) {
    clearInterval(flashingInterval);
    const tile = document.getElementById(`tile-${r}-${c}`);
    if(!tile) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    tile.classList.add("flashing-cursor");
    flashingInterval = setInterval(() => {
        tile.textContent = chars[Math.floor(Math.random()*chars.length)];
        tile.style.color = "#ffffff";
    }, 50);
}

function stopFlashingCursor() {
    clearInterval(flashingInterval);
}

function updateBoard() {
    for(let c = 0; c < maxCols; c++) {
        const tile = document.getElementById(`tile-${currentRow}-${c}`);
        if(c < currentGuess.length) {
            tile.textContent = currentGuess[c];
            tile.style.color = "#fff"; 
            tile.style.transform = "scale(1.1)";
            setTimeout(()=> tile.style.transform="scale(1)", 100);
            tile.classList.remove("flashing-cursor");
        } else {
            if(c === currentGuess.length) {
                startFlashingCursor(currentRow, c);
            } else {
                tile.textContent = "";
                tile.classList.remove("flashing-cursor");
            }
        }
    }
    if(currentGuess.length === maxCols) stopFlashingCursor(); 
}

function handleKeyPress(key) {
    if(gameIsOver) return;
    if(key === 'ENTER') {
        if(currentGuess.length !== maxCols) {
            const toast = document.getElementById("invalid-toast");
            if(toast) {
                toast.textContent = `SE REQUIEREN ${maxCols} CARACTERES`;
                toast.style.display = "block";
                setTimeout(() => toast.style.display = "none", 1500);
            }
        } else {
            procesarIntentoWordle();
        }
    } else if(key === 'BACKSPACE' || key === 'DEL' || key === '⌫') {
        if(currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            stopFlashingCursor();
            const tile = document.getElementById(`tile-${currentRow}-${currentGuess.length}`);
            tile.textContent = "";
            updateBoard();
        }
    } else {
        if(currentGuess.length < maxCols && /^[A-ZÑ]$/.test(key)) {
            currentGuess += key;
            updateBoard();
        }
    }
}

function procesarIntentoWordle() {
    stopFlashingCursor();
    const guess = currentGuess;
    const len = maxCols;
    const tilesColors = Array(len).fill("incorrect");
    const secretArr = palabraSecreta.split("");
    const guessArr = guess.split("");

    for (let i = 0; i < len; i++) {
        if (guessArr[i] === secretArr[i]) {
            tilesColors[i] = "correct";
            secretArr[i] = null; 
            guessArr[i] = null;
        }
    }

    for (let i = 0; i < len; i++) {
        if (guessArr[i] !== null && secretArr.includes(guessArr[i])) {
            tilesColors[i] = "partial";
            secretArr[secretArr.indexOf(guessArr[i])] = null;
        }
    }

    let delay = 0;
    for(let i=0; i<len; i++) {
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        const keyBtn = document.querySelector(`.key[data-key="${guess[i]}"]`);
        setTimeout(() => {
            tile.classList.add(tilesColors[i]);
            tile.style.transform = "rotateX(360deg)";
            
            if(keyBtn) {
                const isCurrentCorrect = keyBtn.classList.contains("correct");
                const isCurrentPartial = keyBtn.classList.contains("partial");
                if(tilesColors[i] === "correct") {
                    keyBtn.className = "key correct";
                } else if(tilesColors[i] === "partial" && !isCurrentCorrect) {
                    keyBtn.className = "key partial";
                } else if(tilesColors[i] === "incorrect" && !isCurrentCorrect && !isCurrentPartial) {
                    keyBtn.className = "key incorrect";
                }
            }
        }, delay);
        delay += 250;
    }

    setTimeout(() => {
        intentosRestantes--;
        const attemptsSpan = document.getElementById("attempts-left");
        if (attemptsSpan) attemptsSpan.textContent = intentosRestantes;
        
        if(guess === palabraSecreta) {
            rachaActual++;
            if (rachaActual > rachaMax) {
                rachaMax = rachaActual;
                localStorage.setItem("passwordleStreak", rachaMax);
            }
            gameOver(true);
        } else if (intentosRestantes <= 0) {
            gameOver(false);
        } else {
            currentRow++;
            currentGuess = "";
            startFlashingCursor(currentRow, 0);
        }
    }, delay + 200);
}

function launchHackerConfetti() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    const numConfetti = 60; 
    for (let i = 0; i < numConfetti; i++) {
        const conf = document.createElement("div");
        
        // Randomize the tile style (green, yellow, or grey)
        const typeRand = Math.random();
        if(typeRand > 0.6) {
            conf.className = "tile correct"; 
        } else if (typeRand > 0.3) {
            conf.className = "tile partial"; 
        } else {
            conf.className = "tile incorrect"; 
        }
        
        conf.style.position = "fixed";
        conf.style.zIndex = "8000";
        conf.style.pointerEvents = "none";
        conf.style.width = "25px";
        conf.style.height = "25px";
        conf.style.fontSize = "1.1rem";
        conf.style.borderRadius = "2px"; // Enforce rigid square edges
        
        conf.textContent = chars[Math.floor(Math.random() * chars.length)];
        
        const isLeft = Math.random() > 0.5;
        const startX = isLeft ? -80 : window.innerWidth + 80;
        const startY = window.innerHeight + 60;
        
        // Apex of the throw
        const midX = isLeft ? (window.innerWidth * 0.1 + Math.random() * window.innerWidth * 0.6) 
                            : (window.innerWidth * 0.9 - Math.random() * window.innerWidth * 0.6);
        const peakY = window.innerHeight * 0.1 + Math.random() * window.innerHeight * 0.4;
        
        const txMid = midX - startX;
        const tyMid = peakY - startY;
        
        // Fall down, drift horizontally 
        const drift = (Math.random() - 0.5) * 400;
        const txEnd = txMid + drift; 
        
        conf.style.left = startX + "px";
        conf.style.top = startY + "px";
        
        conf.style.setProperty('--tx-mid', `${txMid}px`);
        conf.style.setProperty('--ty-mid', `${tyMid}px`);
        conf.style.setProperty('--tx-end', `${txEnd}px`);
        
        // Slow down rotation so it doesn't look like a blurred circle
        const rotAmount = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360);
        conf.style.setProperty('--rot', `${rotAmount}deg`);
        
        conf.style.animation = `hack-pop ${3.5 + Math.random()*2.5}s ease-in-out forwards`;
        document.getElementById("overlay").appendChild(conf);
        
        setTimeout(() => conf.remove(), 6500);
    }
}

function gameOver(exito) {
    gameIsOver = true;
    bgMusic.pause();
    alarmSound.pause();
    alarmSound.currentTime = 0;

    const overlay = document.getElementById("overlay");
    if (!overlay) return;
    overlay.classList.remove("hidden");
    overlay.innerHTML = "";

    if (exito) {
        document.body.classList.add("win-active");

        const victoryHTML = `
            <div class="feature-card window-style" style="width: 100%; max-width: 450px; box-shadow: 0 0 30px rgba(0,255,136,0.1);">
                <div class="w-header">
                    <span class="w-title"><span style="color:#00ff88">sys</span><span style="color:#666">@</span><span style="color:#ffcc00">op</span><span style="color:#fff">:~/victory_log</span></span>
                    <div class="w-controls"><span>_</span><span>□</span><span>✖</span></div>
                </div>
                <div class="w-body" style="padding: 25px; display: flex; flex-direction: column; gap: 15px; font-family: 'Fira Mono', monospace;">
                    <div id="v-line1" style="color: #00ff88; font-weight: bold; font-size: 1.1rem; min-height: 1.5rem; text-shadow: 0 0 8px rgba(0,255,136,0.5);"></div>
                    <div id="v-line2" style="color: #ffffff; font-size: 0.95rem; min-height: 1.2rem; text-shadow: 0 0 8px rgba(255,255,255,0.4);"></div>
                    
                    <!-- Stats Box (Hidden initially) -->
                    <div id="v-stats" style="display: none; flex-direction: column; gap: 10px; margin-top: 15px; background: rgba(0,0,0,0.6); padding: 20px; border-radius: 4px; border: 1px dashed rgba(0,255,136,0.3); font-size: 0.95rem; text-shadow: 0 0 5px rgba(255,255,255,0.2);">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color:#aaa;">ESTADO:</span><span style="color: #00ff88; text-shadow: 0 0 10px rgba(0,255,136,0.6);">[ COMPROMETIDO ]</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color:#aaa;">RACHA ACTUAL:</span><span style="color: #ffcc00; text-shadow: 0 0 10px rgba(255,204,0,0.6);">${rachaActual}x 🔥</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color:#aaa;">RÉCORD UNERG:</span><span style="color: #ffffff; text-shadow: 0 0 10px rgba(255,255,255,0.6);">${rachaMax}x</span>
                        </div>
                    </div>

                    <!-- Buttons (Hidden initially) -->
                    <div id="v-buttons" style="display: none; margin-top: 25px; gap: 10px; justify-content: space-between;">
                        <button class="key" onclick="reiniciarJuego()" style="font-size: 0.85rem; padding: 12px; border-color: rgba(0,255,136,0.5); color: #00ff88; background: rgba(0,255,136,0.1);">NUEVO ATAQUE</button>
                        <button class="key" onclick="window.location.reload()" style="font-size: 0.85rem; padding: 12px; border-color: rgba(255,51,102,0.4); color: #ff3366; background: rgba(255,51,102,0.1);">DESCONECTAR</button>
                    </div>
                </div>
            </div>
        `;
        overlay.innerHTML = victoryHTML;

        // Custom typewriter effect for victory log
        const vLines = [
            { id: "v-line1", text: ">> ACCESO CONCEDIDO.", delay: 400 },
            { id: "v-line2", text: ">> Ejecutando bypass al sistema proxy", dots: 3, delay: 1200 }
        ];

        function typeLine(lines, index) {
            if(index >= lines.length) {
                document.getElementById("v-stats").style.display = "flex";
                setTimeout(() => document.getElementById("v-buttons").style.display = "flex", 500);
                setTimeout(() => launchHackerConfetti(), 800);
                return;
            }
            const data = lines[index];
            const el = document.getElementById(data.id);
            let charIndex = 0;
            const tInterval = setInterval(() => {
                el.textContent += data.text[charIndex];
                charIndex++;
                if(charIndex >= data.text.length) {
                    clearInterval(tInterval);
                    if (data.dots) {
                        const baseText = el.textContent;
                        let dotsCount = 0;
                        setInterval(() => {
                            dotsCount = (dotsCount + 1) % (data.dots + 1);
                            el.textContent = baseText + ".".repeat(dotsCount);
                        }, 400); // Bucle infinito visual
                        
                        setTimeout(() => typeLine(lines, index + 1), data.delay);
                    } else {
                        setTimeout(() => typeLine(lines, index + 1), data.delay);
                    }
                }
            }, 35);
        }

        setTimeout(() => typeLine(vLines, 0), 300);
    } 
    else {
        // === DERROTA - TERMINAL GLASSMORPHIC ===
        rachaActual = 0;
        document.body.classList.add("alarm-active");
        if (!isMuted) {
            alarmSound.src = SOUNDS.alarm;
            alarmSound.volume = 0.4;
            alarmSound.play().catch(e => console.log);
        }

        const sessionId = Math.random().toString(16).toUpperCase().substring(2, 10);
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const central = document.createElement("div");
        central.className = "defeat-central";
        central.innerHTML = `
            <div class="defeat-terminal-header">
                <div class="header-title">SECURITY_BREACH.EXE</div>
                <div class="defeat-controls"><span>_</span><span>□</span><span>✖</span></div>
            </div>
            <div class="defeat-body">
                <div class="defeat-code">[ ERROR 403 ]</div>
                <h2 class="defeat-title">ACCESO DENEGADO</h2>
                <p class="defeat-subtitle">INTRUSO DETECTADO — SESIÓN TERMINADA</p>
                <div class="defeat-log">
                    <div class="log-line"><span class="log-key">SESSION:</span><span class="log-val">#${sessionId}</span></div>
                    <div class="log-line"><span class="log-key">TIMESTAMP:</span><span class="log-val">${timestamp}</span></div>
                    <div class="log-line"><span class="log-key">ESTADO:</span><span class="log-val red">SISTEMA COMPROMETIDO</span></div>
                    <div class="log-line"><span class="log-key">PALABRA:</span><span class="log-val yellow">${palabraSecreta}</span></div>
                </div>
                <div class="defeat-actions">
                    <button class="btn-defeat-primary" onclick="location.reload()">REINTENTAR</button>
                </div>
            </div>
        `;
        overlay.appendChild(central);

        const alertMessages = [
            { title: "FIREWALL_BREACH.LOG", msg: "Actividad sospechosa detectada", detail: "IP rastreada. Protocolo de bloqueo iniciado." },
            { title: "INTRUSION_ALERT.SYS", msg: "Acceso no autorizado", detail: "Agente neutralizado. Registros borrados." },
            { title: "SECURE_BOOT.EXE", msg: "Protocolo de seguridad activo", detail: "Reiniciando defensa perimetral..." },
            { title: "TRACE_ROUTE.SH", msg: "Identidad expuesta", detail: "Localización aproximada adquirida." },
            { title: "KERNEL_PANIC.LOG", msg: "Proceso de hackeo fallido", detail: "Sistema volviendo al estado seguro." },
            { title: "AUTH_DENIED.EXE", msg: "Credenciales inválidas", detail: "Sesión bloqueada por 24 horas." },
        ];
        
        let activeAlerts = 0;
        const maxActive = 4;
        
        function spawnAlert() {
            if (!document.body.classList.contains('alarm-active')) return;
            if (activeAlerts >= maxActive) return;

            const data = alertMessages[Math.floor(Math.random() * alertMessages.length)];
            const alertId = Math.random().toString(16).toUpperCase().substring(2, 8);
            
            const win = document.createElement("div");
            win.className = "error-window";
            
            const zone = Math.random() > 0.5 ? 'left' : 'right';
            let leftPct = zone === 'left' ? Math.random() * 22 + 2 : Math.random() * 22 + 72;
            let topPct = Math.random() * 65 + 5;

            win.style.left = `${leftPct}%`;
            win.style.top = `${topPct}%`;
            win.style.zIndex = `${10000 + activeAlerts}`;

            win.innerHTML = `
                <div class="error-header">
                    <div class="error-header-left">
                        <span class="error-header-dot"></span>
                        <span>${data.title}</span>
                    </div>
                    <span style="color:#555">✖</span>
                </div>
                <div class="error-body">
                    <div class="error-alert">── ALERTA CRÍTICA ──</div>
                    <p>${data.msg}</p>
                    <div class="error-incident">
                        ID: <span>#${alertId}</span><br>
                        ${data.detail}
                    </div>
                </div>
            `;
            overlay.appendChild(win);
            activeAlerts++;

            setTimeout(() => {
                win.style.animation = 'alertFadeOut 0.4s ease forwards';
                setTimeout(() => {
                    if (overlay.contains(win)) win.remove();
                    activeAlerts = Math.max(0, activeAlerts - 1);
                    if (document.body.classList.contains('alarm-active')) {
                        setTimeout(spawnAlert, 200 + Math.random() * 600);
                    }
                }, 400);
            }, 1800 + Math.random() * 2000);
        }

        for (let i = 0; i < 4; i++) {
            setTimeout(() => spawnAlert(), i * 300);
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
        
        for (let i = 0; i < drops.length; i++) {
            // Alternar color entre verde claro y verde más brillante
            const greenShade = Math.random() > 0.7 ? "#88ff88" : "#00ff88";
            ctx.fillStyle = greenShade;
            const fontSizeVar = fontSize + (Math.random() > 0.9 ? 4 : 0);
            ctx.font = `bold ${fontSizeVar}px "Fira Mono", monospace`;
            ctx.shadowBlur = Math.random() > 0.8 ? 12 : 6;
            ctx.shadowColor = "#00ff88";
            
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

    document.addEventListener("keydown", (e) => {
        if(document.getElementById("game-screen").style.display === "flex") {
            if(e.key === "Enter") handleKeyPress("ENTER");
            else if(e.key === "Backspace") handleKeyPress("BACKSPACE");
            else {
                const key = e.key.toUpperCase();
                if(/^[A-ZÑ]$/.test(key)) handleKeyPress(key);
            }
        }
    });

    document.querySelectorAll(".key").forEach(btn => {
        btn.onclick = () => {
            const k = btn.getAttribute("data-key");
            if (k === "BACKSPACE" || k === "⌫") handleKeyPress("BACKSPACE");
            else handleKeyPress(k);
        };
    });

    const btnAtras = document.getElementById("back-btn");
    const confirmModal = document.getElementById("confirm-modal");
    const cancelAbort = document.getElementById("cancel-abort-btn");
    const confirmAbort = document.getElementById("confirm-abort-btn");

    if (btnAtras) {
        btnAtras.onclick = () => {
            if(confirmModal) confirmModal.style.display = "flex";
        };
    }
    if (cancelAbort) {
        cancelAbort.onclick = () => confirmModal.style.display = "none";
    }
    if (confirmAbort) {
        confirmAbort.onclick = () => location.reload();
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

function initMatrixLocal() {
    const container = document.getElementById("wordle-matrix");
    if (!container) return;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function spawnTile() {
        const tile = document.createElement("div");
        tile.classList.add("matrix-tile");

        const randType = Math.random();
        if (randType > 0.65) {
            tile.classList.add('matrix-green');
        } else if (randType > 0.3) {
            tile.classList.add('matrix-yellow');
        } else {
            tile.classList.add('matrix-grey');
        }

        tile.textContent = chars[Math.floor(Math.random() * chars.length)];
        tile.style.left = Math.random() * 100 + "vw";

        const duration = Math.random() * 6 + 6; 
        tile.style.animationDuration = duration + "s";
        container.appendChild(tile);
        
        const shuffle = setInterval(() => {
            tile.textContent = chars[Math.floor(Math.random() * chars.length)];
        }, 300);

        setTimeout(() => {
            clearInterval(shuffle);
            if(container.contains(tile)) tile.remove();
        }, duration * 1000);
    }
    
    setInterval(spawnTile, 250);
}

document.addEventListener("DOMContentLoaded", () => {
    initMatrixLocal();
});

