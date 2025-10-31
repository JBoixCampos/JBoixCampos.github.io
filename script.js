// ===== GLOBAL VARIABLES =====
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

// ===== MOBILE NAVIGATION =====
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Animate hamburger lines
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

// Event listeners for mobile menu
hamburger?.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking on a link (only for internal anchor links)
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Only close mobile menu for internal anchor links (starting with #)
        // Let external links (like cv.html) work normally
        if (navMenu.classList.contains('active') && link.getAttribute('href').startsWith('#')) {
            toggleMobileMenu();
        }
    });
});

// ===== NAVBAR SCROLL EFFECTS =====
function handleNavbarScroll() {
    const scrolled = window.scrollY > 50;
    
    if (scrolled) {
        navbar.style.background = 'rgba(17, 24, 39, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(17, 24, 39, 0.9)';
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

            // Only handle internal anchor links (starting with #)
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
            // For external links (like ./index.html), let them work normally
        });
    });
}

initSmoothScroll();

// ===== DNA HERO ANIMATION =====
function createDNAAnimation() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        canvas: canvas,
        antialias: true
    });
    
    function updateDNASize() {
        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    
    window.addEventListener('resize', updateDNASize);
    updateDNASize();
    
    const group = new THREE.Group();
    scene.add(group);
    
    const numPoints = 60;
    const amplitude = 45;
    const spacing = 7;
    
    // Enhanced materials
    const sphereMaterial = new THREE.MeshPhysicalMaterial({ 
        emissive: 0x00ff9d,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ff9d,
        opacity: 0.4,
        transparent: true
    });
    
    // Create DNA structure
    for (let i = 0; i < numPoints; i++) {
        const angle = i * (Math.PI / 8);
        
        const x1 = Math.sin(angle) * amplitude;
        const x2 = -Math.sin(angle) * amplitude;
        const y = i * spacing - (numPoints * spacing) / 2;
        const z = Math.cos(angle) * amplitude;
        
        const sphereGeometry = new THREE.SphereGeometry(1.2 + Math.random() * 0.8, 32, 32);
        const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
        const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
        
        sphere1.position.set(x1, y, z);
        sphere2.position.set(x2, y, -z);
        
        group.add(sphere1);
        group.add(sphere2);
        
        // Connect with lines
        if (i < numPoints - 1) {
            const nextAngle = (i + 1) * (Math.PI / 8);
            const nextX1 = Math.sin(nextAngle) * amplitude;
            const nextY = (i + 1) * spacing - (numPoints * spacing) / 2;
            const nextZ = Math.cos(nextAngle) * amplitude;
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x1, y, z),
                new THREE.Vector3(nextX1, nextY, nextZ)
            ]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            group.add(line);
        }
        
        // Cross connections
        if (i % 3 === 0) {
            const crossGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x1, y, z),
                new THREE.Vector3(x2, y, -z)
            ]);
            const crossLine = new THREE.Line(crossGeometry, lineMaterial);
            group.add(crossLine);
        }
    }
    
    // Lighting
    const mainLight = new THREE.PointLight(0xffffff, 2, 300);
    mainLight.position.set(0, 10, -20);
    scene.add(mainLight);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const bloomLight = new THREE.PointLight(0x00ff9d, 0.5, 200);
    bloomLight.position.set(-50, 0, 50);
    scene.add(bloomLight);
    
    camera.position.x = 200;
    camera.position.y = 0;
    camera.position.z = 0;
    camera.lookAt(0, 0, 0);
    
    group.rotation.x = Math.PI / 2;
    
    // Animation loop
    function animateDNA() {
        requestAnimationFrame(animateDNA);
        group.rotation.y += 0.003;
        group.position.y = Math.sin(Date.now() * 0.001) * 5;
        renderer.render(scene, camera);
    }
    
    animateDNA();
}

