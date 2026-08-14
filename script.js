// SONIDITO POP (AudioContext)
let audioCtx;

function playPopSound() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

// NAVEGACIÓN DEL CARRUSEL
function moveSlide(direction) {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;
    const slideWidth = carousel.clientWidth;

    carousel.scrollBy({
        left: direction * slideWidth,
        behavior: 'smooth'
    });
}


// OBSERVER PARA ANIMACIONES Y SONIDO

const slides = document.querySelectorAll('.slide');
const carousel = document.getElementById('carousel');
let isInitialLoad = true;

if (carousel && slides.length > 0) {
    const observerOptions = {
        root: carousel,
        threshold: 0.55
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                if (!isInitialLoad) {
                    playPopSound();
                }
            } else {
                entry.target.classList.remove('active');
            }
        });
        isInitialLoad = false;
    }, observerOptions);

    slides.forEach(slide => observer.observe(slide));
}


// CONTROL DE MÚSICA DE FONDO
const bgMusic = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
const volumeSlider = document.getElementById('volume-slider');
let isMusicPlaying = false;

if (bgMusic && volumeSlider) {
    bgMusic.volume = volumeSlider.value;
}

function changeVolume(val) {
    if (bgMusic) bgMusic.volume = val;
}

function toggleMusic() {
    if (!bgMusic) return;

    if (isMusicPlaying) {
        bgMusic.pause();
        if (musicBtn) {
            musicBtn.classList.remove('playing');
            musicBtn.classList.add('paused');
        }
        isMusicPlaying = false;
    } else {
        bgMusic.play().then(() => {
            if (musicBtn) {
                musicBtn.classList.remove('paused');
                musicBtn.classList.add('playing');
            }
            isMusicPlaying = true;
        }).catch(err => console.log("Bloqueo de audio:", err));
    }
}

function attemptAutoplay() {
    if (!bgMusic) return;

    bgMusic.play().then(() => {
        isMusicPlaying = true;
        if (musicBtn) {
            musicBtn.classList.remove('paused');
            musicBtn.classList.add('playing');
        }
    }).catch(() => {
        isMusicPlaying = false;
        if (musicBtn) {
            musicBtn.classList.remove('playing');
            musicBtn.classList.add('paused');
        }

        const startOnFirstInteraction = () => {
            if (!isMusicPlaying) {
                bgMusic.play().then(() => {
                    isMusicPlaying = true;
                    if (musicBtn) {
                        musicBtn.classList.remove('paused');
                        musicBtn.classList.add('playing');
                    }
                }).catch(() => { });
            }
            document.removeEventListener('click', startOnFirstInteraction);
            document.removeEventListener('touchstart', startOnFirstInteraction);
        };

        document.addEventListener('click', startOnFirstInteraction);
        document.addEventListener('touchstart', startOnFirstInteraction);
    });
}

window.addEventListener('DOMContentLoaded', attemptAutoplay);


// PANTALLA DE BIENVENIDA

const welcomeOverlay = document.getElementById('welcome-overlay');

if (welcomeOverlay) {
    welcomeOverlay.addEventListener('click', () => {
        welcomeOverlay.classList.add('hidden');

        if (bgMusic) {
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                if (musicBtn) {
                    musicBtn.classList.remove('paused');
                    musicBtn.classList.add('playing');
                }
            }).catch(err => console.log("Error al reproducir audio:", err));
        }

        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    });
}

// ✨ EFECTO MÁQUINA DE ESCRIBIR EN EL TÍTULO

const titlePhrases = [
    "skibidicumpleaños 🎉",
    "¡Te espero! 💕",
    "¡Entra a la fiesta! 🎂",
    "skibidicumpleaños ✨"
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function animateTabTitle() {
    const currentPhrase = titlePhrases[phraseIndex];

    if (isDeleting) {
        document.title = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        document.title = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }


    let typingSpeed = isDeleting ? 100 : 180;


    if (!isDeleting && charIndex === currentPhrase.length) {
        typingSpeed = 2000; // Pausa con el texto completo
        isDeleting = true;
    } 

    else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % titlePhrases.length; // Pasa a la siguiente frase
        typingSpeed = 500; // Pausa antes de empezar la nueva
    }

    setTimeout(animateTabTitle, typingSpeed);
}


animateTabTitle();