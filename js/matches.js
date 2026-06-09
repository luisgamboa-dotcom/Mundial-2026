/* =========================================================
   matches.js — Render + filtros + .ics + zona horaria
   ========================================================= */
(function (global) {
  'use strict';

  const FLAG_BASE = 'https://flagcdn.com/w80/';

  const Matches = {
    state: { group: '', team: '', stage: '', tz: null },

    init() {
      this.bindToolbar();
      this.bindIcsDelegation();
      this.applyFilter();
      this.bindScrollReveal();
      document.addEventListener('i18n:change', () => this.applyFilter());
    },

    bindIcsDelegation() {
      const list = document.getElementById('matchesList');
      if (!list) return;
      list.addEventListener('click', e => {
        const btn = e.target.closest('[data-ics]');
        if (!btn) return;
        const id = parseInt(btn.dataset.ics, 10);
        const match = (global.MATCHES_DATA || []).find(m => m.id === id);
        if (match) this.downloadIcs(match);
      });
    },

    flagUrl(team) { return FLAG_BASE + team.iso + '.png'; },
    byId(id) { return (global.TEAMS_DATA || []).find(t => t.id === id); },
    venueById(id) { return (global.VENUES_DATA || []).find(v => v.id === id); },

    bindToolbar() {
      const tb = document.getElementById('matchesToolbar');
      if (!tb) return;
      const teams = global.TEAMS_DATA || [];

      const groups = ['', ...Array.from({ length: 12 }, (_, i) => String.fromCharCode(65 + i))];
      const opts = (arr, allLabel) => arr.map(g => `<option value="${g}">${g ? I18n.t('sections.teams.group') + ' ' + g : allLabel}</option>`).join('');

      tb.innerHTML = `
        <label>
          <span>${I18n.t('sections.matches.filterGroup')}</span>
          <select id="filterGroup">
            ${opts(groups, I18n.t('sections.matches.all'))}
          </select>
        </label>
        <label>
          <span>${I18n.t('sections.matches.filterTeam')}</span>
          <select id="filterTeam">
            <option value="">${I18n.t('sections.matches.all')}</option>
            ${teams.map(t => `<option value="${t.id}">${I18n.teamName(t)}</option>`).join('')}
          </select>
        </label>
        <label>
          <span>${I18n.t('sections.matches.tzLabel')}</span>
          <select id="filterTz"></select>
        </label>
      `;

      this.populateTimezones();

      const fav = Storage.getFavTeam();
      if (fav) {
        document.getElementById('filterTeam').value = fav;
        this.state.team = fav;
      }

      tb.addEventListener('change', () => {
        this.state.group = document.getElementById('filterGroup').value;
        this.state.team = document.getElementById('filterTeam').value;
        this.state.tz = document.getElementById('filterTz').value || null;
        if (this.state.tz) Storage.setTz(this.state.tz); else Storage.remove('mundial2026:tz');
        this.applyFilter();
      });
    },

    populateTimezones() {
      const sel = document.getElementById('filterTz');
      if (!sel) return;
      const supported = ['UTC', 'America/Mexico_City', 'America/New_York', 'America/Los_Angeles', 'America/Toronto', 'America/Bogota', 'America/Buenos_Aires', 'Europe/Madrid', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'];
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected && !supported.includes(detected)) supported.unshift(detected);

      const saved = Storage.getTz();
      const guess = saved || detected || 'America/Mexico_City';
      this.state.tz = saved || null;

      sel.innerHTML = `<option value="">${I18n.t('sections.matches.auto')} (${detected || 'UTC'})</option>` +
        supported.map(z => `<option value="${z}" ${z === guess && !saved ? 'selected' : ''}>${z}</option>`).join('');
      if (saved) sel.value = saved;
    },

    applyFilter() {
      const list = document.getElementById('matchesList');
      if (!list) return;
      const fav = Storage.getFavTeam();
      const teamFilter = this.state.team || fav;
      const allMatches = global.MATCHES_DATA || [];

      const filtered = allMatches.filter(m => {
        if (this.state.group && m.group !== this.state.group) return false;
        if (teamFilter && m.team1 !== teamFilter && m.team2 !== teamFilter) return false;
        return true;
      });

      if (filtered.length === 0) {
        list.innerHTML = `<p style="text-align:center;padding:60px;color:var(--c-blue);opacity:.6">${I18n.t('sections.matches.noMatches')}</p>`;
        return;
      }

      list.innerHTML = filtered.map(m => this.cardHTML(m)).join('');
      this.bindScrollReveal();
    },

    cardHTML(m) {
      const t1 = this.byId(m.team1);
      const t2 = this.byId(m.team2);
      const venue = this.venueById(m.venue);
      const date = m.date ? this.formatDate(m.date) : 'TBD';
      const time = m.time ? this.formatTime(m.date, m.time) : 'TBD';

      const t1Name = t1 ? I18n.teamName(t1) : (m.stage[I18n.current] === 'Final' ? '?' : 'TBD');
      const t2Name = t2 ? I18n.teamName(t2) : (m.stage[I18n.current] === 'Final' ? '?' : 'TBD');

      return `
        <article class="match-card reveal">
          <div class="match-card__date">
            <div class="match-card__date-day">${m.date ? date.day : '?'}</div>
            <div class="match-card__date-month">${m.date ? date.month : ''}</div>
          </div>
          <div class="match-card__teams">
            <div class="match-team">
              ${t1 ? `<img class="match-team__flag" src="${this.flagUrl(t1)}" alt="" loading="lazy" width="36" height="27" />` : '<div class="match-team__flag"></div>'}
              <span class="match-team__name">${t1Name}</span>
            </div>
            <span class="match-team__vs">${I18n.t('sections.matches.vs')}</span>
            <div class="match-team">
              ${t2 ? `<img class="match-team__flag" src="${this.flagUrl(t2)}" alt="" loading="lazy" width="36" height="27" />` : '<div class="match-team__flag"></div>'}
              <span class="match-team__name">${t2Name}</span>
            </div>
          </div>
          <div class="match-card__info">
            <time datetime="${m.date || ''}T${m.time || ''}">${time}</time>
            <span class="match-card__stage">${m.stage[I18n.current]}</span>
          </div>
          <div class="match-card__actions">
            <button class="btn btn--ghost btn--small" data-ics="${m.id}" title="${I18n.t('sections.matches.addToCalendar')}">📅</button>
          </div>
        </article>`;
    },

    formatDate(iso) {
      const [y, mo, d] = iso.split('-').map(Number);
      const monthsEs = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
      const monthsEn = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      const m = I18n.current === 'en' ? monthsEn : monthsEs;
      return { day: String(d).padStart(2, '0'), month: m[mo - 1] };
    },

    formatTime(date, time) {
      if (!date || !time) return 'TBD';
      // Construir Date asumiendo hora local de la sede (UTC-5, hora de México City estable)
      const [y, mo, d] = date.split('-').map(Number);
      const [h, mi] = time.split(':').map(Number);
      const utcDate = new Date(Date.UTC(y, mo - 1, d, h + 5, mi)); // -05:00 → +5h para UTC

      const tz = this.state.tz || undefined; // undefined = usar zona del navegador
      try {
        return new Intl.DateTimeFormat(I18n.current === 'en' ? 'en-US' : 'es-ES', {
          hour: '2-digit', minute: '2-digit', timeZone: tz, hour12: false
        }).format(utcDate);
      } catch (e) {
        return time;
      }
    },

    bindCardActions() { /* deprecated: use bindIcsDelegation */ },

    downloadIcs(m) {
      const t1 = this.byId(m.team1);
      const t2 = this.byId(m.team2);
      const venue = this.venueById(m.venue);
      const [y, mo, d] = m.date.split('-').map(Number);
      const [h, mi] = m.time.split(':').map(Number);
      const startLocal = `${m.date.replace(/-/g, '')}T${m.time.replace(':', '')}00`;
      const endH = h + 2, endMi = mi;
      const endDate = new Date(y, mo - 1, d, endH, endMi);
      const pad = n => String(n).padStart(2, '0');
      const endLocal = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

      const summary = `${t1 ? I18n.teamName(t1) : 'TBD'} vs ${t2 ? I18n.teamName(t2) : 'TBD'} - Mundial 2026`;
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Mundial 2026//Web//ES',
        'BEGIN:VEVENT',
        `UID:mundial2026-${m.id}@mundial2026.app`,
        `DTSTAMP:${startLocal}Z`,
        `DTSTART;TZID=America/Mexico_City:${startLocal}`,
        `DTEND;TZID=America/Mexico_City:${endLocal}`,
        `SUMMARY:${summary}`,
        `LOCATION:${venue ? venue.name + ', ' + venue.city[I18n.current] : 'TBD'}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `mundial2026-${m.id}.ics`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      global.Toast && global.Toast.show('📅 ' + I18n.t('sections.bracket.downloadIcs'));
    },

    bindScrollReveal() {
      if (typeof window.gsap === 'undefined' || !window.gsap.utils) {
        document.querySelectorAll('.match-card.reveal').forEach(el => {
          el.classList.remove('reveal');
          el.style.opacity = '1';
        });
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.match-card.reveal', { opacity: 1, y: 0 });
        return;
      }
      gsap.utils.toArray('.match-card.reveal').forEach(el => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.5,
          scrollTrigger: { trigger: el, start: 'top 92%' }
        });
      });
    }
  };

  global.Matches = Matches;
})(window);
