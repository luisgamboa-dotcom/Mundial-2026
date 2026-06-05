# Mundial-2026
Este proyecto es para empezar a practicar con IAs y empezar en el desarrollo de mis habilidades como informatico.

# Primer mensaje

Este va a ser el primer cambio que comprendo por completo al hacer usar un repositorio de GitHub.

## Prompt para crear la página web del Mundial 2026
**ROL:** Actúa como un experto en creación de páginas web y diseño
UI/UX, especializado en landing pages deportivas de alto impacto
visual, con dominio de GSAP para animaciones de alto nivel.
**TAREA:** Diseñar y desarrollar una página web del Mundial 2026
que sea promocional, interactiva, llamativa y fácil de navegar.
Debe captar la atención del usuario desde el primer instante
mediante una jerarquía visual clara, tipografía moderna y una
paleta de colores coherente y luminosa. La página debe estructurarse
en secciones bien definidas que incluyan:
- **Equipos clasificados:** Presentación visual de las 48 selecciones
  participantes (banderas, nombres, grupos) con estadísticas básicas
  de cada equipo (títulos, participaciones, ranking FIFA, máximo
  goleador histórico, etc.) mostradas al pasar el cursor o al hacer
  clic en cada tarjeta.
- **Partidos y fechas:** Calendario interactivo o tabla con los
  encuentros programados y sus horarios, con filtros por grupo,
  selección, fecha y estadio. Cada partido debe permitir "Agregar
  a mi calendario" (genera un archivo `.ics` descargable) y mostrar
  la hora convertida a la zona horaria del usuario (detección
  automática con `Intl.DateTimeFormat`, con opción de cambiar
  manualmente).
- **Ubicaciones:** Mapa interactivo basado en **Leaflet con tiles
  de OpenStreetMap** (atribución obligatoria:
  `© OpenStreetMap contributors`), con los 16 estadios
  (11 en USA, 3 en México, 2 en Canadá). Click en marcador →
  tarjeta con nombre, ciudad, capacidad, partidos que alberga,
  galería y botón "Cómo llegar" (Google Maps).
- **Bracket Predictor (predicción del cuadro):** Sección donde el
  usuario selecciona los ganadores fase por fase (fase de grupos,
  dieciseisavos, octavos, cuartos, semis, final) hasta coronar un
  campeón. La predicción se guarda en `localStorage` y se puede
  **compartir como imagen PNG** (renderizada con `html2canvas` por
  CDN, o con Canvas nativo como fallback) lista para WhatsApp/X.
- **Trivia / "¿Cuánto sabes del Mundial?":** Mini-quiz de 5–8
  preguntas con puntaje final, persistido en `localStorage`, con
  botón "Compartir mi puntaje" que genera una imagen-card.
- **Secciones vacías preparadas:** Varias secciones-placeholder con
  contenido indicativo ("Próximamente", "En construcción") y
  transiciones sutiles, listas para futuras implementaciones
  (noticias, tienda, galería multimedia, patrocinadores, etc.).
  Cada sección vacía debe tener un comentario en el HTML
  señalando su propósito.
**HERO CINEMATOGRÁFICO:** La página debe abrir con un hero a
pantalla completa que contenga:
- Logo oficial del Mundial 2026, título grande ("ROAD TO 2026")
  y la fecha del partido inaugural (11 de junio de 2026).
- **Cuenta regresiva en vivo** (DD : HH : MM : SS) que se
  actualiza cada segundo con JavaScript, apuntando a
  `2026-06-11T18:00:00-05:00` (hora de México/USA Central).
- Tres stat-cards animadas: "48 selecciones", "104 partidos",
  "3 países sede (USA · México · Canadá)".
- CTA doble: "Ver partidos" y "Haz tu predicción".
- Efecto sutil de partículas/confetti al cargar (Canvas vanilla
  o CSS animation, sin librerías externas).
- Botón/prompt inicial: **"Elige tu selección"** → al elegir un
  equipo, los acentos de la UI se tintan con los colores de esa
  selección (overlay sobre la paleta base, con variables CSS
  custom properties). La elección persiste en `localStorage` y
  filtra automáticamente la sección de partidos.
