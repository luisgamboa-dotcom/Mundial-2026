/* =========================================================
   countdown.js — Cuenta regresiva al partido inaugural
   ========================================================= */
(function (global) {
  'use strict';

  const Countdown = {
    target: null,
    timer: null,

    init() {
      // 11 de junio de 2026, 20:00 hora local de México (UTC-5 sin DST, -05:00 estable)
      this.target = new Date('2026-06-11T20:00:00-05:00').getTime();
      this.tick();
      this.timer = setInterval(() => this.tick(), 1000);
    },

    tick() {
      const now = Date.now();
      const diff = Math.max(0, this.target - now);

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      this.set('cdDays', days);
      this.set('cdHours', hours);
      this.set('cdMinutes', minutes);
      this.set('cdSeconds', seconds);

      if (diff === 0 && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    set(id, value) {
      const el = document.getElementById(id);
      if (!el) return;
      const v = String(value).padStart(2, '0');
      if (el.textContent !== v) el.textContent = v;
    }
  };

  global.Countdown = Countdown;
})(window);
