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

    // ============================
    // Z FACTOR CHART
    // ============================
    var zCanvas = document.getElementById('zChart');
    if (zCanvas) {
        var zCtx = zCanvas.getContext('2d');
        var chartDrawn = false;

        // Gas data: approximate Z vs P curves at ~300K
        var gases = [
            {
                name: 'H₂',
                color: '#4fc3f7',
                data: [[0,1],[50,1.03],[100,1.06],[200,1.13],[400,1.28],[600,1.44],[800,1.61],[1000,1.8]]
            },
            {
                name: 'He',
                color: '#81d4fa',
                data: [[0,1],[50,1.02],[100,1.05],[200,1.10],[400,1.22],[600,1.34],[800,1.48],[1000,1.62]]
            },
            {
                name: 'N₂',
                color: '#aed581',
                data: [[0,1],[50,0.98],[100,0.97],[200,0.99],[400,1.10],[600,1.24],[800,1.40],[1000,1.58]]
            },
            {
                name: 'O₂',
                color: '#fff176',
                data: [[0,1],[50,0.97],[100,0.96],[200,0.98],[400,1.08],[600,1.22],[800,1.37],[1000,1.54]]
            },
            {
                name: 'CO₂',
                color: '#ff8a65',
                data: [[0,1],[50,0.82],[100,0.68],[200,0.52],[400,0.78],[600,1.05],[800,1.30],[1000,1.52]]
            },
            {
                name: 'NH₃',
                color: '#f48fb1',
                data: [[0,1],[50,0.75],[100,0.58],[200,0.42],[400,0.65],[600,0.92],[800,1.18],[1000,1.42]]
            }
        ];

        function drawZChart() {
            var w = zCanvas.width;
            var h = zCanvas.height;
            var dpr = window.devicePixelRatio || 1;

            zCanvas.width = zCanvas.offsetWidth * dpr;
            zCanvas.height = zCanvas.offsetHeight * dpr;
            zCtx.scale(dpr, dpr);

            w = zCanvas.offsetWidth;
            h = zCanvas.offsetHeight;

            var pad = { top: 30, right: 30, bottom: 50, left: 55 };
            var plotW = w - pad.left - pad.right;
            var plotH = h - pad.top - pad.bottom;

            // Background
            zCtx.fillStyle = 'rgba(15, 25, 45, 0.6)';
            zCtx.fillRect(0, 0, w, h);

            // Grid
            zCtx.strokeStyle = 'rgba(255,255,255,0.08)';
            zCtx.lineWidth = 1;

            // Y axis grid (Z values)
            var zMin = 0.2, zMax = 2.0;
            for (var z = 0.4; z <= 2.0; z += 0.2) {
                var y = pad.top + plotH - ((z - zMin) / (zMax - zMin)) * plotH;
                zCtx.beginPath();
                zCtx.moveTo(pad.left, y);
                zCtx.lineTo(w - pad.right, y);
                zCtx.stroke();

                zCtx.fillStyle = 'rgba(176, 196, 222, 0.6)';
                zCtx.font = '11px Inter, sans-serif';
                zCtx.textAlign = 'right';
                zCtx.fillText(z.toFixed(1), pad.left - 8, y + 4);
            }

            // X axis grid (Pressure)
            var pMax = 1000;
            for (var p = 0; p <= 1000; p += 200) {
                var x = pad.left + (p / pMax) * plotW;
                zCtx.beginPath();
                zCtx.moveTo(x, pad.top);
                zCtx.lineTo(x, pad.top + plotH);
                zCtx.stroke();

                zCtx.fillStyle = 'rgba(176, 196, 222, 0.6)';
                zCtx.textAlign = 'center';
                zCtx.fillText(p + '', x, h - pad.bottom + 20);
            }

            // Z = 1 reference line (ideal gas)
            var idealY = pad.top + plotH - ((1 - zMin) / (zMax - zMin)) * plotH;
            zCtx.strokeStyle = 'rgba(244, 184, 96, 0.4)';
            zCtx.setLineDash([6, 4]);
            zCtx.lineWidth = 1.5;
            zCtx.beginPath();
            zCtx.moveTo(pad.left, idealY);
            zCtx.lineTo(w - pad.right, idealY);
            zCtx.stroke();
            zCtx.setLineDash([]);

            zCtx.fillStyle = 'rgba(244, 184, 96, 0.6)';
            zCtx.textAlign = 'left';
            zCtx.font = '11px Inter, sans-serif';
            zCtx.fillText('Gás Ideal (Z = 1)', w - pad.right - 110, idealY - 6);

            // Axis labels
            zCtx.fillStyle = 'rgba(176, 196, 222, 0.8)';
            zCtx.font = '12px Inter, sans-serif';
            zCtx.textAlign = 'center';
            zCtx.fillText('Pressão (atm)', w / 2, h - 8);

            zCtx.save();
            zCtx.translate(14, h / 2);
            zCtx.rotate(-Math.PI / 2);
            zCtx.fillText('Fator Z (PV/nRT)', 0, 0);
            zCtx.restore();

            // Draw curves
            gases.forEach(function (gas) {
                zCtx.strokeStyle = gas.color;
                zCtx.lineWidth = 2.5;
                zCtx.lineJoin = 'round';
                zCtx.beginPath();

                gas.data.forEach(function (point, i) {
                    var px = pad.left + (point[0] / pMax) * plotW;
                    var py = pad.top + plotH - ((point[1] - zMin) / (zMax - zMin)) * plotH;
                    if (i === 0) zCtx.moveTo(px, py);
                    else zCtx.lineTo(px, py);
                });
                zCtx.stroke();

                // Label at end of curve
                var last = gas.data[gas.data.length - 1];
                var lx = pad.left + (last[0] / pMax) * plotW + 4;
                var ly = pad.top + plotH - ((last[1] - zMin) / (zMax - zMin)) * plotH;
                zCtx.fillStyle = gas.color;
                zCtx.font = 'bold 11px Inter, sans-serif';
                zCtx.textAlign = 'left';
                zCtx.fillText(gas.name, lx, ly + 4);
            });

            // Build legend
            var legendEl = document.getElementById('chartLegend');
            if (legendEl && !legendEl.hasChildNodes()) {
                gases.forEach(function (gas) {
                    var item = document.createElement('span');
                    item.className = 'legend-item';
                    item.innerHTML = '<span class="legend-dot" style="background:' + gas.color + '"></span>' + gas.name;
                    legendEl.appendChild(item);
                });
            }
        }

        var chartObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !chartDrawn) {
                    chartDrawn = true;
                    drawZChart();
                    chartObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        chartObserver.observe(zCanvas);

        window.addEventListener('resize', function () {
            if (chartDrawn) {
                drawZChart();
            }
        });
    }
})();
