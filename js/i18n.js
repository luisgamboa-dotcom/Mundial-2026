/* =========================================================
   i18n.js — Selector de idioma ES/EN
   ========================================================= */
(function (global) {
  'use strict';

  const I18n = {
    current: 'es',
    dict: {},

    init() {
      const saved = Storage.getLang();
      this.current = (saved === 'en' || saved === 'es') ? saved : 'es';
      this.dict = { es: global.LANG_ES, en: global.LANG_EN };
      this.apply();
      this.bindLangButtons();
    },

    t(path) {
      const dict = this.dict[this.current] || {};
      return path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : null), dict) ?? path;
    },

    setLang(lang) {
      if (lang !== 'es' && lang !== 'en') return;
      this.current = lang;
      Storage.setLang(lang);
      this.apply();
      document.documentElement.lang = lang;
      // Notificar a otros módulos
      document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));
    },

    apply() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = this.t(key);
        if (value && typeof value === 'string') el.textContent = value;
      });
      document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        const map = el.getAttribute('data-i18n-attr').split(';');
        map.forEach(pair => {
          const [attr, key] = pair.split(':').map(s => s.trim());
          if (attr && key) {
            const value = this.t(key);
            if (value) el.setAttribute(attr, value);
          }
        });
      });
      // Botones de idioma
      document.querySelectorAll('.lang-btn').forEach(btn => {
        const isActive = btn.dataset.lang === this.current;
        btn.classList.toggle('lang-btn--active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });
      // SEO dinámico
      const titleEl = document.querySelector('title[data-i18n]');
      if (titleEl) {
        const title = this.t('meta.title');
        document.title = title;
      }
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', this.t('meta.description'));
    },

    bindLangButtons() {
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => this.setLang(btn.dataset.lang));
      });
    },

    teamName(team) { return team?.name?.[this.current] || ''; }
  };

  global.I18n = I18n;
})(window);
