// Initialize all animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initNavigation();
    initProjectCards();
    initScrollAnimations();
    initParticles();
    initStatCounters();
    initMouseEffects();
    initMemoryGame();
});

// ==================== GAMES ====================

// Game variables
let currentGame = null;

function startGame(gameType) {
    currentGame = gameType;
    const modal = document.getElementById('gameModal');
    modal.style.display = 'block';

    if (gameType === 'spaceshooter') {
        document.getElementById('spaceShooterGame').style.display = 'block';
        document.getElementById('memoryGame').style.display = 'none';
        startSpaceShooter();
    } else if (gameType === 'memory') {
        document.getElementById('memoryGame').style.display = 'block';
        document.getElementById('spaceShooterGame').style.display = 'none';
        resetMemoryGame();
    }
}

function closeGame() {
    document.getElementById('gameModal').style.display = 'none';
    if (currentGame === 'spaceshooter') {
        stopSpaceShooter();
    }
    currentGame = null;
}

window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target === modal) {
        closeGame();
    }
};

// ==================== SPACE SHOOTER GAME ====================

let gameRunning = false;
let gameAnimationId = null;

const spaceShooterConfig = {
    canvas: null,
    ctx: null,
    player: { x: 0, y: 0, width: 30, height: 40, speed: 5 },
    bullets: [],
    enemies: [],
    score: 0,
    level: 1
};

function startSpaceShooter() {
    const canvas = document.getElementById('gameCanvas');
    spaceShooterConfig.canvas = canvas;
    spaceShooterConfig.ctx = canvas.getContext('2d');
    spaceShooterConfig.player.x = canvas.width / 2 - 15;
    spaceShooterConfig.player.y = canvas.height - 50;
    spaceShooterConfig.bullets = [];
    spaceShooterConfig.enemies = [];
    spaceShooterConfig.score = 0;
    spaceShooterConfig.level = 1;

    gameRunning = true;
    setupGameControls();
    spawnEnemies();
    updateSpaceShooter();
}

function stopSpaceShooter() {
    gameRunning = false;
    if (gameAnimationId) {
        cancelAnimationFrame(gameAnimationId);
    }
}

function setupGameControls() {
    document.addEventListener('keydown', handleGameKeyDown);
    document.addEventListener('keyup', handleGameKeyUp);
}

const keys = {};

function handleGameKeyDown(e) {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        shootBullet();
    }
}

function handleGameKeyUp(e) {
    keys[e.key] = false;
}

function shootBullet() {
    if (gameRunning) {
        spaceShooterConfig.bullets.push({
            x: spaceShooterConfig.player.x + 15,
            y: spaceShooterConfig.player.y,
            width: 5,
            height: 15,
            speed: 7
        });
    }
}

function spawnEnemies() {
    const canvas = spaceShooterConfig.canvas;
    for (let i = 0; i < 3 + spaceShooterConfig.level; i++) {
        spaceShooterConfig.enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * 100 - 100,
            width: 30,
            height: 30,
            speed: 2 + spaceShooterConfig.level * 0.5
        });
    }
}