// ===== BACKGROUND PARTICLES ANIMATION =====
function initBackgroundAnimation() {
    const canvas = document.getElementById('background-animation');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const particleGroup = new THREE.Group();
    const particleCount = 5000;
    
    // Create different particle shapes
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;
        
        const shapeType = Math.floor(Math.random() * 3);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x00ff9d,
            transparent: true,
            opacity: 0.6
        });
        
        let geometry;
        if (shapeType === 0) {
            geometry = new THREE.PlaneGeometry(2, 2);
        } else if (shapeType === 1) {
            geometry = new THREE.CircleGeometry(2, 8);
        } else {
            geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                0, 2, 0,
                -2, -2, 0,
                2, -2, 0
            ]);
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        particleGroup.add(mesh);
    }

    scene.add(particleGroup);
    camera.position.z = 1000;

    function animateBackground() {
        requestAnimationFrame(animateBackground);
        particleGroup.rotation.x += 0.0002;
        particleGroup.rotation.y += 0.0002;
        renderer.render(scene, camera);
    }
    
    animateBackground();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ===== TABS FUNCTIONALITY =====
function initTabs() {
    // Handle tabs for each portfolio section independently
    const tabContainers = document.querySelectorAll('.tabs-container');
    
    tabContainers.forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabs = container.querySelectorAll('.tab');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from buttons and tabs within this container only
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabs.forEach(tab => tab.classList.remove('active'));

                // Add active class to clicked button and corresponding tab
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                const targetTab = container.querySelector(`#${tabId}`);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
            });
        });
    });
}

// ===== SCROLL REVEAL ANIMATIONS =====
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const elementsToReveal = document.querySelectorAll('.reveal');
    elementsToReveal.forEach(el => observer.observe(el));
}

// ===== ANIMATED COUNTERS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += step;
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// ===== TYPING EFFECT =====
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;
    
    const texts = [
        'ML Engineer & Tech Lead',
        'AI for Healthcare & Life Sciences',
        'Deep Learning Specialist',
        'Technical Leader in Biotech'
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
    
    // Start typing effect after page loads
    setTimeout(() => {
        typingElement.textContent = '';
        type();
    }, 1000);
}

// ===== PARALLAX EFFECTS =====
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        // Much more subtle parallax for hero to prevent overlap
        const hero = document.querySelector('.hero');
        if (hero && scrolled < window.innerHeight) {
            // Only apply parallax when hero is visible and make it very subtle
            hero.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
        
    });
}

