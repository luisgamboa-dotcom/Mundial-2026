/* =========================================================
   teams.js — Render de equipos + filtros + tilt + fav team
   ========================================================= */
(function (global) {
  'use strict';

  const FLAG_BASE = 'https://flagcdn.com/w160/';

  const Teams = {
    init() {
      this.render();
      this.bindFilters();
      this.bindFavFromModal();
      this.applyFavTint();
      this.bindScrollReveal();
      document.addEventListener('i18n:change', () => {
        const active = document.querySelector('#teamsFilter .chip.is-active')?.dataset.group || 'all';
        this.render(active);
      });
    },

    flagUrl(team) {
      return FLAG_BASE + team.iso + '.png';
    },

    byId(id) { return (global.TEAMS_DATA || []).find(t => t.id === id); },

    render(filter = 'all') {
      const grid = document.getElementById('teamsGrid');
      if (!grid) return;
      const teams = global.TEAMS_DATA || [];
      const html = teams
        .filter(t => filter === 'all' || t.group === filter)
        .map(t => this.cardHTML(t))
        .join('');
      grid.innerHTML = html || '<p style="grid-column:1/-1;text-align:center;padding:40px;color:var(--c-blue);opacity:.6">No hay equipos</p>';
      this.bindTilt();
      this.bindCardClicks();
      this.bindScrollReveal();
      // Re-bind chip filter
      this.bindFilters();
    },

    cardHTML(team) {
      const isFav = Storage.getFavTeam() === team.id;
      return `
        <article class="team-card reveal ${isFav ? 'is-fav' : ''}" data-team-id="${team.id}" tabindex="0" aria-label="${I18n.teamName(team)} - Grupo ${team.group}">
          <span class="team-card__group">${I18n.t('sections.teams.group')} ${team.group}</span>
          <img class="team-card__flag" src="${this.flagUrl(team)}" alt="" loading="lazy" width="64" height="48" />
          <h3 class="team-card__name">${I18n.teamName(team)}</h3>
          <p class="team-card__ranking">#${team.fifaRanking} FIFA</p>
          <div class="team-card__overlay" aria-hidden="true">
            <dl>
              <dt>${I18n.t('sections.teams.stats.titles')}</dt><dd>${team.titles}</dd>
              <dt>${I18n.t('sections.teams.stats.participations')}</dt><dd>${team.participations}</dd>
              <dt>${I18n.t('sections.teams.stats.ranking')}</dt><dd>#${team.fifaRanking}</dd>
              <dt>${I18n.t('sections.teams.stats.confederation')}</dt><dd>${team.confederation[I18n.current]}</dd>
              <dt>${I18n.t('sections.teams.stats.coach')}</dt><dd>${team.coach[I18n.current]}</dd>
              <dt>${I18n.t('sections.teams.stats.captain')}</dt><dd>${team.captain[I18n.current]}</dd>
            </dl>
            <button class="team-card__fav-btn" data-fav="${team.id}">${I18n.t('sections.teams.chooseFav')}</button>
          </div>
        </article>`;
    },

    bindFilters() {
      const bar = document.getElementById('teamsFilter');
      if (!bar) return;
      if (!bar.innerHTML.trim()) {
        const groups = ['all', ...Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i))];
        bar.innerHTML = groups.map(g => {
          const label = g === 'all' ? I18n.t('sections.teams.allGroups') : `${I18n.t('sections.teams.group')} ${g}`;
          return `<button type="button" class="chip ${g === 'all' ? 'is-active' : ''}" data-group="${g}">${label}</button>`;
        }).join('');
      }
      if (bar._bound) return;
      bar._bound = true;
      bar.addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        bar.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        this.render(chip.dataset.group);
      });
    },

    bindTilt() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (typeof window.gsap === 'undefined') return;
      document.querySelectorAll('.team-card').forEach(card => {
        const xTo = gsap.quickTo(card, 'rotationY', { duration: 0.4, ease: 'power2.out' });
        const yTo = gsap.quickTo(card, 'rotationX', { duration: 0.4, ease: 'power2.out' });
        const shine = card.querySelector('.team-card__overlay');
        card.addEventListener('mousemove', (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          xTo(px * 14);
          yTo(-py * 14);
          if (shine) {
            shine.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(44,67,115,0.96), rgba(26,39,69,0.98))`;
          }
        });
        card.addEventListener('mouseleave', () => {
          xTo(0); yTo(0);
        });
      });
    },

    bindFavFromModal() {
      // El modal se llena desde main.js; el binding se hace allí
    },

    bindCardClicks() {
      // Delegation
      const grid = document.getElementById('teamsGrid');
      if (!grid || grid._favBound) return;
      grid._favBound = true;
      grid.addEventListener('click', e => {
        const btn = e.target.closest('.team-card__fav-btn');
        if (btn) {
          e.stopPropagation();
          this.setFav(btn.dataset.fav);
        }
      });
    },

    setFav(id) {
      const team = this.byId(id);
      if (!team) return;
      Storage.setFavTeam(id);
      this.applyFavTint(team);
      this.render(document.querySelector('#teamsFilter .chip.is-active')?.dataset.group || 'all');
      // Re-filtrar partidos
      if (global.Matches) global.Matches.applyFilter();
      // Actualizar botón del hero
      this.updateHeroFav(team);
      global.Toast && global.Toast.show('⭐ ' + I18n.teamName(team));
    },

    updateHeroFav(team) {
      const btn = document.getElementById('heroChooseTeam');
      if (!btn) return;
      if (team) {
        btn.innerHTML = `<img class="fav-flag" src="${this.flagUrl(team)}" alt="" /> <span>${I18n.t('hero.chooseTeam')}: <strong>${I18n.teamName(team)}</strong></span>`;
        btn.classList.add('is-set');
      } else {
        btn.innerHTML = `<span>${I18n.t('hero.chooseTeam')}</span>`;
        btn.classList.remove('is-set');
      }
    },

    applyFavTint(team) {
      const t = team || this.byId(Storage.getFavTeam());
      if (t) {
        document.documentElement.style.setProperty('--fav-primary', t.colors.primary);
        document.documentElement.style.setProperty('--fav-secondary', t.colors.secondary);
        this.updateHeroFav(t);
      } else {
        document.documentElement.style.removeProperty('--fav-primary');
        document.documentElement.style.removeProperty('--fav-secondary');
        this.updateHeroFav(null);
      }
    },

    bindScrollReveal() {
      if (typeof window.gsap === 'undefined') {
        document.querySelectorAll('.team-card.reveal').forEach(el => {
          el.classList.remove('reveal');
          el.style.opacity = '1';
        });
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.team-card.reveal', { opacity: 1, y: 0, x: 0, scale: 1 });
        return;
      }
      gsap.utils.toArray('.team-card.reveal').forEach((el, i) => {
        gsap.to(el, {
          opacity: 1, y: 0, scale: 1, x: 0,
          duration: 0.5,
          delay: (i % 12) * 0.04,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%' }
        });
      });
    }
  };

  global.Teams = Teams;
})(window);