function updateSpaceShooter() {
    const canvas = spaceShooterConfig.canvas;
    const ctx = spaceShooterConfig.ctx;

    // Clear canvas
    ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update player
    if (keys['ArrowLeft'] && spaceShooterConfig.player.x > 0) {
        spaceShooterConfig.player.x -= spaceShooterConfig.player.speed;
    }
    if (keys['ArrowRight'] && spaceShooterConfig.player.x < canvas.width - spaceShooterConfig.player.width) {
        spaceShooterConfig.player.x += spaceShooterConfig.player.speed;
    }

    // Draw player
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(spaceShooterConfig.player.x, spaceShooterConfig.player.y, spaceShooterConfig.player.width, spaceShooterConfig.player.height);
    ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
    ctx.shadowBlur = 10;

    // Update and draw bullets
    for (let i = spaceShooterConfig.bullets.length - 1; i >= 0; i--) {
        const bullet = spaceShooterConfig.bullets[i];
        bullet.y -= bullet.speed;

        if (bullet.y < 0) {
            spaceShooterConfig.bullets.splice(i, 1);
            continue;
        }

        ctx.fillStyle = '#ff006e';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Update and draw enemies
    for (let i = spaceShooterConfig.enemies.length - 1; i >= 0; i--) {
        const enemy = spaceShooterConfig.enemies[i];
        enemy.y += enemy.speed;

        ctx.fillStyle = '#9d4edd';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Check collision with bullets
        for (let j = spaceShooterConfig.bullets.length - 1; j >= 0; j--) {
            const bullet = spaceShooterConfig.bullets[j];
            if (checkCollision(bullet, enemy)) {
                spaceShooterConfig.bullets.splice(j, 1);
                spaceShooterConfig.enemies.splice(i, 1);
                spaceShooterConfig.score += 10;
                document.getElementById('score').textContent = spaceShooterConfig.score;
                break;
            }
        }

        // Check if enemy hit player
        if (enemy.y > canvas.height) {
            spaceShooterConfig.enemies.splice(i, 1);
        }
    }

    // Spawn new enemies
    if (spaceShooterConfig.enemies.length === 0) {
        spaceShooterConfig.level++;
        spawnEnemies();
    }

    ctx.shadowBlur = 0;

    if (gameRunning) {
        gameAnimationId = requestAnimationFrame(updateSpaceShooter);
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ==================== MEMORY MATCH GAME ====================

const memoryConfig = {
    cards: [],
    flipped: [],
    matched: 0,
    moves: 0,
    firstCard: null,
    secondCard: null,
    lockBoard: false
};

const emojis = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤'];

function initMemoryGame() {
    // Initialize memory game data
}

function resetMemoryGame() {
    memoryConfig.cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    memoryConfig.flipped = new Array(16).fill(false);
    memoryConfig.matched = 0;
    memoryConfig.moves = 0;
    memoryConfig.lockBoard = false;
    memoryConfig.firstCard = null;
    memoryConfig.secondCard = null;

    document.getElementById('moves').textContent = 0;
    document.getElementById('matched').textContent = '0/8';

    renderMemoryBoard();
}

function renderMemoryBoard() {
    const board = document.getElementById('memoryBoard');
    board.innerHTML = '';

    memoryConfig.cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.textContent = memoryConfig.flipped[index] || memoryConfig.matched >= memoryConfig.cards.length / 2 ? emoji : '?';

        if (memoryConfig.flipped[index] || isMatched(index)) {
            card.classList.add('flipped');
        }
        if (isMatched(index)) {
            card.classList.add('matched');
        }

        card.addEventListener('click', () => flipCard(index, card));
        board.appendChild(card);
    });
}

function flipCard(index, cardElement) {
    if (memoryConfig.lockBoard || memoryConfig.flipped[index]) return;

    memoryConfig.flipped[index] = true;
    cardElement.textContent = memoryConfig.cards[index];
    cardElement.classList.add('flipped');

    if (memoryConfig.firstCard === null) {
        memoryConfig.firstCard = index;
    } else {
        memoryConfig.secondCard = index;
        memoryConfig.moves++;
        document.getElementById('moves').textContent = memoryConfig.moves;
        memoryConfig.lockBoard = true;

        if (memoryConfig.cards[memoryConfig.firstCard] === memoryConfig.cards[memoryConfig.secondCard]) {
            memoryConfig.matched += 2;
            document.getElementById('matched').textContent = (memoryConfig.matched / 2) + '/8';

            if (memoryConfig.matched === memoryConfig.cards.length) {
                setTimeout(() => {
                    alert(`🎉 You won in ${memoryConfig.moves} moves!`);
                    resetMemoryGame();
                }, 500);
            }

            memoryConfig.lockBoard = false;
            memoryConfig.firstCard = null;
            memoryConfig.secondCard = null;
        } else {
            setTimeout(() => {
                memoryConfig.flipped[memoryConfig.firstCard] = false;
                memoryConfig.flipped[memoryConfig.secondCard] = false;
                memoryConfig.lockBoard = false;
                memoryConfig.firstCard = null;
                memoryConfig.secondCard = null;
                renderMemoryBoard();
            }, 600);
        }
    }
}

function isMatched(index) {
    if (memoryConfig.matched < memoryConfig.cards.length) {
        return false;
    }
    return true;
}

// Smooth scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Active navigation
function initNavigation() {
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.pageYOffset >= section.offsetTop - 300) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Enhanced project card effects
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach((card, index) => {
        // Add hover tracking
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', x + 'px');
            card.style.setProperty('--mouse-y', y + 'px');
        });

        // Add click ripple
        card.addEventListener('click', createRipple);
    });
}