**INTERNACIONALIZACIÓN (i18n):** La página debe estar en
**español e inglés**. Selector de idioma visible en el header
que alterna entre ambos sin recargar la página. Los textos se
organizarán en `lang/es.js` y `lang/en.js`. La preferencia de
idioma persiste en `localStorage`.
**ANIMACIONES Y MICRO-INTERACCIONES (GSAP vía CDN):**
Toda la animación de la página se realiza con **GSAP cargado
por CDN** (`https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js`),
más `ScrollTrigger` si se necesita. Animaciones requeridas:
- Reveal escalonado de tarjetas al entrar en viewport
  (`gsap.from` con `scrollTrigger`).
- Parallax sutil en el hero (el logo y el fondo se mueven a
  velocidades distintas al hacer scroll).
- Hover 3D tilt en las tarjetas de equipos
  (`gsap.quickTo` o `gsap.timeline` en `mousemove`).
- Contador animado en las stat-cards del hero (números que
  cuentan de 0 al valor final).
- Línea de tiempo de entrada: header → logo → título →
  countdown → stats → CTAs (animación orquestada con un
  `gsap.timeline`).
- **Respetar `prefers-reduced-motion`**:
  desactivar/paralizar animaciones si el usuario lo solicita
  en su sistema.
- Fallback: si GSAP no carga (offline/CDN caído), el sitio debe
  seguir siendo funcional y navegable (progressive enhancement).
