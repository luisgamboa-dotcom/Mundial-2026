/* =========================================================
   quiz.js — Trivia "¿Cuánto sabes del Mundial?"
   ========================================================= */
(function (global) {
  'use strict';

  const Quiz = {
    questions: [
      {
        q: { es: '¿En qué año se celebró el primer Mundial de la FIFA?', en: 'In what year was the first FIFA World Cup held?' },
        options: [
          { es: '1928', en: '1928' },
          { es: '1930', en: '1930' },
          { es: '1934', en: '1934' },
          { es: '1938', en: '1938' }
        ],
        correct: 1
      },
      {
        q: { es: '¿Cuántas selecciones participarán en el Mundial 2026?', en: 'How many nations will play in the 2026 World Cup?' },
        options: [
          { es: '32', en: '32' },
          { es: '40', en: '40' },
          { es: '48', en: '48' },
          { es: '64', en: '64' }
        ],
        correct: 2
      },
      {
        q: { es: '¿Quién ganó el Mundial 2022 en Qatar?', en: 'Who won the 2022 World Cup in Qatar?' },
        options: [
          { es: 'Francia', en: 'France' },
          { es: 'Brasil', en: 'Brazil' },
          { es: 'Argentina', en: 'Argentina' },
          { es: 'Croacia', en: 'Croatia' }
        ],
        correct: 2
      },
      {
        q: { es: '¿Cuántos países son sede del Mundial 2026?', en: 'How many countries will host the 2026 World Cup?' },
        options: [
          { es: '1', en: '1' },
          { es: '2', en: '2' },
          { es: '3', en: '3' },
          { es: '4', en: '4' }
        ],
        correct: 2
      },
      {
        q: { es: '¿En qué país se jugará la final del Mundial 2026?', en: 'In which country will the 2026 World Cup Final be held?' },
        options: [
          { es: 'México', en: 'Mexico' },
          { es: 'Canadá', en: 'Canada' },
          { es: 'Estados Unidos', en: 'United States' },
          { es: 'Brasil', en: 'Brazil' }
        ],
        correct: 2
      },
      {
        q: { es: '¿Cuántos partidos se jugarán en total en el Mundial 2026?', en: 'How many total matches will be played in the 2026 World Cup?' },
        options: [
          { es: '64', en: '64' },
          { es: '80', en: '80' },
          { es: '104', en: '104' },
          { es: '128', en: '128' }
        ],
        correct: 2
      },
      {
        q: { es: '¿Qué selección ha ganado más Mundiales en la historia?', en: 'Which nation has won the most World Cups in history?' },
        options: [
          { es: 'Alemania', en: 'Germany' },
          { es: 'Argentina', en: 'Argentina' },
          { es: 'Italia', en: 'Italy' },
          { es: 'Brasil', en: 'Brazil' }
        ],
        correct: 3
      }
    ],

    state: { idx: 0, score: 0, answers: [] },

    init() {
      this.renderIntro();
    },

    renderIntro() {
      const c = document.getElementById('quizContainer');
      if (!c) return;
      c.innerHTML = `
        <div class="quiz-card quiz-intro">
          <div class="quiz-intro__icon">⚽</div>
          <h3>${I18n.t('sections.quiz.title')}</h3>
          <p style="margin-top:8px;opacity:.7">${I18n.t('sections.quiz.subtitle')}</p>
          <button class="btn btn--primary" id="quizStart" style="margin-top:24px">${I18n.t('sections.quiz.start')}</button>
        </div>`;
      document.getElementById('quizStart').addEventListener('click', () => this.start());
    },

    start() {
      this.state = { idx: 0, score: 0, answers: [] };
      this.renderQuestion();
    },

    renderQuestion() {
      const c = document.getElementById('quizContainer');
      const total = this.questions.length;
      const i = this.state.idx;
      if (i >= total) return this.renderResult();

      const q = this.questions[i];
      const letters = ['A', 'B', 'C', 'D'];
      const progressPct = ((i + 1) / total) * 100;

      c.innerHTML = `
        <div class="quiz-card">
          <div class="quiz-progress">
            <div class="quiz-progress__bar"><div class="quiz-progress__fill" style="width:${progressPct}%"></div></div>
            <div class="quiz-progress__label">${I18n.t('sections.quiz.question')} ${i + 1} ${I18n.t('sections.quiz.of')} ${total}</div>
          </div>
          <h3 class="quiz-question">${q.q[I18n.current]}</h3>
          <div class="quiz-options">
            ${q.options.map((opt, idx) => `
              <button class="quiz-option" data-idx="${idx}">
                <span class="quiz-option__letter">${letters[idx]}</span>
                <span>${opt[I18n.current]}</span>
              </button>`).join('')}
          </div>
        </div>`;

      c.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => this.answer(parseInt(btn.dataset.idx, 10)));
      });
    },

    answer(idx) {
      const q = this.questions[this.state.idx];
      const correct = idx === q.correct;
      if (correct) this.state.score++;
      this.state.answers.push({ q: this.state.idx, picked: idx, correct });

      // Marcar visualmente
      const opts = document.querySelectorAll('.quiz-option');
      opts.forEach((o, i) => {
        o.disabled = true;
        if (i === q.correct) o.classList.add('is-correct');
        if (i === idx && !correct) o.classList.add('is-wrong');
      });

      setTimeout(() => {
        this.state.idx++;
        this.renderQuestion();
      }, 1100);
    },

    renderResult() {
      const c = document.getElementById('quizContainer');
      const total = this.questions.length;
      const score = this.state.score;
      Storage.setQuizScore(score);
      Storage.setQuizAnswers(this.state.answers);

      const msgKey = score === total ? 'perfect' : score >= total - 1 ? 'great' : score >= total / 2 ? 'good' : score >= 2 ? 'ok' : 'bad';
      const msg = I18n.t('sections.quiz.result.' + msgKey);

      c.innerHTML = `
        <div class="quiz-card">
          <div class="quiz-result">
            <div style="font-size:0.9rem;letter-spacing:0.2em;text-transform:uppercase;opacity:.7">${I18n.t('sections.quiz.score')}</div>
            <div class="quiz-result__score">${score}/${total}</div>
            <div class="quiz-result__msg">${msg}</div>
            <div class="quiz-actions">
              <button class="btn btn--primary" id="quizRestart">${I18n.t('sections.quiz.restart')}</button>
              <button class="btn btn--ghost" id="quizShare">${I18n.t('sections.quiz.share')}</button>
            </div>
          </div>
        </div>`;

      document.getElementById('quizRestart').addEventListener('click', () => this.start());
      document.getElementById('quizShare').addEventListener('click', () => this.share(score, total));
    },

    share(score, total) {
      // Generar share-card con Canvas nativo
      const canvas = document.createElement('canvas');
      canvas.width = 800; canvas.height = 500;
      const ctx = canvas.getContext('2d');

      // Fondo
      const grad = ctx.createLinearGradient(0, 0, 800, 500);
      grad.addColorStop(0, '#2C4373');
      grad.addColorStop(1, '#F24B59');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 500);

      // Texto
      ctx.fillStyle = '#F2F2F2';
      ctx.textAlign = 'center';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('MUNDIAL 2026', 400, 80);
      ctx.font = '20px sans-serif';
      ctx.fillText(I18n.t('sections.quiz.title'), 400, 110);

      ctx.font = 'bold 120px sans-serif';
      ctx.fillText(`${score}/${total}`, 400, 270);

      ctx.font = '22px sans-serif';
      ctx.fillText(I18n.t('sections.quiz.score'), 400, 320);

      ctx.font = '16px sans-serif';
      ctx.fillText('mundial-2026.app', 400, 460);

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `mundial2026-quiz-${score}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    }
  };

  global.Quiz = Quiz;
})(window);
