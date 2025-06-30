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

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
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
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
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
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabs = document.querySelectorAll('.tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));

            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }
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
        'Biotech & Data Science Specialist',
        'Bioinformatics Researcher',
        'Neural Network Developer',
        'Cell Migration Analyst'
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
    console.log('🧬 Biotech Portfolio initialized successfully!');
    
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
    
    // Add loaded class for CSS transitions
    document.body.classList.add('loaded');
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('🔬 Welcome to my research portfolio!', 'success');
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
        document.title = '🧬 Come back to explore more research!';
    } else {
        document.title = 'Javier Boix Campos - Biotech & Data Science';
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