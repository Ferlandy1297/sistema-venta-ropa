## Frontend (Vanilla) — Morfosis / Elite 360

Static frontend built with HTML, CSS and vanilla JS.

How to run (Live Server):
- Open the `frontend/` folder with VS Code.
- Start Live Server (or any static server) and go to `http://127.0.0.1:5500/frontend/index.html`.
- Ensure backend is running at `http://localhost:8080` for API calls.

Pages:
- `index.html` Home: theme toggle, sections, nav and footer.
- `cliente.html` Catálogo público (placeholder, Segmento 6.2).
- `admin.html` Operación admin (placeholder, Segmento 6.3).
- `repartidor.html` Huehue (placeholder, Segmento 6.4).
- `santiago.html` Santiago (placeholder, Segmento 6.4).

Theme toggle:
- Two themes: Morfosis (pastel) / Elite 360 (mono).
- Stored in localStorage:
  - `svr_theme`: `morfosis` | `elite`
  - `svr_grupo_codigo`: `MORFOSIS` | `ELITE360`
- The current theme applies as: `document.documentElement.dataset.theme`.

Structure:
- `assets/css/styles.css` design tokens, components, themes, responsive.
- `assets/js/theme.js` theme init/toggle helpers.
- `assets/js/api.js` API client for `http://localhost:8080`.
- `assets/js/auth.js` role‑based token storage + `login()`.
- `assets/js/ui.js` toast + modal utilities.
- `assets/js/app.js` shared header/footer render and interactions.

Note:
- All content is original. Logos are simple SVG placeholders in `assets/img/`.