// Ripple effect
function createRipple(e) {
    const ripple = document.createElement('span');
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.background = 'radial-gradient(circle, rgba(0, 212, 255, 0.6), transparent)';
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple-burst 0.8s ease-out forwards';

    e.currentTarget.style.position = 'relative';
    e.currentTarget.appendChild(ripple);

    setTimeout(() => ripple.remove(), 800);
}

// Scroll reveal animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.project-card, .stat').forEach(el => {
        observer.observe(el);
    });
}

// Create floating particles
function initParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.style.position = 'fixed';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '2';
    document.body.appendChild(particleContainer);

    // Create animated particles
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `hsl(${Math.random() * 60 + 180}, 100%, 60%)`;
        particle.style.borderRadius = '50%';
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        particle.style.boxShadow = `0 0 ${Math.random() * 10 + 5}px rgba(0, 212, 255, 0.8)`;

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        particle.style.left = x + '%';
        particle.style.top = y + '%';

        const duration = Math.random() * 10 + 15;
        particle.style.animation = `float-particle ${duration}s infinite ease-in-out`;
        particle.style.animationDelay = Math.random() * 2 + 's';

        particleContainer.appendChild(particle);
    }
}

// Animate stat counters
function initStatCounters() {
    const stats = document.querySelectorAll('.stat h3');

    const counterOptions = { threshold: 0.5 };
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                const text = entry.target.textContent;
                const number = parseInt(text);

                if (!isNaN(number)) {
                    animateCounter(entry.target, number);
                    entry.target.dataset.counted = 'true';
                }
            }
        });
    }, counterOptions);

    stats.forEach(stat => counterObserver.observe(stat));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const originalText = element.textContent;

    const counter = setInterval(() => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current) + '+';
        } else {
            element.textContent = originalText;
            clearInterval(counter);
        }
    }, 30);
}

// Mouse follow effects
function initMouseEffects() {
    const buttons = document.querySelectorAll('.cta-button, .github-link, .social-button');

    document.addEventListener('mousemove', (e) => {
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            const distance = Math.hypot(
                e.clientX - rect.left - rect.width / 2,
                e.clientY - rect.top - rect.height / 2
            );

            if (distance < 250) {
                const angle = Math.atan2(
                    e.clientY - rect.top - rect.height / 2,
                    e.clientX - rect.left - rect.width / 2
                );

                button.style.setProperty('--mouse-angle', angle);
                button.style.setProperty('--distance', Math.min(distance / 250, 1));
            }
        });
    });
}

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-burst {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    @keyframes float-particle {
        0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
        }
        50% {
            transform: translate(100px, -100px) scale(1.5);
            opacity: 0.8;
        }
    }

    @keyframes glow-pulse {
        0%, 100% {
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
        }
        50% {
            box-shadow: 0 0 40px rgba(0, 212, 255, 0.8), 0 0 20px rgba(157, 78, 221, 0.6);
        }
    }

    .visible {
        animation: slide-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes slide-up {
        from {
            opacity: 0;
            transform: translateY(40px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .nav-links a.active::before {
        width: 100%;
    }
`;

document.head.appendChild(style);

// Add page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    document.body.style.animation = 'page-load 0.6s ease-out';
});

// Prevent animations during page transitions
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.style.animationPlayState = 'paused';
    } else {
        document.body.style.animationPlayState = 'running';
    }
});
