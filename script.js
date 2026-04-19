'use strict';

let isMuted = false;
const bgMusic = document.getElementById("bg-music");

// Música para el menú principal
const MENU_SOUND = "sounds.game/menu-music.mp3";

// Control del botón Mute
const muteBtn = document.getElementById("mute-btn");
if (muteBtn) {
    muteBtn.onclick = function() {
        isMuted = !isMuted;
        this.textContent = isMuted ? "🔇" : "🔊";
        isMuted ? bgMusic.pause() : bgMusic.play();
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

// Efectos de scroll suave o animaciones de la landing pueden ir aquí
console.log("ShadowCODE Landing | Operativa");

