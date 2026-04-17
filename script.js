const MOODS = {
    easy: { 
        tiempo: 90, 
     palabras: [
         "DRIVE", "BOARD", "CABLE", "MOUSE", "PANEL", 
         "CHIPS", "TOUCH", "POWER", "RESET", "INPUT", 
            "PRINT", "CLICK", "FILES", "SETUP", "SOUND"
     ] 
    },

    medium: { 
     tiempo: 60, 
        palabras: [
           "ARRAY", "LOGIC", "BUILD", "DEBUG", "TRACE", 
          "STACK", "QUEUE", "SCOPE", "ASYNC", "FETCH", 
          "CONST", "QUERY", "INDEX", "PATCH", "SHELL"
     ] 
    },

    hard: { 
     tiempo: 30, 
        palabras: [
         "PROXY", "CLOUD", "NODES", "PORTS", "ADMIN", 
         "TOOLS", "TOKEN", "CACHE", "LOGIN", "HTTPS", 
         "LINUX", "MODEM", "WIFIS", "VAULT", "ROOTS"
        ] 
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

// Opciones de música (Pon aquí tus links o nombres de archivo)
const SOUNDS = {
    menu: "sounds.game/menu-music.mp3",
    game: "sounds.game/game-music.mp3",
    alarm: "sounds.game/alarm-music.mp3"
};

// Actualizar menú al cargar
const displayRacha = document.getElementById("racha-actual-display");
if (displayRacha) displayRacha.textContent = rachaMax + "x 🔥";

function startGame(mood) {
    modoActual = mood;
    const config = MOODS[mood];
    palabraSecreta = config.palabras[Math.floor(Math.random() * config.palabras.length)];
    tiempoRestante = config.tiempo;

    // Resetear visuales
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("board").innerHTML = "";
    document.getElementById("user-guess").disabled = false;
    document.getElementById("user-guess").value = "";
    document.body.classList.remove("win-active", "alarm-active");
    
    // Limpiar Canvas si existe
    const oldCanvas = document.getElementById("matrix-canvas");
    if(oldCanvas) {
        clearInterval(oldCanvas.dataset.rainId);
        oldCanvas.remove();
    }

    document.getElementById("timer").textContent = tiempoRestante;
    startTimer();

    alarmSound.pause(); 
    alarmSound.currentTime = 0;
    playMusic('game'); // Cambia a música de acción
}

function startTimer() {
    clearInterval(timerId);
    timerId = setInterval(() => {
        if (tiempoRestante > 0) {
            tiempoRestante--;
            document.getElementById("timer").textContent = tiempoRestante;
        } else {
            gameOver(false);
        }
    }, 1000);
}

function procesarIntento() {
    const entrada = document.getElementById("user-guess");
    const suposicion = entrada.value.toUpperCase();
    const tablero = document.getElementById("board");

    if (suposicion.length !== 5) return;

    const listaPalabrasModo = MOODS[modoActual].palabras;
    
    if (!listaPalabrasModo.includes(suposicion)) {
        entrada.style.color = "#ff4d4d";
        entrada.style.borderColor = "#ff4d4d";
        entrada.classList.add("error-shake");
        
        // Quitamos la clase después de la animación para poder repetirla
        setTimeout(() => entrada.classList.remove("error-shake"), 500);
        return; // Detiene todo, no gasta tiempo ni vida
    } else {
        entrada.style.color = "#00ff41";
        entrada.style.borderColor = "#00ff41";
    }

    for (let i = 0; i < 5; i++) {
        const cuadro = document.createElement("div");
        cuadro.classList.add("tile");
        cuadro.textContent = suposicion[i];

        if (suposicion[i] === palabraSecreta[i]) {
            cuadro.style.background = "#00ff41";
            cuadro.style.color = "black";
        } else if (palabraSecreta.includes(suposicion[i])) {
            cuadro.style.background = "#ffd700";
            cuadro.style.color = "black";
        }
        tablero.appendChild(cuadro);
    }

    entrada.value = "";

    if (suposicion === palabraSecreta) {
        rachaActual++;
        if (rachaActual > rachaMax) {
            rachaMax = rachaActual;
            localStorage.setItem("shadowCodeStreak", rachaMax);
            document.getElementById("max-streak-menu").textContent = rachaMax;
        }
        gameOver(true);
    }
}

function gameOver(exito) {
    clearInterval(timerId);
    bgMusic.pause(); // Detenemos la música de fondo
    if (exito) {
        // Puedes poner un sonido corto de victoria aquí si quieres
    } else {
        alarmSound.src = SOUNDS.alarm;
        alarmSound.volume = 0.4;
        if (!isMuted) alarmSound.play();
    }

    document.getElementById("game-screen").classList.add("hidden");
    const overlay = document.getElementById("overlay");
    overlay.classList.remove("hidden");

    if (exito) {
        document.body.classList.add("win-active");
        matrixRain();
        overlay.innerHTML = `
            <div class="glass-panel" style="padding: 40px; border: 2px solid #00ff41;">
                <h1 class="win-text-glow" style="margin-bottom: 10px;">ACCESO CONCEDIDO</h1>
                <p style="color: #00ff41; letter-spacing: 2px;">SISTEMA INFILTRADO CON ÉXITO</p>
        
                <div class="result-box">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>ESTADO:</span>
                        <span style="color: #00ff41;">COMPROMETIDO</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>RACHA ACTUAL:</span>
                        <span class="streak-counter">${rachaActual}x 🔥</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>RÉCORD UNERG:</span>
                        <span style="color: white;">${rachaMax}x</span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
                    <button class="btn-shadow" onclick="reiniciarJuego()" style="width: 100%;">
                        NUEVA INFILTRACIÓN
                    </button>
                    <button class="btn-ghost" onclick="window.location.reload()" style="width: 100%;">
                        VOLVER AL NÚCLEO (MENÚ)
                     </button>
                </div>
        
                <p style="font-size: 0.8rem; margin-top: 20px; opacity: 0.5;">
                    PROTOCOLO DE VICTORIA EJECUTADO POR: CSIRT-UNERG
                </p>
            </div>
        `;
        


    } else {
        // --- MODO DERROTA: ALARMA ---
        rachaActual = 0; 
        document.body.classList.add("alarm-active");
        const overlay = document.getElementById("overlay");
        overlay.innerHTML = ""; 
        overlay.classList.remove("hidden");

        const numVentanas = 7;
        for (let i = 0; i < numVentanas; i++) {
            const win = document.createElement("div");
            win.className = "error-window";
            
            if (i === numVentanas - 1) {
                // VENTANA CENTRAL: La dejamos arriba de todo
                win.style.top = "25%"; 
                win.style.left = "calc(50% - 190px)";
                win.style.zIndex = "2000"; // Capa más alta
                win.style.boxShadow = "0 20px 50px rgba(0,0,0,0.9)"; // Sombra extra para elevarla
            } else {
                // VENTANAS DE FONDO: Las bajamos un poco más para que no tapen el centro
                // Ajustamos el inicio a 80px y bajamos el multiplicador a 30px
                win.style.top = `${80 + (i * 30)}px`; 
                win.style.left = `${(window.innerWidth * 0.15) + (i * 35)}px`;
                win.style.zIndex = `${1000 + i}`; // Capas progresivas
                win.style.opacity = "0.8"; // Ligeramente transparentes las de atrás
            }

            win.style.animationDelay = `${i * 0.15}s`;

            const sessionId = Math.random().toString(16).toUpperCase().substring(2, 10);

            win.innerHTML = `
                <div class="window-header">
                    <span>CRITICAL_ERROR.EXE</span>
                    <span>[X]</span>
                </div>
                <div class="window-body">
                    <h2 class="error-text" style="font-size: 1.5rem; margin: 0;">ALERTA DE SEGURIDAD</h2>
                    <p style="color: #ff4d4d; font-size: 0.8rem; margin: 10px 0;">INTRUSO DETECTADO</p>
                    
                    <div style="border-top: 1px solid #ff0000; border-bottom: 1px solid #ff0000; padding: 10px; font-size: 0.75rem; background: rgba(255,0,0,0.1); text-align: left;">
                        <span style="color: #ff0000;">[!]</span> INCIDENTE: <span style="color: white;">#${sessionId}</span><br>
                        <span style="color: #ff0000;">[!]</span> ESTADO: <span style="color: white;">SISTEMA COMPROMETIDO</span>
                    </div>

                    <button class="btn-shadow" onclick="location.reload()" 
                            style="width:100%; margin-top: 15px; border: 1px solid #ff0000; background: transparent; color: #ff0000; font-size: 0.7rem;">
                        INTENTAR RE-INFILTRACIÓN
                    </button>
                </div>
            `;
            overlay.appendChild(win);
        }
    }

}

function matrixRain(isVictory = true) {
    const canvas = document.createElement("canvas");
    canvas.id = "matrix-canvas";
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "0123456789ABCDEF";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        // Si es victoria, el rastro es más claro (menos opaco)
        ctx.fillStyle = isVictory ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Color verde neón puro para victoria
        ctx.fillStyle = isVictory ? "#00ff41" : "#008f11"; 
        ctx.font = fontSize + "px monospace";
        
        // Añadir brillo real (glow) solo en victoria
        if (isVictory) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#00ff41";
        }

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
        
        // Resetear el brillo para que no afecte a otros elementos
        ctx.shadowBlur = 0;
    }
    const rainId = setInterval(draw, 35);
    canvas.dataset.rainId = rainId;
}

