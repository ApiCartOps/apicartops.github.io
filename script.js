// Initialize all animations and interactions
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initNavigation();
    initProjectCards();
    initScrollAnimations();
    initParticles();
    initStatCounters();
    initMouseEffects();
});

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
