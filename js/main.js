/* =========================================================
   main.js — Orquestador + modal "elige tu selección" + venues
   ========================================================= */
(function (global) {
  'use strict';

  const App = {
    init() {
      this.bindSkipLink();
      this.bindNavToggle();
      this.bindNavScrollSpy();
      this.bindHeaderScroll();
      this.bindSmoothScroll();
      I18n.init();
      Countdown.init();
      Hero.init();
      Teams.init();
      Matches.init();
      this.renderVenues();
      this.bindFavModal();
      this.bindReset();
      this.bindHeroCTA();
      this.bindScrollReveals();
      // Map e interacciones pesadas se cargan con un pequeño delay
      setTimeout(() => this.lazyInit(), 100);
    },

    lazyInit() {
      try { Map.init(); } catch (e) { console.warn('Map init failed', e); }
      try { Bracket.init(); } catch (e) { console.warn('Bracket init failed', e); }
      try { Quiz.init(); } catch (e) { console.warn('Quiz init failed', e); }
      this.bindShareBracket();
      // Re-render venues al cambiar idioma
      document.addEventListener('i18n:change', () => this.renderVenues());
    },

    bindSkipLink() {
      // noop (link nativo)
    },

    bindNavToggle() {
      const btn = document.getElementById('navToggle');
      const menu = document.getElementById('navMenu');
      if (!btn || !menu) return;
      btn.addEventListener('click', () => {
        const open = menu.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
        btn.setAttribute('aria-label', open ? I18n.t('a11y.closeMenu') : I18n.t('a11y.openMenu'));
      });
      // Cerrar al hacer click en un link
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }));
    },

    bindNavScrollSpy() {
      const links = document.querySelectorAll('.navbar__menu a[href^="#"]');
      const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
      if (sections.length === 0) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = '#' + entry.target.id;
            links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === id));
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach(s => obs.observe(s));
    },

    bindHeaderScroll() {
      const header = document.querySelector('.site-header');
      if (!header) return;
      let last = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        header.classList.toggle('is-scrolled', y > 40);
        last = y;
      }, { passive: true });
    },

    bindSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          const href = a.getAttribute('href');
          if (href.length <= 1) return;
          e.preventDefault();
          // Caso especial: #home (logo y "Inicio") → ir al top de la página
          if (href === '#home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            history.replaceState(null, '', '#home');
            return;
          }
          const t = document.querySelector(href);
          if (!t) return;
          const top = t.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top, behavior: 'smooth' });
          history.replaceState(null, '', href);
        });
      });
    },

    renderVenues() {
      const grid = document.getElementById('venuesGrid');
      if (!grid) return;
      const venues = global.VENUES_DATA || [];
      grid.innerHTML = venues.map(v => `
        <article class="venue-card hover-lift" data-venue="${v.id}">
          <div class="venue-card__photo">${v.name}</div>
          <div class="venue-card__body">
            <h3 class="venue-card__name">${v.name}</h3>
            <p class="venue-card__city">${v.city[I18n.current]}, ${v.country[I18n.current]}</p>
            <div class="venue-card__meta">
              <span>👥 ${(v.capacity / 1000).toFixed(0)}k</span>
              <span>⚽ ${v.matches} ${I18n.t('sections.venues.matches')}</span>
            </div>
            <p style="font-size:.85rem;color:var(--c-blue);opacity:.7;line-height:1.5">${v.description[I18n.current]}</p>
          </div>
        </article>`).join('');

      if (typeof gsap !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.utils.toArray('.venue-card').forEach((el, i) => {
          gsap.from(el, {
            opacity: 0, y: 30, duration: 0.5, delay: (i % 6) * 0.05,
            scrollTrigger: { trigger: el, start: 'top 92%' }
          });
        });
      }
    },

    bindFavModal() {
      const trigger = document.getElementById('heroChooseTeam');
      const modal = document.getElementById('favModal');
      if (!trigger || !modal) return;

      trigger.addEventListener('click', () => this.openFavModal());

      modal.querySelector('.modal__close')?.addEventListener('click', () => this.closeFavModal());
      modal.querySelector('[data-modal-cancel]')?.addEventListener('click', () => this.closeFavModal());
      modal.querySelector('[data-modal-confirm]')?.addEventListener('click', () => {
        const sel = modal.querySelector('.modal__team.is-selected');
        if (sel) {
          Teams.setFav(sel.dataset.team);
          this.closeFavModal();
        } else {
          global.Toast && global.Toast.show('⚠ Selecciona un equipo');
        }
      });
      modal.addEventListener('click', e => { if (e.target === modal) this.closeFavModal(); });

      // Render lista
      const list = modal.querySelector('.modal__teams');
      const teams = global.TEAMS_DATA || [];
      list.innerHTML = teams.map(t => `
        <div class="modal__team" data-team="${t.id}">
          <img class="modal__team-flag" src="https://flagcdn.com/w40/${t.iso}.png" alt="" loading="lazy" />
          <span class="modal__team-name">${I18n.teamName(t)}</span>
        </div>`).join('');

      list.addEventListener('click', e => {
        const item = e.target.closest('.modal__team');
        if (!item) return;
        list.querySelectorAll('.modal__team').forEach(x => x.classList.remove('is-selected'));
        item.classList.add('is-selected');
      });

      // Re-render al cambiar idioma
      document.addEventListener('i18n:change', () => {
        list.querySelectorAll('.modal__team-name').forEach((el, i) => {
          el.textContent = I18n.teamName(teams[i]);
        });
      });
    },

    openFavModal() {
      const modal = document.getElementById('favModal');
      if (!modal) return;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    },

    closeFavModal() {
      const modal = document.getElementById('favModal');
      if (!modal) return;
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    },

    bindReset() {
      const btn = document.getElementById('footerReset');
      if (!btn) return;
      btn.addEventListener('click', () => {
        if (!confirm(I18n.t('footer.resetConfirm'))) return;
        Storage.resetAll();
        I18n.current = 'es';
        I18n.setLang('es');
        Teams.applyFavTint(null);
        Teams.render('all');
        Matches.applyFilter();
        Bracket.state = Bracket.defaultState();
        Bracket.render();
        Quiz.renderIntro();
        document.documentElement.lang = 'es';
        global.Toast && global.Toast.show('✓ ' + I18n.t('footer.resetDone'), 'success');
      });
    },

    bindHeroCTA() {
      const primary = document.querySelector('[data-hero-cta="primary"]');
      const secondary = document.querySelector('[data-hero-cta="secondary"]');
      if (primary) primary.addEventListener('click', () => document.getElementById('matches')?.scrollIntoView({ behavior: 'smooth' }));
      if (secondary) secondary.addEventListener('click', () => document.getElementById('bracket')?.scrollIntoView({ behavior: 'smooth' }));
    },

    bindShareBracket() {
      const btn = document.getElementById('bracketShare');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const champ = Bracket.state.final;
        const champTeam = champ ? (global.TEAMS_DATA || []).find(t => t.id === champ) : null;
        if (!champTeam) {
          global.Toast && global.Toast.show('⚠ Completa la predicción primero');
          return;
        }
        this.generateShareCard(champTeam);
      });
    },

    generateShareCard(team) {
      const canvas = document.createElement('canvas');
      canvas.width = 800; canvas.height = 600;
      const ctx = canvas.getContext('2d');

      // Fondo
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, '#2C4373');
      grad.addColorStop(0.6, '#1a2745');
      grad.addColorStop(1, '#F24B59');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      // Marco
      ctx.strokeStyle = 'rgba(242,242,242,0.15)';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, 760, 560);

      // Texto
      ctx.fillStyle = '#F2F2F2';
      ctx.textAlign = 'center';
      ctx.font = 'bold 32px Bebas Neue, sans-serif';
      ctx.fillText('MUNDIAL 2026', 400, 100);
      ctx.font = '18px sans-serif';
      ctx.fillStyle = 'rgba(242,242,242,0.7)';
      ctx.fillText('MI PREDICCIÓN', 400, 130);

      // Campeón
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = 'rgba(242,242,242,0.8)';
      ctx.fillText('🏆 CAMPEÓN 🏆', 400, 210);

      // Bandera (placeholder con colores)
      const colors = team.colors || { primary: '#F24B59', secondary: '#F2F2F2' };
      ctx.fillStyle = colors.primary;
      ctx.fillRect(330, 240, 140, 100);
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(330, 270, 140, 40);
      ctx.strokeStyle = '#F2F2F2';
      ctx.lineWidth = 2;
      ctx.strokeRect(330, 240, 140, 100);

      // Nombre
      ctx.font = 'bold 60px Bebas Neue, sans-serif';
      ctx.fillStyle = '#F2F2F2';
      ctx.fillText(I18n.teamName(team).toUpperCase(), 400, 410);

      // Footer
      ctx.font = '14px sans-serif';
      ctx.fillStyle = 'rgba(242,242,242,0.6)';
      ctx.fillText('mundial-2026.app · ROAD TO 2026', 400, 540);

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `mundial2026-prediccion-${team.id}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    },

    bindScrollReveals() {
      if (typeof gsap === 'undefined' || !window.gsap.utils) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.utils.toArray('.section__header, .quiz-card, .bracket-champion').forEach(el => {
        gsap.from(el, {
          opacity: 0, y: 30, duration: 0.7,
          scrollTrigger: { trigger: el, start: 'top 88%' }
        });
      });
    }
  };

  // Toast helper
  const Toast = {
    el: null,
    show(msg, type = '') {
      if (!this.el) {
        this.el = document.createElement('div');
        this.el.className = 'toast';
        document.body.appendChild(this.el);
      }
      this.el.textContent = msg;
      this.el.className = 'toast is-visible' + (type ? ' toast--' + type : '');
      clearTimeout(this._t);
      this._t = setTimeout(() => {
        this.el.classList.remove('is-visible');
      }, 2800);
    }
  };
  global.Toast = Toast;

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})(window);