document.addEventListener('DOMContentLoaded', () => {
    const btnEjecutar = document.getElementById("execute-btn");
    const btnAtras = document.getElementById("back-btn");
    const inputGuess = document.getElementById("user-guess");

    if (btnEjecutar) btnEjecutar.onclick = procesarIntento;
    if (btnAtras) btnAtras.onclick = () => location.reload();
    if (inputGuess) {
        inputGuess.onkeypress = (e) => { if(e.key === 'Enter') procesarIntento(); };
    }
});

// Función para reproducir música según el estado del juego
function playMusic(type) {
    bgMusic.src = SOUNDS[type];
    // Niveles sugeridos:
    if (type === 'menu') bgMusic.volume = 0.5;
    if (type === 'game') bgMusic.volume = 0.5;
    if (type === 'alarm') bgMusic.volume = 0.5;
    
    if (!isMuted) {
        bgMusic.play().catch(e => console.log("Clic para activar audio"));
    }
}

// Control del botón Mute
document.getElementById("mute-btn").onclick = function() {
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

// Iniciar música de menú al primer click (los navegadores bloquean el auto-play)
document.addEventListener('click', () => {
    if (bgMusic.paused && !isMuted && !modoActual) {
        playMusic('menu');
    }
}, { once: true });

window.startGame = startGame;
function reiniciarJuego() {
    startGame(modoActual);
}
 