// ===== GLASS CARD HOVER EFFECTS =====
function initGlassEffects() {
    // Exclude glass cards in the experience section from 3D effects
    const glassCards = document.querySelectorAll('.glass-card:not(.experience .glass-card)');
    
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            
            const maxRotation = 3;
            const limitedRotateX = Math.max(-maxRotation, Math.min(maxRotation, rotateX));
            const limitedRotateY = Math.max(-maxRotation, Math.min(maxRotation, rotateY));
            
            card.style.transform = `perspective(1000px) rotateX(${limitedRotateX}deg) rotateY(${limitedRotateY}deg) translateZ(5px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}
// ===== PERFORMANCE OPTIMIZATIONS =====
function initPerformanceOptimizations() {
    // Throttle scroll events
    let scrollTimeout;
    const originalScrollHandler = () => {
        handleNavbarScroll();
        updateActiveNavLink();
    };
    
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        
        scrollTimeout = setTimeout(() => {
            originalScrollHandler();
            scrollTimeout = null;
        }, 16); // ~60fps
    });
    
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

// ===== EASTER EGGS =====
function initEasterEggs() {
    let clickCount = 0;
    const navBrand = document.querySelector('.nav-brand');
    
    navBrand?.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 5) {
            showNotification('🧬 DNA sequence activated! Welcome to the matrix of life!', 'success');
            clickCount = 0;
            
            // Add special effect
            document.body.style.filter = 'hue-rotate(180deg)';
            setTimeout(() => {
                document.body.style.filter = '';
            }, 2000);
        }
    });
    
    // Konami code
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            showNotification('🎮 Konami code activated! You found the secret!', 'success');
            konamiCode = [];
        }
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '500',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    });
    
    const colors = {
        success: 'linear-gradient(45deg, #00ff9d, #00b8ff)',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ===== PROJECT CARD INTERACTIONS =====
function initProjectCardEffects() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(0, 255, 157, 0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });
}

// ===== ANALYTICS TRACKING =====
function trackEvent(category, action, label) {
    console.log(`Analytics: ${category} - ${action} - ${label}`);
    // Here you can integrate with Google Analytics, Plausible, etc.
}

// Track project clicks
document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', () => {
        trackEvent('Projects', 'Click', link.textContent.trim());
    });
});

// ===== UTILITIES =====
const utils = {
    isMobile: () => window.innerWidth <= 768,
    isTablet: () => window.innerWidth <= 1024 && window.innerWidth > 768,
    generateId: () => Math.random().toString(36).substr(2, 9),
    formatDate: (date) => new Intl.DateTimeFormat('en-US').format(date),
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 ML Engineer Portfolio initialized successfully!');
    
    // Initialize all modules
    initScrollReveal();
    initCounters();
    initTabs();
    initTypingEffect();
    initParallax();
    initGlassEffects();
    initPerformanceOptimizations();
    initEasterEggs();
    initProjectCardEffects();
    initCVViewer();
    initMobileOptimizations();
    
    // Skills section is now handled by CSS only
    
    // Add loaded class for CSS transitions
    document.body.classList.add('loaded');
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('👋 Welcome! Explore my ML & Healthcare AI projects', 'success');
    }, 2000);
});

// Initialize animations when page loads
window.addEventListener('load', () => {
    createDNAAnimation();
    initBackgroundAnimation();
    
    // Trigger initial reveal for elements in viewport
    const event = new Event('scroll');
    window.dispatchEvent(event);
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Portfolio Error:', e.error);
    // You could send this to an error tracking service
});

// ===== EXPORT UTILITIES =====
window.portfolioUtils = utils;
window.showNotification = showNotification;
window.trackEvent = trackEvent;

// ===== PAGE VISIBILITY API =====
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = '💼 Come back to explore ML projects!';
    } else {
        document.title = 'Javier Boix Campos - ML Engineer & Tech Lead | AI for Healthcare';
    }
});

// ===== PRELOAD CRITICAL RESOURCES =====
function preloadCriticalResources() {
    const criticalImages = [
        'https://www.biorxiv.org/content/biorxiv/early/2024/08/07/2024.03.29.585638/F1.large.jpg?width=800&height=600&carousel=1',
        'https://media.licdn.com/dms/image/v2/D4D22AQEOpSKrHW2BZA/feedshare-shrink_2048_1536/B4DZbJtpsZHQAo-/0/1747140910574?e=1750291200&v=beta&t=E-kB49Wk89ipxDn9I8_Qfyc5EgtPkM1EyRjOt7waJgk'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

preloadCriticalResources();

// ===== CV FUNCTIONALITY =====
function initCVViewer() {
    const viewCVBtn = document.getElementById('view-cv-btn');
    if (!viewCVBtn) return;

    viewCVBtn.addEventListener('click', async () => {
        try {
            showNotification('Loading CV...', 'info');
            
            // Fetch the CV data
            const response = await fetch('./assets/cv.json');
            if (!response.ok) throw new Error('Failed to load CV data');
            
            const cvData = await response.json();
            
            // Generate and open CV
            openCVInNewTab(cvData);
            
        } catch (error) {
            console.error('Error loading CV:', error);
            showNotification('Failed to load CV. Please try again.', 'error');
        }
    });
}

function openCVInNewTab(cvData) {
    const cvHTML = generateCVHTML(cvData);
    const newWindow = window.open('', '_blank');
    
    if (newWindow) {
        newWindow.document.write(cvHTML);
        newWindow.document.close();
        showNotification('CV opened in new tab!', 'success');
    } else {
        showNotification('Please allow popups to view CV', 'warning');
    }
}

function generateCVHTML(data) {
    const { basics, education, work, skills, projects, awards } = data;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${basics.name} - CV</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        ${getCVStyles()}
    </style>
</head>
<body>
    <div class="cv-container">
        <!-- Header Section -->
        <header class="cv-header glass-card">
            <div class="header-content">
                <div class="personal-info">
                    <h1 class="cv-name gradient-text">${basics.name}</h1>
                    <p class="cv-summary">${basics.summary}</p>
                </div>
                <div class="contact-info">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <a href="mailto:${basics.email}">${basics.email}</a>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${basics.phone}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-globe"></i>
                        <a href="https://${basics.website}" target="_blank">${basics.website}</a>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${basics.location.address}</span>
                    </div>
                </div>
            </div>
        </header>

        <div class="cv-content">
            <!-- Work Experience -->
            <section class="cv-section glass-card">
                <h2 class="section-title">
                    <i class="fas fa-briefcase"></i>
                    Work Experience
                </h2>
                <div class="timeline">
                    ${work.map(job => `
                        <div class="timeline-item">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h3 class="job-title">${job.position}</h3>
                                <h4 class="company">${job.company}</h4>
                                <div class="job-meta">
                                    <span class="date">
                                        <i class="fas fa-calendar"></i>
                                        ${job.startDate} - ${job.endDate}
                                    </span>
                                    <span class="location">
                                        <i class="fas fa-map-marker-alt"></i>
                                        ${job.location}
                                    </span>
                                </div>
                                <ul class="job-highlights">
                                    ${job.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Education -->
            <section class="cv-section glass-card">
                <h2 class="section-title">
                    <i class="fas fa-graduation-cap"></i>
                    Education
                </h2>
                <div class="education-list">
                    ${education.map(edu => `
                        <div class="education-item">
                            <h3 class="degree">${edu.studyType}</h3>
                            <h4 class="institution">${edu.institution}</h4>
                            <span class="date">
                                <i class="fas fa-calendar"></i>
                                ${edu.startDate} - ${edu.endDate}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Skills -->
            <section class="cv-section glass-card">
                <h2 class="section-title">
                    <i class="fas fa-code"></i>
                    Programming Languages
                </h2>
                <div class="skills-grid">
                    ${skills.map(skill => `
                        <div class="skill-item">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-level">${skill.keywords[0]}</span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Languages -->
            <section class="cv-section glass-card">
                <h2 class="section-title">
                    <i class="fas fa-language"></i>
                    Languages
                </h2>
                <div class="languages-grid">
                    ${projects.map(lang => `
                        <div class="language-item">
                            <span class="language-name">${lang.name}</span>
                            <span class="language-level">${lang.url}</span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Certifications -->
            <section class="cv-section glass-card">
                <h2 class="section-title">
                    <i class="fas fa-certificate"></i>
                    Licenses and Certifications
                </h2>
                <div class="certifications-grid">
                    ${awards.map(award => `
                        <div class="certification-item">
                            <h4 class="cert-title">${award.title}</h4>
                            <span class="cert-issuer">${award.awarder}</span>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>

        <!-- Print Button -->
        <button class="print-btn" onclick="window.print()">
            <i class="fas fa-print"></i>
            Print CV
        </button>
    </div>
</body>
</html>`;
}

function getCVStyles() {
    return `
        :root {
            --primary-gradient: linear-gradient(45deg, #00ff9d, #00b8ff);
            --primary-color: #00ff9d;
            --secondary-color: #00b8ff;
            --bg-primary: #111827;
            --bg-secondary: #1f2937;
            --text-primary: #ffffff;
            --text-secondary: #d1d5db;
            --text-muted: #9ca3af;
            --glass-bg: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
            --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            --border-radius: 1rem;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family);
            line-height: 1.6;
            color: var(--text-primary);
            background: var(--bg-primary);
            min-height: 100vh;
        }

        .gradient-text {
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 0 30px rgba(0, 255, 157, 0.3);
        }

        .glass-card {
            backdrop-filter: blur(20px);
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: var(--border-radius);
            box-shadow: var(--glass-shadow);
            transition: var(--transition);
        }

        .cv-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
        }

        .cv-header {
            margin-bottom: 2rem;
            padding: 2rem;
        }

        .header-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            align-items: start;
        }

        .cv-name {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .cv-summary {
            font-size: 1.1rem;
            color: var(--text-secondary);
            line-height: 1.6;
        }

        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: var(--text-secondary);
        }

        .contact-item i {
            color: var(--primary-color);
            width: 20px;
            text-align: center;
        }

        .contact-item a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: var(--transition);
        }

        .contact-item a:hover {
            color: var(--primary-color);
        }

        .cv-content {
            display: grid;
            gap: 2rem;
        }

        .cv-section {
            padding: 2rem;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid var(--glass-border);
        }

        .section-title i {
            font-size: 1.2rem;
        }

        /* Timeline Styles */
        .timeline {
            position: relative;
            padding-left: 2rem;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 0.75rem;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--primary-gradient);
        }

        .timeline-item {
            position: relative;
            margin-bottom: 2rem;
        }

        .timeline-marker {
            position: absolute;
            left: -2.25rem;
            top: 0.5rem;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--primary-color);
            border: 3px solid var(--bg-primary);
            box-shadow: 0 0 0 3px var(--primary-color);
        }

        .timeline-content {
            background: rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--glass-border);
        }

        .job-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .company {
            font-size: 1rem;
            font-weight: 500;
            color: var(--primary-color);
            margin-bottom: 0.75rem;
        }

        .job-meta {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }

        .job-meta span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .job-meta i {
            color: var(--primary-color);
        }

        .job-highlights {
            list-style: none;
            margin-left: 0;
        }

        .job-highlights li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.75rem;
            color: var(--text-secondary);
            line-height: 1.6;
        }

        .job-highlights li::before {
            content: '▶';
            position: absolute;
            left: 0;
            color: var(--primary-color);
            font-size: 0.8rem;
        }

        /* Education Styles */
        .education-list {
            display: grid;
            gap: 1.5rem;
        }

        .education-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--glass-border);
        }

        .degree {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .institution {
            font-size: 1rem;
            color: var(--primary-color);
            margin-bottom: 0.75rem;
        }

        .date {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .date i {
            color: var(--primary-color);
        }

        /* Skills Grid */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }

        .skill-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--glass-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .skill-name {
            font-weight: 500;
            color: var(--text-primary);
        }

        .skill-level {
            color: var(--primary-color);
            font-size: 0.9rem;
            font-weight: 500;
        }

        /* Languages Grid */
        .languages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .language-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--glass-border);
            text-align: center;
        }

        .language-name {
            display: block;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .language-level {
            color: var(--primary-color);
            font-size: 0.9rem;
        }

        /* Certifications Grid */
        .certifications-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
        }

        .certification-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--glass-border);
        }

        .cert-title {
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
        }

        .cert-issuer {
            color: var(--primary-color);
            font-size: 0.85rem;
            font-weight: 500;
        }

        /* Print Button */
        .print-btn {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--primary-gradient);
            color: white;
            border: none;
            padding: 1rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 255, 157, 0.3);
            transition: var(--transition);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 1000;
        }

        .print-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 255, 157, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .cv-container {
                padding: 1rem;
            }

            .header-content {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .cv-name {
                font-size: 2rem;
            }

            .job-meta {
                flex-direction: column;
                gap: 0.5rem;
            }

            .skills-grid,
            .languages-grid,
            .certifications-grid {
                grid-template-columns: 1fr;
            }

            .print-btn {
                bottom: 1rem;
                right: 1rem;
                padding: 0.75rem 1rem;
            }
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
                color: black;
            }

            .glass-card {
                background: white;
                border: 1px solid #ddd;
                box-shadow: none;
                backdrop-filter: none;
            }

            .print-btn {
                display: none;
            }

            .gradient-text {
                color: #333 !important;
                background: none !important;
                -webkit-background-clip: initial !important;
                background-clip: initial !important;
            }

            .section-title,
            .job-title,
            .company,
            .skill-level,
            .language-level,
            .cert-issuer {
                color: #333 !important;
            }

            .timeline::before {
                background: #333;
            }

            .timeline-marker {
                background: #333;
                box-shadow: 0 0 0 3px #333;
            }
        }
    `;
}

function initMobileOptimizations() {
  // Reduce animation complexity on mobile
  if (utils.isMobile()) {
    // Disable heavy 3D effects
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
      card.style.transform = 'none';
      card.addEventListener('mousemove', (e) => {
        e.preventDefault();
      });
    });

    // Simplify background animation
    const canvas = document.getElementById('background-animation');
    if (canvas) {
      canvas.style.opacity = '0.05';
    }
  }
}

// ===== SKILLS CHARTS AND ANIMATIONS =====
function initSkillsChart() {
    const canvas = document.getElementById('skillsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 300;
    canvas.height = 300;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 120;
    
    // Skills data
    const skills = [
        { name: 'Python/R', value: 35, color: '#00ff9d' },
        { name: 'Data Science', value: 25, color: '#00b8ff' },
        { name: 'ML/AI', value: 20, color: '#8b5cf6' },
        { name: 'Cloud/DevOps', value: 12, color: '#fbbf24' },
        { name: 'Web Dev', value: 8, color: '#ef4444' }
    ];
    
    let currentAngle = 0;
    let animationProgress = 0;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (animationProgress < 1) {
            animationProgress += 0.02;
        }
        
        const progress = easeOutCubic(Math.min(animationProgress, 1));
        
        skills.forEach((skill, index) => {
            const sliceAngle = (skill.value / 100) * 2 * Math.PI * progress;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            
            // Create gradient
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, skill.color + '40');
            gradient.addColorStop(1, skill.color);
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = skill.color;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw label
            if (progress > 0.5) {
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
                const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(skill.name, labelX, labelY);
                ctx.fillText(`${skill.value}%`, labelX, labelY + 15);
            }
            
            currentAngle += sliceAngle;
        });
        
        if (animationProgress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    // Start animation when chart comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate();
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(canvas);
}

function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const percentage = bar.dataset.percentage;
                
                setTimeout(() => {
                    bar.style.width = percentage + '%';
                }, 200);
                
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => observer.observe(bar));
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ===== INTERACTIVE CHART SELECTOR =====
function initInteractiveCharts() {
    const canvas = document.getElementById('interactiveChart');
    const chartButtons = document.querySelectorAll('.chart-btn');
    
    if (!canvas || !chartButtons.length) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 350;
    canvas.height = 350;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 140;
    
    // Different chart data sets
    const chartData = {
        category: {
            title: 'Skills by Category',
            data: [
                { name: 'Data Science', value: 40, color: '#00ff9d' },
                { name: 'Programming', value: 30, color: '#00b8ff' },
                { name: 'AI/ML', value: 20, color: '#8b5cf6' },
                { name: 'Cloud/DevOps', value: 10, color: '#fbbf24' }
            ]
        },
        proficiency: {
            title: 'Skills by Proficiency Level',
            data: [
                { name: 'Advanced', value: 45, color: '#00ff9d' },
                { name: 'Intermediate', value: 35, color: '#fbbf24' },
                { name: 'Beginner', value: 20, color: '#8b5cf6' }
            ]
        },
        usage: {
            title: 'Skills by Daily Usage',
            data: [
                { name: 'Daily', value: 50, color: '#00ff9d' },
                { name: 'Weekly', value: 30, color: '#00b8ff' },
                { name: 'Monthly', value: 15, color: '#fbbf24' },
                { name: 'Occasionally', value: 5, color: '#ef4444' }
            ]
        },
        projects: {
            title: 'Skills by Project Count',
            data: [
                { name: 'Python Projects', value: 35, color: '#00ff9d' },
                { name: 'R Projects', value: 25, color: '#00b8ff' },
                { name: 'Web Projects', value: 20, color: '#8b5cf6' },
                { name: 'ML Projects', value: 15, color: '#fbbf24' },
                { name: 'Other', value: 5, color: '#ef4444' }
            ]
        }
    };
    
    let currentChart = 'category';
    let animationProgress = 0;
    let isAnimating = false;
    
    function drawChart(chartType) {
        const chart = chartData[chartType];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (animationProgress < 1) {
            animationProgress += 0.03;
        }
        
        const progress = easeOutCubic(Math.min(animationProgress, 1));
        let currentAngle = -Math.PI / 2; // Start from top
        
        chart.data.forEach((slice, index) => {
            const sliceAngle = (slice.value / 100) * 2 * Math.PI * progress;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            
            // Create gradient
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, slice.color + '60');
            gradient.addColorStop(1, slice.color);
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Draw border
            ctx.strokeStyle = slice.color;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw label
            if (progress > 0.3) {
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius + 40);
                const labelY = centerY + Math.sin(labelAngle) * (radius + 40);
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(slice.name, labelX, labelY);
                ctx.font = '10px Inter, sans-serif';
                ctx.fillText(`${slice.value}%`, labelX, labelY + 15);
            }
            
            currentAngle += sliceAngle;
        });
        
        // Draw center title
        if (progress > 0.7) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(chart.title, centerX, centerY - 10);
        }
        
        if (animationProgress < 1) {
            requestAnimationFrame(() => drawChart(chartType));
        } else {
            isAnimating = false;
        }
    }
    
    function switchChart(newChartType) {
        if (isAnimating || newChartType === currentChart) return;
        
        currentChart = newChartType;
        animationProgress = 0;
        isAnimating = true;
        
        // Update button states
        chartButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.chart === newChartType) {
                btn.classList.add('active');
            }
        });
        
        drawChart(newChartType);
    }
    
    // Add click listeners to buttons
    chartButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchChart(btn.dataset.chart);
        });
    });
    
    // Initialize with first chart when it comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                switchChart('category');
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(canvas);
}
