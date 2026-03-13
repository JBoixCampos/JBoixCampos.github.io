// ===== GLOBAL VARIABLES =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

// ===== MOBILE NAVIGATION =====
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');

    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

hamburger?.addEventListener('click', toggleMobileMenu);

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('active') && link.getAttribute('href').startsWith('#')) {
            toggleMobileMenu();
        }
    });
});

// ===== NAVBAR SCROLL EFFECTS =====
function handleNavbarScroll() {
    const scrolled = window.scrollY > 50;

    if (scrolled) {
        navbar.style.background = 'rgba(28, 23, 20, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
    } else {
        navbar.style.background = 'rgba(28, 23, 20, 0.92)';
        navbar.style.boxShadow = 'none';
    }
}

window.addEventListener('scroll', handleNavbarScroll);

// ===== ACTIVE NAVIGATION LINKS =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// ===== SMOOTH SCROLLING =====
function initSmoothScroll() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            if (targetId.startsWith('#')) {
                e.preventDefault();

                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

initSmoothScroll();

// ===== TABS FUNCTIONALITY =====
function initTabs() {
    const tabContainers = document.querySelectorAll('.tabs-container');
    console.log(`Found ${tabContainers.length} tab containers`);

    tabContainers.forEach((container, index) => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabs = container.querySelectorAll('.tab');

        console.log(`Container ${index}: ${tabButtons.length} buttons, ${tabs.length} tabs`);

        tabButtons.forEach((button, btnIndex) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`Tab button ${btnIndex} clicked`);

                // Remove active class from all buttons and tabs in this container
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabs.forEach(tab => tab.classList.remove('active'));

                // Add active class to clicked button
                button.classList.add('active');

                // Get the target tab and activate it
                const tabId = button.getAttribute('data-tab');
                console.log(`Looking for tab with id: ${tabId}`);

                const targetTab = container.querySelector(`#${tabId}`);
                if (targetTab) {
                    targetTab.classList.add('active');
                    console.log(`Activated tab: ${tabId}`);
                } else {
                    console.error(`Tab not found: ${tabId}`);
                }
            });
        });
    });
}

// ===== SCROLL REVEAL ANIMATIONS =====
// Removed - will be reimplemented

// ===== ANIMATED COUNTERS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    console.log(`Found ${counters.length} counters`);

    if (counters.length === 0) {
        console.warn('No counters found with .stat-number class');
        return;
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));

                console.log(`Counter visible, target: ${target}`);

                // Skip if already animated
                if (counter.classList.contains('animated')) {
                    console.log('Counter already animated, skipping');
                    return;
                }
                counter.classList.add('animated');

                const duration = 2000;
                const frameDuration = 1000 / 60; // 60 FPS
                const totalFrames = Math.round(duration / frameDuration);
                const increment = target / totalFrames;
                let current = 0;
                let frame = 0;

                const updateCounter = () => {
                    frame++;
                    current = increment * frame;

                    if (frame < totalFrames) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                        console.log(`Counter animation complete: ${target}`);
                    }
                };

                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px'
    });

    counters.forEach((counter, index) => {
        // Set initial value to 0
        counter.textContent = '0';
        const target = counter.getAttribute('data-target');
        console.log(`Observing counter ${index}, target: ${target}`);
        counterObserver.observe(counter);
    });
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;

    const texts = [
        'ML Engineer & Tech Lead',
        'AI for Healthcare & Life Sciences',
        'Deep Learning Specialist',
        'ML Engineer at Multiverse Computing'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;

    function type() {
        const currentText = texts[textIndex];

        if (!isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex === currentText.length) {
                setTimeout(() => {
                    isDeleting = true;
                    type();
                }, pauseTime);
                return;
            }
        } else {
            typingElement.textContent = currentText.substring(0, charIndex);
            charIndex--;

            if (charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                setTimeout(type, 500);
                return;
            }
        }

        setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
    }

    setTimeout(() => {
        typingElement.textContent = '';
        type();
    }, 1000);
}

// ===== EASTER EGGS =====
function initEasterEggs() {
    let clickCount = 0;
    const navBrand = document.querySelector('.nav-brand');

    navBrand?.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 5) {
            showNotification('📜 Scholarly mode activated! Welcome to the library.', 'success');
            clickCount = 0;
        }
    });

    // Konami code
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }

        if (konamiCode.join(',') === konamiSequence.join(',')) {
            showNotification('📖 Secret chapter unlocked!', 'success');
            konamiCode = [];
        }
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '4px',
        color: '#1C1714',
        fontSize: '0.9rem',
        fontWeight: '500',
        fontFamily: "'Crimson Pro', serif",
        zIndex: '9999',
        transform: 'translateX(120%)',
        transition: 'transform 0.5s ease-out',
        maxWidth: '300px',
        border: '1px solid #C9A962',
        background: 'linear-gradient(180deg, #D4B872 0%, #C9A962 50%, #B8953F 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// ===== PROJECT CARD HOVER EFFECTS =====
function initProjectCardEffects() {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.borderColor = 'rgba(201, 169, 98, 0.5)';
            card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
        });
    });
}

// ===== PERFORMANCE OPTIMIZATIONS =====
function initPerformanceOptimizations() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing...');

    try {
        initTabs();
        console.log('Tabs initialized');
    } catch (e) {
        console.error('Error initializing tabs:', e);
    }

    try {
        initCounters();
        console.log('Counters initialized');
    } catch (e) {
        console.error('Error initializing counters:', e);
    }

    try {
        initTypingEffect();
        console.log('Typing effect initialized');
    } catch (e) {
        console.error('Error initializing typing effect:', e);
    }

    try {
        initEasterEggs();
        console.log('Easter eggs initialized');
    } catch (e) {
        console.error('Error initializing easter eggs:', e);
    }

    try {
        initProjectCardEffects();
        console.log('Project card effects initialized');
    } catch (e) {
        console.error('Error initializing project card effects:', e);
    }

    try {
        initPerformanceOptimizations();
        console.log('Performance optimizations initialized');
    } catch (e) {
        console.error('Error initializing performance optimizations:', e);
    }
});
