'use strict';

let isMuted = true;
const bgMusic = document.getElementById("bg-music");

// Música para el menú principal
const MENU_SOUND = "sounds.game/menu-music.mp3";

// Control del botón Mute
const muteBtn = document.getElementById("mute-btn");
if (muteBtn) {
    muteBtn.onclick = function() {
        if (isMuted) {
            bgMusic.src = bgMusic.src || MENU_SOUND;
            bgMusic.play().catch(e => console.log);
            isMuted = false;
            this.classList.add('active');
            const label = this.querySelector('.audio-text');
            if (label) label.textContent = 'ON';
        } else {
            bgMusic.pause();
            isMuted = true;
            this.classList.remove('active');
            const label = this.querySelector('.audio-text');
            if (label) label.textContent = 'MUTE';
        }
    };
}

// Iniciar música al primer click del usuario
document.addEventListener('click', () => {
    if (bgMusic && bgMusic.paused && !isMuted) {
        bgMusic.src = MENU_SOUND;
        bgMusic.volume = 0.5;
        bgMusic.play().catch(e => console.log("Interacción requerida para audio"));
    }
}, { once: true });

// Typing Effect para el Terminal del Landing Page
function startTypingEffect() {
    const targetEl = document.getElementById("typing-text");
    if (!targetEl) return;
    
    const lines = [
        { text: "SOMBRAS DIGITALES - PROTOCOLO: PASSWORDLE\n\n", color: "#bfaaff" },
        { text: "Año 2026. Las infraestructuras vitales están fragmentadas en redes cerradas. Tú eres un Netrunner: no buscas fama, buscas acceso.\n\n", color: "#ffffff" },
        { text: "Tu misión: infiltrar el sistema y extraer la clave.\nCada intento revela pistas. Cada error activa alarmas.\n\n", color: "#ffffff" },
        { text: "[ CONTROLES DE LA TERMINAL ]\n", color: "#d88eff" },
        { text: "> ", color: "#ffffff" },
        { text: "Escribe", color: "#ffffff" },
        { text: " el código exacto de la longitud solicitada.\n> ", color: "#ffffff" },
        { text: "Verde:", color: "#00ff88" },
        { text: " Carácter correcto.\n> ", color: "#ffffff" },
        { text: "Amarillo:", color: "#ffcc00" },
        { text: " Posición incorrecta.\n> ", color: "#ffffff" },
        { text: "Oscuro:", color: "#666" },
        { text: " Sin coincidencias.\n\n", color: "#ffffff" },
        { text: "¿Listo para iniciar la operación?", color: "#bfaaff" }
    ];

    targetEl.innerHTML = "";
    let lineIdx = 0;
    let charIdx = 0;
    let currentSpan = null;

    function typeWriter() {
        if (lineIdx < lines.length) {
            if (charIdx === 0) {
                currentSpan = document.createElement("span");
                if (lines[lineIdx].color) {
                    currentSpan.style.color = lines[lineIdx].color;
                    currentSpan.style.textShadow = `0 0 5px ${lines[lineIdx].color}`;
                }
                targetEl.appendChild(currentSpan);
            }
            
            currentSpan.textContent += lines[lineIdx].text.charAt(charIdx);
            charIdx++;

            if (charIdx >= lines[lineIdx].text.length) {
                lineIdx++;
                charIdx = 0;
            }
            
            const speed = Math.random() * (40 - 15) + 15;
            setTimeout(typeWriter, speed);
        }
    }
    
    setTimeout(typeWriter, 600);
}

function initMatrix() {
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

        const duration = Math.random() * 6 + 6; // Falls between 6 to 12s
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
    
    // Spawn a new tile every 250ms
    setInterval(spawnTile, 250);
}

document.addEventListener("DOMContentLoaded", () => {
    startTypingEffect();
    initMatrix();
});

console.log("PassWordle Landing | Operativa");

