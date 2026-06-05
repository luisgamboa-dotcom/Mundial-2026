/* =========================================================
   bracket.js — Predictor del cuadro (12 grupos → final)
   ========================================================= */
(function (global) {
  'use strict';

  const FLAG_BASE = 'https://flagcdn.com/w40/';

  const Bracket = {
    state: null,
    phase: 'groups',
    round32Idx: 0,
    round16Idx: 0,
    qfIdx: 0,
    sfIdx: 0,

    init() {
      this.state = Storage.getBracket() || this.defaultState();
      this.bindPhases();
      this.bindGroupDelegation();
      this.bindRoundDelegation();
      this.render();
      document.addEventListener('i18n:change', () => this.render());
    },

    bindGroupDelegation() {
      const container = document.getElementById('bracketGroups');
      if (!container) return;
      container.addEventListener('click', e => this.handleGroupClick(e));
    },

    bindRoundDelegation() {
      ['bracketRound32', 'bracketRound16', 'bracketQF', 'bracketSF', 'bracketFinalRound'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', e => {
          const phase = id.replace('bracket', '').replace('Round', '').toLowerCase();
          if (phase === 'finalround') return this.delegateRoundClick(e, 'final');
          this.delegateRoundClick(e, phase);
        });
      });
    },

    delegateRoundClick(e, phase) {
      const teamEl = e.target.closest('.bracket-matchup__team');
      if (!teamEl || teamEl.classList.contains('is-empty')) return;
      const idx = parseInt(teamEl.dataset.idx, 10);
      const teamId = teamEl.dataset.team;
      const matchups = this.getMatchupsForPhase(phase);
      if (phase === 'final') {
        this.state.final = teamId;
      } else {
        const key = phase;
        const arr = this.state[key].slice();
        const order = ['round32', 'round16', 'qf', 'sf', 'final'];
        const i = order.indexOf(phase);
        for (let j = i + 1; j < order.length; j++) {
          if (order[j] === 'final') this.state.final = null;
          else this.state[order[j]] = [];
        }
        arr[idx] = teamId;
        this.state[key] = arr;
      }
      this.render();
    },

    getMatchupsForPhase(phase) {
      if (phase === 'round32') return this.buildRound32Matchups();
      const map = { round16: this.state.round32, qf: this.state.round16, sf: this.state.qf, final: this.state.sf };
      return this.buildMatchups(map[phase] || [], 2);
    },

    defaultState() {
      return {
        groups: {},       // { 'A': ['mexico', 'suecia'] }
        round32: [],      // 16 ganadores
        round16: [],      // 8 ganadores
        qf: [],           // 4 ganadores
        sf: [],           // 2 ganadores
        final: null       // campeón
      };
    },

    bindPhases() {
      const bar = document.getElementById('bracketPhases');
      if (!bar) return;
      bar.addEventListener('click', e => {
        const btn = e.target.closest('.bracket-phase-btn');
        if (!btn || btn.disabled) return;
        this.phase = btn.dataset.phase;
        this.updatePhaseBar();
        this.renderStage();
      });
      document.getElementById('bracketSave')?.addEventListener('click', () => this.save());
      document.getElementById('bracketReset')?.addEventListener('click', () => this.reset());
    },

    save() {
      Storage.setBracket(this.state);
      global.Toast && global.Toast.show('✓ ' + I18n.t('sections.bracket.saved'), 'success');
    },

    reset() {
      if (!confirm('¿Reiniciar la predicción?')) return;
      this.state = this.defaultState();
      this.round32Idx = this.round16Idx = this.qfIdx = this.sfIdx = 0;
      Storage.setBracket(this.state);
      this.render();
    },

    updatePhaseBar() {
      const bar = document.getElementById('bracketPhases');
      if (!bar) return;
      bar.querySelectorAll('.bracket-phase-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.phase === this.phase);
      });
      const stage = document.getElementById('bracketStage');
      if (stage) {
        stage.querySelectorAll('.bracket-stage').forEach(s => {
          s.classList.toggle('is-active', s.dataset.stage === this.phase);
        });
      }
      this.updatePhaseAvailability();
    },

    updatePhaseAvailability() {
      const groupsDone = this.groupsComplete();
      const r32Done = this.state.round32.length === 16;
      const r16Done = this.state.round16.length === 8;
      const qfDone = this.state.qf.length === 4;
      const sfDone = this.state.sf.length === 2;
      const map = { groups: true, round32: groupsDone, round16: r32Done, qf: r16Done, sf: qfDone, final: sfDone };
      document.querySelectorAll('.bracket-phase-btn').forEach(btn => {
        btn.disabled = !map[btn.dataset.phase];
      });
    },

    groupsComplete() {
      const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
      return groups.every(g => (this.state.groups[g] || []).length === 2);
    },

    render() {
      this.renderGroups();
      this.renderRoundOf32();
      this.renderRoundOf16();
      this.renderQF();
      this.renderSF();
      this.renderFinal();
      this.updatePhaseBar();
    },

    renderStage() {
      this.updatePhaseBar();
    },

    renderGroups() {
      const container = document.getElementById('bracketGroups');
      if (!container) return;
      const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];
      container.innerHTML = groups.map(g => {
        const teams = (global.TEAMS_DATA || []).filter(t => t.group === g);
        const picked = this.state.groups[g] || [];
        return `
          <div class="bracket-group" data-group="${g}">
            <h4 class="bracket-group__title">${I18n.t('sections.teams.group')} ${g} <span class="bracket-group__count">${picked.length}/2</span></h4>
            ${teams.map(t => {
              const isPicked = picked.includes(t.id);
              const isOut = picked.length >= 2 && !isPicked;
              return `
                <div class="bracket-group__team ${isPicked ? 'is-picked' : ''} ${isOut ? 'is-out' : ''}" data-team="${t.id}">
                  <img class="bracket-group__team-flag" src="${FLAG_BASE + t.iso + '.png'}" alt="" loading="lazy" />
                  <span class="bracket-group__team-name">${I18n.teamName(t)}</span>
                  <span class="bracket-group__check">✓</span>
                </div>`;
            }).join('')}
          </div>`;
      }).join('');
    },

    handleGroupClick(e) {
      const teamEl = e.target.closest('.bracket-group__team');
      if (!teamEl) return;
      const group = teamEl.closest('.bracket-group').dataset.group;
      const teamId = teamEl.dataset.team;
      const picked = this.state.groups[group] || [];
      if (picked.includes(teamId)) {
        this.state.groups[group] = picked.filter(id => id !== teamId);
      } else if (picked.length < 2) {
        this.state.groups[group] = [...picked, teamId];
      }
      this.state.round32 = [];
      this.state.round16 = [];
      this.state.qf = [];
      this.state.sf = [];
      this.state.final = null;
      this.render();
    },

    // Construir matchups hipotéticos a partir de los clasificados
    buildRound32Matchups() {
      const order = ['A','B','C','D','E','F','G','H','I','J','K','L'];
      // 16 cruces: top2 de A vs top2 de B... para simplificar: 1A vs 2B, 1C vs 2D, etc.
      // Mejor: 1A vs 3C/D/E mejor tercero... simplificamos a top 2 de cada grupo enfrentados en pares
      const m = [];
      for (let i = 0; i < 8; i++) {
        const g1 = order[i * 2];
        const g2 = order[i * 2 + 1];
        const t1 = (this.state.groups[g1] || [])[0];
        const t2 = (this.state.groups[g1] || [])[1];
        const t3 = (this.state.groups[g2] || [])[0];
        const t4 = (this.state.groups[g2] || [])[1];
        m.push([t1, t3], [t2, t4]);
      }
      return m;
    },

    buildMatchups(teams, pairsOf2) {
      // Empareja en grupos de 2
      const m = [];
      for (let i = 0; i < teams.length; i += 2) {
        m.push([teams[i], teams[i + 1] || null]);
      }
      return m;
    },

    renderRoundOf32() {
      const container = document.getElementById('bracketRound32');
      if (!container) return;
      const matchups = this.buildRound32Matchups();
      container.innerHTML = `
        <h3 class="bracket-round__title">${I18n.t('sections.bracket.round32')}</h3>
        ${matchups.map((m, i) => this.matchupHTML(m, i, 'round32')).join('')}`;
    },

    renderRoundOf16() {
      const container = document.getElementById('bracketRound16');
      if (!container) return;
      const matchups = this.buildMatchups(this.state.round32, 2);
      container.innerHTML = `
        <h3 class="bracket-round__title">${I18n.t('sections.bracket.round16')}</h3>
        ${matchups.map((m, i) => this.matchupHTML(m, i, 'round16')).join('')}`;
    },

    renderQF() {
      const container = document.getElementById('bracketQF');
      if (!container) return;
      const matchups = this.buildMatchups(this.state.round16, 2);
      container.innerHTML = `
        <h3 class="bracket-round__title">${I18n.t('sections.bracket.qf')}</h3>
        ${matchups.map((m, i) => this.matchupHTML(m, i, 'qf')).join('')}`;
    },

    renderSF() {
      const container = document.getElementById('bracketSF');
      if (!container) return;
      const matchups = this.buildMatchups(this.state.qf, 2);
      container.innerHTML = `
        <h3 class="bracket-round__title">${I18n.t('sections.bracket.sf')}</h3>
        ${matchups.map((m, i) => this.matchupHTML(m, i, 'sf')).join('')}`;
    },

    renderFinal() {
      const container = document.getElementById('bracketFinalRound');
      if (!container) return;
      const matchups = this.buildMatchups(this.state.sf, 2);
      container.innerHTML = `
        <h3 class="bracket-round__title">${I18n.t('sections.bracket.final')}</h3>
        ${matchups.map((m, i) => this.matchupHTML(m, i, 'final')).join('')}`;
      // Mostrar campeón
      const champEl = document.getElementById('bracketChampion');
      const champTeam = this.state.final ? (global.TEAMS_DATA || []).find(t => t.id === this.state.final) : null;
      if (champEl && champTeam) {
        champEl.classList.add('is-active');
        document.getElementById('championFlag').src = FLAG_BASE + champTeam.iso + '.png';
        document.getElementById('championName').textContent = I18n.teamName(champTeam);
      }
    },

    matchupHTML(matchup, idx, phase) {
      const [t1Id, t2Id] = matchup;
      const t1 = t1Id ? (global.TEAMS_DATA || []).find(t => t.id === t1Id) : null;
      const t2 = t2Id ? (global.TEAMS_DATA || []).find(t => t.id === t2Id) : null;
      const resultKey = phase === 'final' ? 'final' : phase;
      const picked = phase === 'final' ? this.state.final : this.state[resultKey][idx];

      return `
        <div class="bracket-matchup" data-idx="${idx}">
          ${this.teamChipHTML(t1, picked, phase, idx, 0)}
          ${this.teamChipHTML(t2, picked, phase, idx, 1)}
        </div>`;
    },

    teamChipHTML(team, picked, phase, idx, slot) {
      if (!team) return `<div class="bracket-matchup__team is-empty">TBD</div>`;
      const isPicked = picked === team.id;
      return `
        <div class="bracket-matchup__team ${isPicked ? 'is-picked' : ''}" data-team="${team.id}" data-idx="${idx}" data-slot="${slot}">
          <img class="bracket-matchup__team-flag" src="${FLAG_BASE + team.iso + '.png'}" alt="" loading="lazy" />
          <span>${I18n.teamName(team)}</span>
        </div>`;
    },

    handleMatchupClick(e, phase, matchups) {
      // Deprecated: usar delegateRoundClick. Se mantiene por compatibilidad.
    }
  };

  global.Bracket = Bracket;
})(window);
