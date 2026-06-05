/* =========================================================
   hero.js — Animaciones del hero + partículas + parallax
   ========================================================= */
(function (global) {
  'use strict';

  const Hero = {
    init() {
      this.runIntro();
      this.particles();
      this.parallax();
    },

    hasGSAP() { return typeof window.gsap !== 'undefined'; },
    prefersReduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; },

    runIntro() {
      if (this.prefersReduced() || !this.hasGSAP()) {
        // Fallback: asegurar que el contenido sea visible
        document.querySelectorAll('.hero [data-anim]').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
      tl.from('.navbar', { y: -30, opacity: 0, duration: 0.6 })
        .from('.hero__eyebrow', { y: 20, opacity: 0 }, '-=0.2')
        .from('.hero__title', { y: 40, opacity: 0, duration: 1.1 }, '-=0.5')
        .from('.hero__subtitle', { y: 20, opacity: 0 }, '-=0.6')
        .from('.hero__countdown', { y: 20, opacity: 0 }, '-=0.5')
        .from('.stat-card', { y: 30, opacity: 0, stagger: 0.12 }, '-=0.5')
        .from('.hero__ctas .btn', { y: 20, opacity: 0, stagger: 0.12 }, '-=0.4')
        .from('.hero__choose-team', { y: 20, opacity: 0 }, '-=0.3');

      // Contador animado en stat-cards
      document.querySelectorAll('.stat-card__value[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: 'power2.out',
          delay: 0.8,
          onUpdate: () => { el.textContent = Math.round(obj.v); }
        });
      });
    },

    particles() {
      if (this.prefersReduced()) return;
      const canvas = document.getElementById('heroParticles');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w, h, particles = [];

      const COLORS = ['#F24B59', '#F24968', '#588C60', '#F2F2F2'];

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        w = rect.width; h = rect.height;
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        const count = Math.min(60, Math.floor((w * h) / 18000));
        particles = Array.from({ length: count }, () => this.makeParticle(w, h, COLORS));
      };

      const tick = () => {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.a;
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(tick);
      };

      resize();
      window.addEventListener('resize', resize);
      tick();
    },

    makeParticle(w, h, colors) {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        a: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    },

    parallax() {
      if (this.prefersReduced()) return;
      const hero = document.querySelector('.hero');
      const bg = document.querySelector('.hero__bg');
      const title = document.querySelector('.hero__title');
      if (!hero) return;

      const onScroll = () => {
        const y = window.scrollY;
        if (bg) bg.style.transform = `translateY(${y * 0.3}px) scale(1.1)`;
        if (title && this.hasGSAP()) {
          gsap.to(title, { y: y * 0.15, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  };

  global.Hero = Hero;
})(window);
