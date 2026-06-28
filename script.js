// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeSmoothScroll();
    initializeNavigation();
    initializeScrollReveal();
    initializeParallax();
});

// Smooth scroll for navigation
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Active navigation highlighting with smooth transition
function initializeNavigation() {
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 300) {
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

// Scroll reveal animation for elements
function initializeScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all project cards and stats
    document.querySelectorAll('.project-card, .stat, .about > .container > p').forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
    });
}

// Parallax effect for background
function initializeParallax() {
    const orbs = document.querySelectorAll('.floating-orb');

    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const depth = (index + 1) * 20;
            const moveX = mouseX * depth;
            const moveY = mouseY * depth;

            orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
}

// Advanced animations initialization
function initializeAnimations() {
    // Animate project cards on hover
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = '';
            }, 10);
        });
    });

    // Add ripple effect on button clicks
    const buttons = document.querySelectorAll('.cta-button, .github-link, .social-button');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

// Ripple effect function
function createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    // Remove existing ripples
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }

    button.appendChild(ripple);
}

// Scroll progress indicator
function initializeScrollProgress() {
    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        document.documentElement.style.setProperty('--scroll-progress', scrolled + '%');
    });
}

// Counter animation for stats
function animateCounters() {
    const stats = document.querySelectorAll('.stat h3');

    const counterOptions = {
        threshold: 0.5,
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const text = entry.target.textContent;
                const number = parseInt(text);

                if (!isNaN(number)) {
                    const increment = number / 30;
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < number) {
                            entry.target.textContent = Math.floor(current) + '+';
                            requestAnimationFrame(updateCounter);
                        } else {
                            entry.target.textContent = text;
                            entry.target.dataset.animated = 'true';
                        }
                    };

                    updateCounter();
                }
            }
        });
    }, counterOptions);

    stats.forEach(stat => {
        counterObserver.observe(stat);
    });
}

// Initialize counter animations when DOM is ready
document.addEventListener('DOMContentLoaded', initializeScrollProgress);
document.addEventListener('DOMContentLoaded', animateCounters);

// Mouse move effect for interactive elements
document.addEventListener('mousemove', (e) => {
    const links = document.querySelectorAll('.nav-links a, .cta-button, .github-link, .social-button');

    links.forEach(link => {
        const rect = link.getBoundingClientRect();
        const distance = Math.sqrt(
            Math.pow(e.clientX - rect.left - rect.width / 2, 2) +
            Math.pow(e.clientY - rect.top - rect.height / 2, 2)
        );

        if (distance < 200) {
            const angle = Math.atan2(
                e.clientY - rect.top - rect.height / 2,
                e.clientX - rect.left - rect.width / 2
            );

            link.style.setProperty('--mouse-x', Math.cos(angle));
            link.style.setProperty('--mouse-y', Math.sin(angle));
        }
    });
});

// Page visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Reduce animations when page is hidden
        document.body.style.animation = 'none';
    } else {
        // Resume animations
        document.body.style.animation = 'page-load 0.5s ease-out';
    }
});

// Add CSS for ripple animation dynamically
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        background: radial-gradient(circle, rgba(255,255,255,0.8), rgba(255,255,255,0));
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
