/**
 * Parallax effect controller
 * Moves background elements at different speeds during scroll
 */
(function () {
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile || !parallaxElements.length) return;

    let ticking = false;

    function updateParallax() {
        const scrollY = window.scrollY;

        parallaxElements.forEach(el => {
            const section = el.parentElement;
            const rect = section.getBoundingClientRect();
            const speed = parseFloat(el.dataset.speed) || 0.3;

            // Only animate if section is in viewport
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;

            const offset = scrollY * speed * 0.5;
            el.style.transform = `translate3d(0, ${-offset}px, 0)`;
        });

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
})();
