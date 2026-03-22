/**
 * Interactive diagrams for gas theory
 * - Gas Ideal: click to change P and V (PV=nRT)
 * - Gas Real: compress/expand particles
 * - Formula: click parts for tooltips
 * - Animated counters
 * - SVG stroke draw animation
 */
(function () {
    // ============================
    // GAS IDEAL — PV = nRT interactive
    // ============================
    const systemA = document.getElementById('systemA');
    const systemB = document.getElementById('systemB');
    const displayP = document.getElementById('displayP');
    const displayV = document.getElementById('displayV');

    if (systemA && systemB && displayP && displayV) {
        // n=1 mol, R=0.0821 L·atm/(mol·K), T=273.15K (0°C)
        const nRT = 1 * 0.0821 * 273.15; // ≈ 22.4
        const pressures = [0.5, 1, 2, 4, 8];
        let pIndex = 1;

        function updateGasDisplay() {
            const P = pressures[pIndex];
            const V = (nRT / P).toFixed(1);
            displayP.textContent = P + ' atm';
            displayV.textContent = V + ' L';

            // Color: high pressure = warm, low = cool
            systemA.style.borderColor = P > 2 ? '#e8943a' : P < 1 ? '#1a4a7a' : '#2d6a9f';
            systemB.style.borderColor = parseFloat(V) < 10 ? '#e8943a' : '#2d6a9f';
        }

        systemA.style.cursor = 'pointer';
        systemB.style.cursor = 'pointer';

        systemA.addEventListener('click', function () {
            pIndex = (pIndex + 1) % pressures.length;
            updateGasDisplay();
        });

        systemB.addEventListener('click', function () {
            pIndex = (pIndex + 1) % pressures.length;
            updateGasDisplay();
        });
    }

    // ============================
    // FORMULA — PV=nRT tooltips
    // ============================
    const formulaParts = document.querySelectorAll('.formula-part');
    const tooltip = document.getElementById('formulaTooltip');

    if (formulaParts.length && tooltip) {
        formulaParts.forEach(function (part) {
            part.addEventListener('click', function () {
                const info = part.getAttribute('data-info');
                const wasActive = part.classList.contains('active');

                formulaParts.forEach(function (p) { p.classList.remove('active'); });

                if (wasActive) {
                    tooltip.classList.remove('visible');
                } else {
                    part.classList.add('active');
                    tooltip.textContent = info;
                    tooltip.classList.add('visible');
                }
            });
        });
    }

    // ============================
    // GAS REAL — Compress/Expand particles
    // ============================
    const btnShuffle = document.getElementById('btnShuffle');
    const btnReset = document.getElementById('btnReset');
    const entropyContainer = document.getElementById('entropyParticles');
    const entropyLabel = document.getElementById('entropyLabel');

    if (btnShuffle && entropyContainer) {
        let compressed = false;

        btnShuffle.addEventListener('click', function () {
            if (compressed) return;
            compressed = true;
            entropyContainer.classList.add('compressed');
            if (entropyLabel) entropyLabel.textContent = 'Moléculas próximas (Z ≠ 1)';
        });

        btnReset.addEventListener('click', function () {
            if (!compressed) return;
            compressed = false;
            entropyContainer.classList.remove('compressed');
            if (entropyLabel) entropyLabel.textContent = 'Sem interações (Z = 1)';
        });
    }

    // ============================
    // ANIMATED COUNTERS
    // ============================
    const counters = document.querySelectorAll('.counter');

    if (counters.length) {
        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function animateCounter(el) {
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const decimals = parseInt(el.dataset.decimals) || 0;
            const duration = 2000;
            const start = performance.now();
            const isNegative = target < 0;
            const absTarget = Math.abs(target);

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOutExpo(progress);
                const current = eased * absTarget;
                const value = isNegative ? -current : current;

                el.textContent = value.toFixed(decimals) + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    // Clean up trailing zeros for integers
                    var finalText = target.toFixed(decimals);
                    if (decimals === 0) finalText = Math.round(target).toString();
                    el.textContent = finalText + suffix;
                }
            }

            requestAnimationFrame(update);
        }

        var counterObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach(function (c) { counterObserver.observe(c); });
    }

    // ============================
    // SVG STROKE DRAW ANIMATION
    // ============================
    var svgDrawElements = document.querySelectorAll('.svg-draw');

    if (svgDrawElements.length) {
        svgDrawElements.forEach(function (svg) {
            var paths = svg.querySelectorAll('path, rect, circle, line, polyline, polygon');
            paths.forEach(function (path) {
                if (path.getAttribute('fill') === 'currentColor') return;
                if (!path.getAttribute('stroke')) return;

                var length = path.getTotalLength ? path.getTotalLength() : 200;
                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = length;
                path.style.transition = 'stroke-dashoffset 1.5s ease-out';
            });
        });

        var svgObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var paths = entry.target.querySelectorAll('path, rect, circle, line, polyline, polygon');
                        paths.forEach(function (path, i) {
                            if (path.style.strokeDashoffset) {
                                setTimeout(function () {
                                    path.style.strokeDashoffset = '0';
                                }, i * 200);
                            }
                        });
                        svgObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        svgDrawElements.forEach(function (svg) { svgObserver.observe(svg); });
    }
})();
