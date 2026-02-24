/* ═══════════════════════════════════════════════════════════════
   theme.js — Dark / Light mode toggle
   • Saves preference to localStorage
   • Applies [data-theme="light"] on <html>
   • Updates toggle icon (sun / moon)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  const STORAGE_KEY = "fis-theme";
  const html = document.documentElement;
  const DARK = "dark";
  const LIGHT = "light";

  /* ── 1. Determine initial theme ─────────────────────────────
     Priority: localStorage → system preference → dark (default) */
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === LIGHT || saved === DARK) return saved;
    // fallback to system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return LIGHT;
    }
    return DARK;
  }

  /* ── 2. Apply theme to <html> ───────────────────────────────*/
  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleIcon(theme);
    updateLeafletTiles(theme);
  }

  /* ── 3. Update toggle button icon ──────────────────────────*/
  function updateToggleIcon(theme) {
    const btn = document.getElementById("theme-toggle");
    const icon = document.getElementById("theme-icon");
    if (!btn || !icon) return;

    if (theme === LIGHT) {
      icon.textContent = "🌙";
      btn.title = "Switch to dark mode";
      btn.setAttribute("aria-label", "Switch to dark mode");
    } else {
      icon.textContent = "☀️";
      btn.title = "Switch to light mode";
      btn.setAttribute("aria-label", "Switch to light mode");
    }
  }

  /* ── 4. Update Leaflet map tiles for light mode ─────────────
     Light mode uses a lighter CARTO tile, dark keeps nolabels */
  function updateLeafletTiles(theme) {
    // Called again after map is ready via window.applyMapTheme()
    if (typeof window.applyMapTheme === "function") {
      window.applyMapTheme(theme);
    }
  }

  /* ── 5. Toggle handler ──────────────────────────────────────*/
  function toggleTheme() {
    const current = html.getAttribute("data-theme") || DARK;
    applyTheme(current === DARK ? LIGHT : DARK);
  }

  /* ── 6. Init on DOMContentLoaded ───────────────────────────*/
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
      updateToggleIcon(html.getAttribute("data-theme") || DARK);
    }
  });

  // Expose for external use (e.g. map.js can call applyMapTheme)
  window.getCurrentTheme = () => html.getAttribute("data-theme") || DARK;
})();
