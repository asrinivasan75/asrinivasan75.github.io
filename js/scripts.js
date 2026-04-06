/* ==============================================
   EMBER NOIR v2 — Scroll-Driven Interactions
   GSAP + ScrollTrigger + Lenis
   ============================================== */

(function () {
    'use strict';

    /* ------------------------------------------
       0. LENIS SMOOTH SCROLL
       ------------------------------------------ */
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 1.5,
        });

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            // Let GSAP ticker drive Lenis (avoids double-rAF)
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        } else {
            // Fallback: drive Lenis with rAF
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }

    // GSAP + ScrollTrigger setup
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    /* ------------------------------------------
       1. PARTICLE CONSTELLATION (Hero Canvas)
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
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(224, 122, 95, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            if (!heroVisible) {
                requestAnimationFrame(animate);
                return;
            }
            ctx.clearRect(0, 0, canvasW, canvasH);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        document.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        // Pause when hero is off screen
        const heroObserver = new IntersectionObserver(([entry]) => {
            heroVisible = entry.isIntersecting;
        }, { threshold: 0 });
        heroObserver.observe(document.getElementById('hero'));

        resizeCanvas();
        initParticles();
        animate();
    }

    /* ------------------------------------------
       2. CUSTOM CURSOR
       ------------------------------------------ */
    const cursorEl = document.getElementById('cursor');
    if (cursorEl && window.innerWidth > 768) {
        let cursorX = 0, cursorY = 0;
        let ringX = 0, ringY = 0;
        const dot = cursorEl.querySelector('.cursor-dot');
        const ring = cursorEl.querySelector('.cursor-ring');

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            dot.style.transform = `translate(${cursorX - 3}px, ${cursorY - 3}px)`;
        });

        function updateRing() {
            ringX += (cursorX - ringX) * 0.12;
            ringY += (cursorY - ringY) * 0.12;
            ring.style.transform = `translate(${ringX - (cursorEl.classList.contains('is-hovering') ? 32 : 20)}px, ${ringY - (cursorEl.classList.contains('is-hovering') ? 32 : 20)}px)`;
            requestAnimationFrame(updateRing);
        }
        updateRing();

        // Hover states
        const hoverTargets = document.querySelectorAll('a, button, [data-magnetic]');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursorEl.classList.add('is-hovering'));
            el.addEventListener('mouseleave', () => cursorEl.classList.remove('is-hovering'));
        });
    }

    /* ------------------------------------------
       3. MAGNETIC BUTTONS
       ------------------------------------------ */
    if (window.innerWidth > 768) {
        document.querySelectorAll('[data-magnetic]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) * 0.25;
                const dy = (e.clientY - cy) * 0.25;
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
       4. HERO ENTRANCE ANIMATION
       ------------------------------------------ */
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({ delay: 0.3 });

        tl.to('.hero-eyebrow .reveal-line-inner', {
            y: '0%',
            duration: 1,
            ease: 'expo.out',
        })
        .to('.hero-name .reveal-line-inner', {
            y: '0%',
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.1,
        }, '-=0.7')
        .to('.hero-sub .reveal-line-inner', {
            y: '0%',
            duration: 1,
            ease: 'expo.out',
        }, '-=0.6')
        .to('.reveal-fade', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'expo.out',
        }, '-=0.5')
        .to('.scroll-indicator', {
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
        }, '-=0.3');

        // Hero parallax on scroll
        gsap.to('.hero-content', {
            y: -100,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            }
        });

        gsap.to('.scroll-indicator', {
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: '10% top',
                end: '30% top',
                scrub: true,
            }
        });
    }

    /* ------------------------------------------
       5. SCROLL WORDS SECTION
       ------------------------------------------ */
    const wordsSection = document.getElementById('words');
    if (wordsSection) {
        const words = wordsSection.querySelectorAll('.word');

        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.create({
                trigger: wordsSection,
                start: 'top top',
                end: 'bottom bottom',
                onUpdate: (self) => {
                    const p = self.progress;
                    const count = words.length;
                    words.forEach((word, i) => {
                        const start = i / count;
                        const end = (i + 1) / count;
                        const mid = (start + end) / 2;
                        const isActive = p >= start && p < end;
                        word.classList.toggle('is-active', isActive);
                    });
                }
            });
        }
    }

    /* ------------------------------------------
       6. ABOUT: IMAGE REVEAL + TEXT FADE
       ------------------------------------------ */
    const imageReveal = document.querySelector('.image-reveal');
    if (imageReveal && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
            trigger: imageReveal,
            start: 'top 80%',
            onEnter: () => imageReveal.classList.add('is-revealed'),
            once: true,
        });
    }

    // About text paragraphs
    document.querySelectorAll('.about-text p').forEach((p, i) => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.create({
                trigger: p,
                start: 'top 85%',
                onEnter: () => {
                    setTimeout(() => p.classList.add('is-visible'), i * 100);
                },
                once: true,
            });
        }
    });


    /* ------------------------------------------
       8. EXPERIENCE CARDS (reveal)
       ------------------------------------------ */
    document.querySelectorAll('.exp-card').forEach((card, i) => {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.from(card, {
                y: 60,
                opacity: 0,
                duration: 0.8,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                }
            });
        }
    });

    /* ------------------------------------------
       9. PROJECTS HORIZONTAL SCROLL
       ------------------------------------------ */
    const projectsTrack = document.getElementById('projectsTrack');
    if (projectsTrack && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && window.innerWidth > 768) {
        const projectsSection = document.querySelector('.projects');

        function getScrollAmount() {
            return projectsTrack.scrollWidth - window.innerWidth + 64;
        }

        gsap.to(projectsTrack, {
            x: () => -getScrollAmount(),
            ease: 'none',
            scrollTrigger: {
                trigger: projectsSection,
                start: 'top top',
                end: () => `+=${getScrollAmount()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                anticipatePin: 1,
            }
        });
    }

    /* ------------------------------------------
       10. SECTION LABELS + GENERAL REVEALS
       ------------------------------------------ */
    document.querySelectorAll('.section-label, .projects-sub, .sr').forEach(el => {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.from(el, {
                y: 24,
                opacity: 0,
                duration: 0.8,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                }
            });
        }
    });

    /* ------------------------------------------
       11. FOOTER REVEAL
       ------------------------------------------ */
    const footerHeading = document.querySelector('.footer-heading');
    if (footerHeading && typeof gsap !== 'undefined') {
        gsap.from(footerHeading, {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: footerHeading,
                start: 'top 85%',
                toggleActions: 'play none none none',
            }
        });
    }

    /* ------------------------------------------
       12. NAVIGATION
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
       13. SMOOTH SCROLL FOR ANCHOR LINKS
       ------------------------------------------ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                if (lenis) lenis.scrollTo(0);
                else window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                if (lenis) lenis.scrollTo(target);
                else target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ------------------------------------------
       14. SCROLL PROGRESS BAR
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
