/* ==============================================
   EMBER NOIR v2 — Scroll-Driven Interactions
   GSAP ScrollTrigger (pins only) + IntersectionObserver (reveals)
   ============================================== */

(function () {
    'use strict';

    // Progressive enhancement
    document.documentElement.classList.replace('no-js', 'js');

    // GSAP setup
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ------------------------------------------
       1. SCROLL REVEAL (IntersectionObserver)
       Simple, reliable, no GSAP dependency.
       ------------------------------------------ */
    const revealEls = document.querySelectorAll('.scroll-reveal');
    if (revealEls.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    /* ------------------------------------------
       2. PARTICLE CONSTELLATION (Hero Canvas)
       ------------------------------------------ */
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const particles = [];
        const PARTICLE_COUNT = 70;
        const CONNECTION_DIST = 130;
        const MOUSE_RADIUS = 160;
        let mouse = { x: null, y: null };
        let canvasW = 0, canvasH = 0;
        let heroVisible = true;

        function resizeCanvas() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            canvasW = rect.width;
            canvasH = rect.height;
            canvas.width = canvasW * dpr;
            canvas.height = canvasH * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvasW;
                this.y = Math.random() * canvasH;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 1.8 + 0.5;
                this.alpha = Math.random() * 0.5 + 0.15;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0) this.x = canvasW;
                if (this.x > canvasW) this.x = 0;
                if (this.y < 0) this.y = canvasH;
                if (this.y > canvasH) this.y = 0;

                if (mouse.x !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MOUSE_RADIUS) {
                        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                        this.x += (dx / dist) * force * 1.5;
                        this.y += (dy / dist) * force * 1.5;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(224, 122, 95, ${this.alpha})`;
                ctx.fill();
                if (this.r > 1.5) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(224, 122, 95, ${this.alpha * 0.1})`;
                    ctx.fill();
                }
            }
        }

        function initParticles() {
            particles.length = 0;
            for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(224, 122, 95, ${(1 - dist / CONNECTION_DIST) * 0.12})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            if (!heroVisible) { requestAnimationFrame(animate); return; }
            ctx.clearRect(0, 0, canvasW, canvasH);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
        document.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        new IntersectionObserver(([entry]) => {
            heroVisible = entry.isIntersecting;
        }, { threshold: 0 }).observe(document.getElementById('hero'));

        resizeCanvas();
        initParticles();
        animate();
    }

    /* ------------------------------------------
       3. CUSTOM CURSOR
       ------------------------------------------ */
    const cursorEl = document.getElementById('cursor');
    if (cursorEl && window.innerWidth > 768) {
        let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0;
        const dot = cursorEl.querySelector('.cursor-dot');
        const ring = cursorEl.querySelector('.cursor-ring');

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            dot.style.transform = `translate(${cursorX - 3}px, ${cursorY - 3}px)`;
        });

        (function updateRing() {
            ringX += (cursorX - ringX) * 0.12;
            ringY += (cursorY - ringY) * 0.12;
            const offset = cursorEl.classList.contains('is-hovering') ? 32 : 20;
            ring.style.transform = `translate(${ringX - offset}px, ${ringY - offset}px)`;
            requestAnimationFrame(updateRing);
        })();

        document.querySelectorAll('a, button, [data-magnetic]').forEach(el => {
            el.addEventListener('mouseenter', () => cursorEl.classList.add('is-hovering'));
            el.addEventListener('mouseleave', () => cursorEl.classList.remove('is-hovering'));
        });
    }

    /* ------------------------------------------
       4. MAGNETIC BUTTONS
       ------------------------------------------ */
    if (window.innerWidth > 768) {
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
                const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
                el.style.transform = `translate(${dx}px, ${dy}px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
                el.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
                setTimeout(() => { el.style.transition = ''; }, 500);
            });
        });
    }

    /* ------------------------------------------
       5. HERO ENTRANCE + PARALLAX
       ------------------------------------------ */
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({ delay: 0.3 });
        tl.to('.hero-eyebrow .reveal-line-inner', { y: '0%', duration: 1, ease: 'expo.out' })
          .to('.hero-name .reveal-line-inner', { y: '0%', duration: 1.1, ease: 'expo.out', stagger: 0.1 }, '-=0.7')
          .to('.hero-sub .reveal-line-inner', { y: '0%', duration: 1, ease: 'expo.out' }, '-=0.6')
          .to('.reveal-fade', { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, '-=0.5')
          .to('.scroll-indicator', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.3');

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.to('.hero-content', {
                y: -100, opacity: 0, ease: 'none',
                scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
            });
            gsap.to('.scroll-indicator', {
                opacity: 0, ease: 'none',
                scrollTrigger: { trigger: '.hero', start: '10% top', end: '30% top', scrub: true }
            });
        }
    }

    /* ------------------------------------------
       6. SCROLL WORDS SECTION
       ------------------------------------------ */
    const wordsSection = document.getElementById('words');
    if (wordsSection && typeof ScrollTrigger !== 'undefined') {
        const words = wordsSection.querySelectorAll('.word');
        ScrollTrigger.create({
            trigger: wordsSection,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
                const p = self.progress;
                const count = words.length;
                words.forEach((word, i) => {
                    word.classList.toggle('is-active', p >= i / count && p < (i + 1) / count);
                });
            }
        });
    }

    /* ------------------------------------------
       7. PROJECTS HORIZONTAL SCROLL
       ------------------------------------------ */
    const projectsTrack = document.getElementById('projectsTrack');
    if (projectsTrack && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && window.innerWidth > 768) {
        const projectsSection = document.querySelector('.projects');

        gsap.to(projectsTrack, {
            x: () => -(projectsTrack.scrollWidth - window.innerWidth + 64),
            ease: 'none',
            scrollTrigger: {
                trigger: projectsSection,
                start: 'top top',
                end: () => `+=${projectsTrack.scrollWidth - window.innerWidth + 64}`,
                pin: true,
                scrub: 0.5,
                invalidateOnRefresh: true,
            }
        });
    }

    /* ------------------------------------------
       8. NAVIGATION
       ------------------------------------------ */
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
        });
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('is-active');
            navLinks.classList.toggle('is-open');
        });
        navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('is-active');
                navLinks.classList.remove('is-open');
            });
        });
    }

    /* ------------------------------------------
       9. SMOOTH SCROLL FOR ANCHORS
       ------------------------------------------ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ------------------------------------------
       10. SCROLL PROGRESS BAR
       ------------------------------------------ */
    const progress = document.getElementById('progress');
    if (progress) {
        window.addEventListener('scroll', () => {
            const scrolled = document.documentElement.scrollTop;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (scrolled / max * 100) + '%';
        });
    }

})();
