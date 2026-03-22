/**
 * Scroll-triggered animations using Intersection Observer API
 */
(function () {
    const animatedElements = document.querySelectorAll(
        '.anim-fade-in, .anim-slide-up, .anim-slide-left, .anim-slide-right, .anim-scale-in'
    );

    if (!animatedElements.length) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animatedElements.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once animated
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    animatedElements.forEach(el => observer.observe(el));
})();
