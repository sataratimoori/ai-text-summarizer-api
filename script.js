// Selecting DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeToast = document.getElementById('theme-toast');
const assistantInput = document.getElementById('assistant-input');
const assistantSendBtn = document.getElementById('assistant-send-btn');
const chatWindow = document.getElementById('chat-window');

// Mobile Navigation selectors
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navMenu = document.getElementById('navMenu');
const chatTriggerLink = document.querySelector('.chat-trigger-link');

/* ==========================================================================
   Menu Behaviors (Hamburger & Assistant Auto Focus Link)
   ========================================================================== */
if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Redirect and focus to chat terminal once clicked from nav menu
if (chatTriggerLink) {
    chatTriggerLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            navMenu.classList.remove('active');
        }
        setTimeout(() => {
            if (assistantInput) assistantInput.focus();
        }, 600);
    });
}

/* ==========================================================================
   1. Kinetic Particle Canvas Engine (Attraction Networks)
   ========================================================================== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let mouse = { x: null, y: null, radius: 130 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.4 - 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        if (mouse.x !== null && mouse.y !== null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
                let force = (mouse.radius - distance) / mouse.radius;
                this.x -= dx * force * 0.02;
                this.y -= dy * force * 0.02;
            }
        }
    }
    draw() {
        ctx.fillStyle = 'rgba(247, 207, 83, 0.25)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < 40; i++) { particlesArray.push(new Particle()); }
}

function connectParticles() {
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 110) {
                let alpha = (110 - distance) / 110 * 0.12;
                ctx.strokeStyle = `rgba(247, 207, 83, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();

/* ==========================================================================
   2. Asynchronous Typewriter Text Effect Loop
   ========================================================================== */
const words = ["Students.", "Researchers.", "Professionals.", "Developers."];
let wordIdx = 0, charIdx = 0, isDeleting = false;

function typeAnimation() {
    const currentWord = words[wordIdx];
    const targetSpan = document.getElementById('dynamic-text');
    
    if (targetSpan) {
        if (isDeleting) {
            targetSpan.textContent = currentWord.substring(0, charIdx - 1);
            charIdx--;
        } else {
            targetSpan.textContent = currentWord.substring(0, charIdx + 1);
            charIdx++;
        }
    }

    let typeSpeed = isDeleting ? 60 : 120;

    if (!isDeleting && charIdx === currentWord.length) {
        typeSpeed = 1800; 
        isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
        typeSpeed = 300;
    }
    setTimeout(typeAnimation, typeSpeed);
}
setTimeout(typeAnimation, 800);

/* ==========================================================================
   3. Scroll Reveal Engine Matrix (Intersection Observer API)
   ========================================================================== */
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active-view');
            if (entry.target.classList.contains('counter-section')) {
                triggerCounters();
            }
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-node').forEach(node => scrollObserver.observe(node));
const counterSec = document.querySelector('.counter-section');
if (counterSec) scrollObserver.observe(counterSec);

/* ==========================================================================
   4. Live Running Numbers Counter
   ========================================================================== */
function triggerCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        if (counter.innerText !== '0') return; 
        const target = +counter.getAttribute('data-target');
        let current = 0;
        const increment = target / 35;

        const countUp = () => {
            if (current < target) {
                current += increment;
                counter.innerText = Math.ceil(current);
                setTimeout(countUp, 25);
            } else {
                counter.innerText = target;
            }
        };
        countUp();
    });
}

/* ==========================================================================
   5. 3D Vector Card Tilt Matrix Calculations
   ========================================================================== */
const cards = document.querySelectorAll('.js-tilt-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const rotateX = (-(y / rect.height) * 20).toFixed(2);
        const rotateY = ((x / rect.width) * 20).toFixed(2);
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.boxShadow = `${-(rotateY * 1.5)}px ${rotateX * 1.5}px 25px var(--glow-color)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.boxShadow = 'none';
    });
});

/* ==========================================================================
   6. Core Project Tab Controllers
   ========================================================================== */
const tabButtons = document.querySelectorAll('.tab-btn');
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tab-btn.active').classList.remove('active');
        document.querySelector('.tab-content-panel.active').classList.remove('active');
        
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
    });
});

/* ==========================================================================
   7. Intelligent Automated Troubleshooting Assistant Terminal
   ========================================================================== */
function appendChatBubble(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}-bubble`;
    bubble.textContent = text;
    chatWindow.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function handleAssistantMessage() {
    const userText = assistantInput.value.trim();
    if (userText === "") return;

    appendChatBubble(userText, 'user');
    assistantInput.value = "";

    setTimeout(() => {
        let reply = "Got it! Your log signature has been safely synchronized with Mina's databases.";
        const lowerText = userText.toLowerCase();
        
        if (lowerText.includes('error') || lowerText.includes('bug') || lowerText.includes('crash')) {
            reply = "[CRITICAL ALERT]: Error code detected. Intercept logs synchronized. Mina's terminal notified! ⚠️";
        } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
            reply = "Welcome developer! Provide any error tag, and I will queue it instantly.";
        }
        appendChatBubble(reply, 'assistant');
    }, 800);
}

if (assistantSendBtn) assistantSendBtn.addEventListener('click', handleAssistantMessage);
if (assistantInput) assistantInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') handleAssistantMessage(); });

/* ==========================================================================
   8. System Environment Theme Toggle (Refined Circle Icon Matrix)
   ========================================================================== */
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        if (!themeToast) return;
        themeToast.classList.add('show');
        setTimeout(() => {
            const textNode = themeToggleBtn.querySelector('.theme-btn-text');
            if (document.body.classList.contains('light-theme')) {
                document.body.className = 'dark-theme';
                if (textNode) textNode.textContent = 'Light Mode';
            } else {
                document.body.className = 'light-theme';
                if (textNode) textNode.textContent = 'Dark Mode';
            }
            themeToast.classList.remove('show');
        }, 350);
    });
}