**MAPA INTERACTIVO:** Implementado con **Leaflet** (`https://unpkg.com/leaflet@1.9.4/dist/leaflet.css` y `leaflet.js`),
usando tiles de **OpenStreetMap** (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
Atribución obligatoria visible. Marcadores personalizados con
los colores de la paleta para cada uno de los 16 estadios.
Click → popup elegante (no el default de Leaflet) con tarjeta
HTML estilizada.
**PERSISTENCIA LOCAL (localStorage):** Toda la interacción
del usuario se persiste en `localStorage` bajo un namespace
`mundial2026:*`:
- `mundial2026:lang` → 'es' | 'en'
- `mundial2026:favTeam` → código ISO de la selección favorita
- `mundial2026:bracket` → objeto JSON con la predicción completa
- `mundial2026:quizScore` → número
- `mundial2026:tz` → zona horaria preferida (si el usuario la
  cambia manualmente)
Incluir un botón discreto "Resetear mis datos" en el footer o
en un modal de ajustes que limpie todo el namespace.
**FORMATO:** HTML5 semántico (`<header>`, `<main>`, `<section>`,
`<article>`, `<footer>`), CSS moderno (Flexbox/Grid) y código
limpio. El proyecto se desarrollará **exclusivamente con
HTML + CSS + JavaScript vanilla** (sin frameworks), con las
siguientes **dependencias por CDN** permitidas:
- **GSAP 3.12+** (obligatoria) y opcional `ScrollTrigger`.
- **Leaflet 1.9.4** (obligatoria) para el mapa.
- **html2canvas** (opcional) para el share-card del bracket.
Diseño responsive, **mobile-first**, con navegación simple
(hover states, scroll suave entre secciones, scroll-snap
opcional en móvil para secciones tipo carrusel).
**SEO Y DATOS ESTRUCTURADOS:** Metadatos SEO completos
(`<title>`, `<meta name="description">`, Open Graph, Twitter
Cards, `lang` dinámico, canonical). Datos estructurados
**Schema.org** de tipo `SportsEvent`, `SportsTeam`, `Place` y
`Event` para representar el torneo, partidos, sedes y equipos.
Favicon y `apple-touch-icon` referenciados.
**TONO VISUAL:** Deportivo, limpio, luminoso, con tipografía
moderna de Google Fonts (recomendado: **Inter** o **Outfit**
para texto, **Bebas Neue** o **Anton** para titulares
deportivos), buen contraste, legibilidad, espaciado generoso
y diseño aireado.
**CONTEXTO:** Proyecto profesional y escalable, preparado
para:
- Reemplazar los `data/*.js` por fetch a un backend o API REST.
- Bases de datos (equipos, partidos, resultados).
- Autenticación de usuarios y paneles de administración.
- Llenado progresivo de las secciones-placeholder.
**Paleta de colores (ESTRICTAMENTE LIMITADA — NO se permite
ningún color fuera de esta paleta):**
- `#F24B59` – Rojo vibrante (acento principal)
- `#F24968` – Rosa intenso (acento secundario)
- `#2C4373` – Azul profundo (fondos o headers)
- `#588C60` – Verde natural (detalles o éxito)
- `#F2F2F2` – Gris claro (fondos o texto sobre oscuro)
Cualquier elemento (botones, textos, fondos, bordes, iconos,
sombras, estados hover) debe construirse **exclusivamente**
con estos cinco colores o con sus variaciones de opacidad
(`rgba`) y aclarado/oscurecimiento derivadas de los mismos.
No se introducirán colores adicionales bajo ninguna
circunstancia. La excepción puntual son los **colores de la
selección favorita del usuario** (overlay tintado vía CSS
custom properties), que se aplicarán como capa semitransparente
sobre la paleta base.
**"PAREZCA MODERNA" — apariencia y pulido visual:**
El sitio debe transmitir sensación de producto profesional
actual (estilo 2024–2026) sin requerir instalación ni
funcionalidad offline. Para lograrlo:
- Diseño visual cuidado: glassmorphism sutil en cards,
  sombras suaves, bordes redondeados generosos, micro-detalles
  en hover.
- Tipografía escalonada con jerarquía clara.
- Skeleton loaders mientras se hidratan las cards desde
  `data/*.js`.
- Imágenes en formato WebP con fallback, lazy loading.
- Transiciones suaves en hover (200–300ms) y animaciones
  de scroll con GSAP.
- **No** se requiere service worker, manifest.json ni
  comportamiento offline. Es una web clásica servida como
  sitio promocional.
**FOOTER:** Redes sociales relevantes para el torneo
(X/Twitter, Instagram, Facebook, YouTube, TikTok) con iconos
SVG inline. Enlaces oficiales a FIFA y a las federaciones
sede. Botón "Resetear mis datos" (limpia el namespace
`mundial2026:*` de `localStorage`). Créditos del proyecto.
**CALIDAD Y RENDIMIENTO:**
- Accesibilidad WCAG 2.1 AA: roles ARIA, focus visible,
  navegación por teclado, contraste AA, `prefers-reduced-motion`
  respetado, textos alternativos en imágenes.
- Imágenes con `loading="lazy"` y dimensiones explícitas
  para evitar layout shift.
- Cero JavaScript bloqueante: scripts con `defer` o `async`.
- Fallback graceful si GSAP o Leaflet no cargan.
- Código organizado en módulos lógicos:
  - `data/teams.js`, `data/matches.js`, `data/venues.js`
  - `lang/es.js`, `lang/en.js`
  - `js/main.js` (orquestador), `js/hero.js`, `js/bracket.js`,
    `js/quiz.js`, `js/i18n.js`, `js/storage.js`, `js/map.js`,
    `js/countdown.js`
  - `css/base.css`, `css/components.css`, `css/animations.css`,
    `css/responsive.css`
**IMÁGENES Y RECURSOS VISUALES:**
- Imágenes y logos oficiales del Mundial 2026 para ambientar
  la página.
- Carpeta `images/` en la raíz del proyecto. Nombres
  autodescriptivos (ej: `Logo_Mundial.jpg`).
- Si una imagen no está disponible, **deja un comentario en
  el `README.md`** especificando qué debería contener
  (descripción, dimensiones sugeridas, estilo) para que un
  diseñador pueda crearla.
  - Ejemplo: `"Falta la imagen de la bandera de Argentina
    en images/flags/ar.png — debería ser un PNG sin fondo
    de 120x80px"`.
- Carpeta `images/flags/` para los 48 países (códigos ISO
  en minúscula: `ar.png`, `br.png`, etc.).
- Carpeta `images/stadiums/` para fotos de los 16 estadios.
- Siempre rutas relativas desde la raíz
  (`src="images/Logo_Mundial.jpg"`).