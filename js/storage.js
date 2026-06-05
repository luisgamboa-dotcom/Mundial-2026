/* =========================================================
   storage.js — Wrapper de localStorage con namespace mundial2026:*
   ========================================================= */
(function (global) {
  'use strict';

  const NS = 'mundial2026:';
  const KEYS = {
    lang: NS + 'lang',
    favTeam: NS + 'favTeam',
    bracket: NS + 'bracket',
    quizScore: NS + 'quizScore',
    quizAnswers: NS + 'quizAnswers',
    tz: NS + 'tz'
  };

  const Storage = {
    KEYS,

    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('[storage] no se pudo escribir', key, e);
        return false;
      }
    },

    remove(key) {
      try { localStorage.removeItem(key); } catch (e) {}
    },

    getLang() { return this.get(KEYS.lang, 'es'); },
    setLang(v) { return this.set(KEYS.lang, v); },

    getFavTeam() { return this.get(KEYS.favTeam, null); },
    setFavTeam(v) { return this.set(KEYS.favTeam, v); },

    getBracket() { return this.get(KEYS.bracket, null); },
    setBracket(v) { return this.set(KEYS.bracket, v); },

    getQuizScore() { return this.get(KEYS.quizScore, null); },
    setQuizScore(v) { return this.set(KEYS.quizScore, v); },
    getQuizAnswers() { return this.get(KEYS.quizAnswers, null); },
    setQuizAnswers(v) { return this.set(KEYS.quizAnswers, v); },

    getTz() { return this.get(KEYS.tz, null); },
    setTz(v) { return this.set(KEYS.tz, v); },

    resetAll() {
      Object.values(KEYS).forEach(k => this.remove(k));
    }
  };

  global.Storage = Storage;
})(window);
