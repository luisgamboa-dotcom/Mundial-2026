/* =========================================================
   map.js — Leaflet con OpenStreetMap y popups personalizados
   ========================================================= */
(function (global) {
  'use strict';

  const Map = {
    leaflet: null,
    markers: [],

    init() {
      if (typeof L === 'undefined') {
        console.warn('[map] Leaflet no disponible');
        this.fallback();
        return;
      }
      this.leaflet = L.map('map', {
        scrollWheelZoom: false,
        zoomControl: true
      }).setView([39.5, -98.35], 4);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(this.leaflet);

      const venues = global.VENUES_DATA || [];
      venues.forEach(v => this.addMarker(v));

      // Fit bounds
      const bounds = L.latLngBounds(venues.map(v => [v.lat, v.lng]));
      this.leaflet.fitBounds(bounds.pad(0.15));

      // Habilitar zoom al hacer click
      this.leaflet.once('focus', () => this.leaflet.scrollWheelZoom.enable());
      document.getElementById('map')?.addEventListener('click', () => this.leaflet.scrollWheelZoom.enable());
    },

    addMarker(v) {
      const colors = { us: 'F24B59', mx: '588C60', ca: 'F24968' };
      const color = colors[v.countryCode] || '2C4373';
      const icon = L.divIcon({
        className: 'venue-marker',
        html: `<div style="
          width:32px;height:32px;border-radius:50% 50% 50% 0;
          background:#${color};
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 4px 12px rgba(0,0,0,0.3);
          border:2px solid #F2F2F2;
        "><span style="transform:rotate(45deg);color:#F2F2F2;font-family:'Bebas Neue',sans-serif;font-size:0.9rem;font-weight:700">${v.capacity > 70000 ? '★' : v.id.substr(0,2).toUpperCase()}</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([v.lat, v.lng], { icon }).addTo(this.leaflet);
      this.markers.push(marker);

      const popup = `
        <div class="popup-card">
          <div class="popup-card__name">${v.name}</div>
          <div class="popup-card__city">${v.city[I18n.current]}, ${v.country[I18n.current]}</div>
          <div class="popup-card__meta">
            <span>👥 ${v.capacity.toLocaleString()}</span>
            <span>⚽ ${v.matches} ${I18n.t('sections.venues.matches')}</span>
          </div>
          <a class="popup-card__link" target="_blank" rel="noopener noreferrer"
             href="https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}">
            ${I18n.t('sections.venues.howToGet')} →
          </a>
        </div>`;
      marker.bindPopup(popup, { maxWidth: 280 });

      // Al hacer click en la card → abrir popup
      document.querySelectorAll(`.venue-card[data-venue="${v.id}"]`).forEach(card => {
        card.addEventListener('click', () => {
          this.leaflet.setView([v.lat, v.lng], 12, { animate: true });
          marker.openPopup();
          document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      });
    },

    fallback() {
      const el = document.getElementById('map');
      if (el) el.innerHTML = '<p style="padding:40px;text-align:center;color:#F2F2F2;background:#2C4373">Mapa no disponible. Verifica la conexión.</p>';
    }
  };

  global.Map = Map;
})(window);
