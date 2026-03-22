/**
 * Main application logic
 * - Navbar scroll behavior
 * - Mobile menu toggle
 * - Progress bar
 * - Active nav link tracking
 * - Particle canvas animation
 */
(function () {
    // ============================
    // NAVBAR
    // ============================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const progressBar = document.getElementById('progressBar');

    // Scroll — add background to navbar
    let lastScroll = 0;
    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Progress bar
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollY / docHeight) * 100;
        progressBar.style.width = progress + '%';

        lastScroll = scrollY;
    }, { passive: true });

    // Mobile menu toggle
    navToggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
        // Animate hamburger
        navToggle.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function () {
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
        });
    });

    // ============================
    // ACTIVE NAV LINK TRACKING
    // ============================
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navAnchors = navLinks.querySelectorAll('a');

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navAnchors.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
                    });
                }
            });
        },
        {
            threshold: 0.3,
            rootMargin: '-80px 0px -40% 0px'
        }
    );

    sections.forEach(section => sectionObserver.observe(section));

    // ============================
    // PARTICLE CANVAS (Hero)
    // ============================
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    const mouse = { x: null, y: null, radius: 120 };

    function resizeCanvas() {
        const hero = canvas.parentElement;
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.4,
                speedY: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.5 + 0.1,
                // Color: warm tones
                hue: Math.random() > 0.5 ? 30 + Math.random() * 20 : 200 + Math.random() * 30
            });
        }
    }

    // Mouse interaction
    canvas.addEventListener('mousemove', function (e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', function () {
        mouse.x = null;
        mouse.y = null;
    });

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            // Mouse repulsion
            if (mouse.x !== null && mouse.y !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    p.x += Math.cos(angle) * force * 3;
                    p.y += Math.sin(angle) * force * 3;
                }
            }

            // Move
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
            ctx.fill();

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(244, 184, 96, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });

        animationId = requestAnimationFrame(drawParticles);
    }

    // Pause when not visible
    const heroObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationId) drawParticles();
                } else {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            });
        },
        { threshold: 0.1 }
    );

    resizeCanvas();
    createParticles();
    drawParticles();
    heroObserver.observe(canvas.parentElement);

    window.addEventListener('resize', function () {
        resizeCanvas();
        createParticles();
    });
})();
