/* ==============================================
   EMBER NOIR — Interactive Scripts
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------
       1. 3D WIREFRAME ICOSAHEDRON (Hero Canvas)
       ------------------------------------------ */
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const phi = (1 + Math.sqrt(5)) / 2;

        // Icosahedron geometry
        const baseVertices = [
            [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
            [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
            [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
        ];

        const edges = [
            [0,1],[0,5],[0,7],[0,10],[0,11],
            [1,5],[1,7],[1,8],[1,9],
            [2,3],[2,4],[2,6],[2,10],[2,11],
            [3,4],[3,6],[3,8],[3,9],
            [4,5],[4,9],[4,11],
            [5,9],[5,11],
            [6,7],[6,8],[6,10],
            [7,8],[7,10],
            [8,9],[10,11]
        ];

        let mouseInfluenceX = 0;
        let mouseInfluenceY = 0;
        let autoAngleX = 0;
        let autoAngleY = 0;
        let canvasW = 0;
        let canvasH = 0;

        function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvasW = rect.width;
            canvasH = rect.height;
            canvas.width = canvasW * dpr;
            canvas.height = canvasH * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function rotateVertex(v, ax, ay) {
            let [x, y, z] = v;
            const cx = Math.cos(ax), sx = Math.sin(ax);
            const y1 = y * cx - z * sx;
            const z1 = y * sx + z * cx;
            const cy = Math.cos(ay), sy = Math.sin(ay);
            const x2 = x * cy + z1 * sy;
            const z2 = -x * sy + z1 * cy;
            return [x2, y1, z2];
        }

        function drawFrame() {
            autoAngleX += 0.0025;
            autoAngleY += 0.004;

            const targetX = autoAngleX + mouseInfluenceY * 0.4;
            const targetY = autoAngleY + mouseInfluenceX * 0.4;

            const scale = Math.min(canvasW, canvasH) * 0.18;
            ctx.clearRect(0, 0, canvasW, canvasH);

            const rotated = baseVertices.map(v => rotateVertex(v, targetX, targetY));
            const projected = rotated.map(v => [
                v[0] * scale + canvasW * 0.5,
                v[1] * scale + canvasH * 0.5,
                v[2]
            ]);

            // Edges with depth-based opacity
            edges.forEach(([a, b]) => {
                const avgZ = (rotated[a][2] + rotated[b][2]) / 2;
                const edgeAlpha = clamp(0.08 + (avgZ + phi) * 0.1, 0.03, 0.45);

                ctx.beginPath();
                ctx.moveTo(projected[a][0], projected[a][1]);
                ctx.lineTo(projected[b][0], projected[b][1]);
                ctx.strokeStyle = `rgba(224, 122, 95, ${edgeAlpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Vertices as glowing dots
            projected.forEach((p, i) => {
                const z = rotated[i][2];
                const r = 1.5 + (z + phi) * 0.6;
                const vertAlpha = clamp(0.2 + (z + phi) * 0.15, 0.08, 0.7);

                ctx.beginPath();
                ctx.arc(p[0], p[1], Math.max(1, r), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(240, 160, 138, ${vertAlpha})`;
                ctx.fill();

                // Soft glow halo on brighter vertices
                if (r > 2.5) {
                    ctx.beginPath();
                    ctx.arc(p[0], p[1], r * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(224, 122, 95, ${clamp(vertAlpha * 0.15, 0, 0.15)})`;
                    ctx.fill();
                }
            });

            requestAnimationFrame(drawFrame);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        drawFrame();

        // Mouse influence
        document.addEventListener('mousemove', (e) => {
            mouseInfluenceX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseInfluenceY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    /* ------------------------------------------
       2. 3D CAROUSEL
       ------------------------------------------ */
    const ring = document.getElementById('carouselRing');
    const cells = ring ? Array.from(ring.querySelectorAll('.carousel-cell')) : [];
    const total = cells.length;
    const anglePerCell = 360 / total;
    let currentCell = 0;
    let carouselRadius = 0;
    let autoRotateId = null;
    let isDragging = false;
    let dragStartX = 0;
    let dragAngle = 0;

    function calculateRadius() {
        if (!cells.length) return 0;
        const cellWidth = cells[0].offsetWidth || 380;
        return Math.round((cellWidth / 2) / Math.tan(Math.PI / total));
    }

    function positionCells() {
        carouselRadius = calculateRadius();
        cells.forEach((cell, i) => {
            const angle = anglePerCell * i;
            cell.style.transform = `rotateY(${angle}deg) translateZ(${carouselRadius}px)`;
        });
        rotateTo(currentCell, false);
    }

    function rotateTo(index, animate) {
        currentCell = ((index % total) + total) % total;
        const rotAngle = -anglePerCell * currentCell;

        if (animate === false) {
            ring.style.transition = 'none';
        } else {
            ring.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
        }

        ring.style.transform = `translateZ(${-carouselRadius}px) rotateY(${rotAngle}deg)`;

        // Update cell states
        cells.forEach((cell, i) => {
            cell.classList.remove('is-active', 'is-adjacent');
            const diff = Math.abs(((i - currentCell + total) % total));
            const minDiff = Math.min(diff, total - diff);
            if (minDiff === 0) cell.classList.add('is-active');
            else if (minDiff === 1) cell.classList.add('is-adjacent');
        });

        // Update counter
        const counter = document.getElementById('carouselCounter');
        if (counter) counter.textContent = `${currentCell + 1} / ${total}`;
    }

    function nextCell() { rotateTo(currentCell + 1, true); }
    function prevCell() { rotateTo(currentCell - 1, true); }

    function startAutoRotate() {
        stopAutoRotate();
        autoRotateId = setInterval(() => {
            if (!isDragging) nextCell();
        }, 5000);
    }

    function stopAutoRotate() {
        if (autoRotateId) { clearInterval(autoRotateId); autoRotateId = null; }
    }

    if (ring && cells.length) {
        positionCells();
        startAutoRotate();

        // Button controls
        const prevBtn = document.getElementById('carouselPrev');
        const nextBtn = document.getElementById('carouselNext');
        if (prevBtn) prevBtn.addEventListener('click', () => { prevCell(); startAutoRotate(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { nextCell(); startAutoRotate(); });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') { nextCell(); startAutoRotate(); }
            if (e.key === 'ArrowLeft') { prevCell(); startAutoRotate(); }
        });

        // Drag / swipe
        const viewport = document.querySelector('.carousel-viewport');
        if (viewport) {
            viewport.addEventListener('mousedown', (e) => {
                isDragging = true;
                dragStartX = e.clientX;
                stopAutoRotate();
            });

            viewport.addEventListener('touchstart', (e) => {
                isDragging = true;
                dragStartX = e.touches[0].clientX;
                stopAutoRotate();
            }, { passive: true });

            function handleDragEnd(endX) {
                if (!isDragging) return;
                isDragging = false;
                const diff = endX - dragStartX;
                if (Math.abs(diff) > 40) {
                    if (diff > 0) prevCell();
                    else nextCell();
                }
                startAutoRotate();
            }

            window.addEventListener('mouseup', (e) => handleDragEnd(e.clientX));
            window.addEventListener('touchend', (e) => {
                if (e.changedTouches.length) handleDragEnd(e.changedTouches[0].clientX);
            });
        }

        // Pause on hover
        const scene = document.querySelector('.carousel-viewport');
        if (scene) {
            scene.addEventListener('mouseenter', stopAutoRotate);
            scene.addEventListener('mouseleave', startAutoRotate);
        }

        // Resize handler
        window.addEventListener('resize', () => {
            positionCells();
        });
    }

    /* ------------------------------------------
       3. CURSOR GLOW
       ------------------------------------------ */
    const glow = document.getElementById('cursorGlow');
    if (glow) {
        document.addEventListener('mousemove', (e) => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    }

    /* ------------------------------------------
       4. NAVIGATION
       ------------------------------------------ */
    const nav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll effect
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        });
    }

    // Mobile toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('is-active');
            navLinks.classList.toggle('is-open');
        });

        // Close on link click
        navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('is-active');
                navLinks.classList.remove('is-open');
            });
        });
    }

    /* ------------------------------------------
       5. SCROLL REVEAL (IntersectionObserver)
       ------------------------------------------ */
    const revealEls = document.querySelectorAll('.scroll-reveal');
    if (revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach(el => observer.observe(el));
    }

    /* ------------------------------------------
       6. EXPANDABLE TIMELINE CARDS
       ------------------------------------------ */
    document.querySelectorAll('[data-expandable]').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('is-expanded');
        });
    });

    /* ------------------------------------------
       7. TYPED.JS
       ------------------------------------------ */
    if (typeof Typed !== 'undefined' && document.getElementById('typed')) {
        new Typed('#typed', {
            strings: [
                'Computer Science @ Penn',
                'AI/ML Engineer',
                'Chess Player — 2300 USCF',
                'Competitive Programmer',
                'Building Intelligent Systems'
            ],
            typeSpeed: 45,
            backSpeed: 25,
            loop: true,
            backDelay: 1500,
            startDelay: 600,
            showCursor: true,
            cursorChar: '|',
        });
    }

    /* ------------------------------------------
       8. SCROLL PROGRESS BAR
       ------------------------------------------ */
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrolled = document.documentElement.scrollTop;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = (scrolled / maxScroll * 100) + '%';
        });
    }

    /* ------------------------------------------
       9. BACK TO TOP
       ------------------------------------------ */
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('show', window.scrollY > 400);
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ------------------------------------------
       10. SMOOTH SCROLL for anchor links
       ------------------------------------------ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});
