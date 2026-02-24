/* ═══════════════════════════════════════════════════════════════
   map.js — Kenya County Risk Map
   Updated: all 47 counties with correct coordinates
   ═══════════════════════════════════════════════════════════════ */

const THRESHOLD = 0.45;

/* ── IPC Phase color system ───────────────────────────────────
   Phase 1 – Minimal   → score < 0.35
   Phase 2 – Stressed  → score 0.35–0.45
   Phase 3 – Crisis    → score 0.45–0.60
   Phase 4 – Emergency → score 0.60–0.75
   Phase 5 – Famine    → score ≥ 0.75
──────────────────────────────────────────────────────────────── */
function riskColor(score) {
  if (score >= 0.75) return "#640000"; // Phase 5 – Famine
  if (score >= 0.6) return "#C80000"; // Phase 4 – Emergency
  if (score >= 0.45) return "#E67800"; // Phase 3 – Crisis
  if (score >= 0.35) return "#FAE61E"; // Phase 2 – Stressed
  return "#CDFACD"; // Phase 1 – Minimal
}

function riskLabel(score) {
  if (score >= 0.75) return "Famine";
  if (score >= 0.6) return "Emergency";
  if (score >= 0.45) return "Crisis";
  if (score >= 0.35) return "Stressed";
  return "Minimal";
}

function riskPhase(score) {
  if (score >= 0.75) return "Phase 5";
  if (score >= 0.6) return "Phase 4";
  if (score >= 0.45) return "Phase 3";
  if (score >= 0.35) return "Phase 2";
  return "Phase 1";
}

function riskTextColor(score) {
  return score >= 0.35 ? "#f0ede6" : "#1a5e1a";
}

// ── All 47 Kenya County Centroids ─────────────────────────────
const KENYA_COUNTIES_GEOJSON = {
  type: "FeatureCollection",
  features: [
    // Coast
    {
      type: "Feature",
      properties: { name: "Mombasa" },
      geometry: { type: "Point", coordinates: [39.67, -4.05] },
    },
    {
      type: "Feature",
      properties: { name: "Kwale" },
      geometry: { type: "Point", coordinates: [39.45, -4.18] },
    },
    {
      type: "Feature",
      properties: { name: "Kilifi" },
      geometry: { type: "Point", coordinates: [39.85, -3.63] },
    },
    {
      type: "Feature",
      properties: { name: "Tana River" },
      geometry: { type: "Point", coordinates: [39.68, -1.54] },
    },
    {
      type: "Feature",
      properties: { name: "Lamu" },
      geometry: { type: "Point", coordinates: [40.9, -2.27] },
    },
    {
      type: "Feature",
      properties: { name: "Taita Taveta" },
      geometry: { type: "Point", coordinates: [38.37, -3.4] },
    },
    // North Eastern
    {
      type: "Feature",
      properties: { name: "Garissa" },
      geometry: { type: "Point", coordinates: [39.65, 0.46] },
    },
    {
      type: "Feature",
      properties: { name: "Wajir" },
      geometry: { type: "Point", coordinates: [40.06, 1.75] },
    },
    {
      type: "Feature",
      properties: { name: "Mandera" },
      geometry: { type: "Point", coordinates: [41.86, 3.94] },
    },
    // Eastern
    {
      type: "Feature",
      properties: { name: "Marsabit" },
      geometry: { type: "Point", coordinates: [37.99, 2.34] },
    },
    {
      type: "Feature",
      properties: { name: "Isiolo" },
      geometry: { type: "Point", coordinates: [37.58, 0.35] },
    },
    {
      type: "Feature",
      properties: { name: "Meru" },
      geometry: { type: "Point", coordinates: [37.65, 0.05] },
    },
    {
      type: "Feature",
      properties: { name: "Tharaka Nithi" },
      geometry: { type: "Point", coordinates: [37.92, -0.3] },
    },
    {
      type: "Feature",
      properties: { name: "Embu" },
      geometry: { type: "Point", coordinates: [37.45, -0.53] },
    },
    {
      type: "Feature",
      properties: { name: "Kitui" },
      geometry: { type: "Point", coordinates: [38.01, -1.37] },
    },
    {
      type: "Feature",
      properties: { name: "Machakos" },
      geometry: { type: "Point", coordinates: [37.27, -1.52] },
    },
    {
      type: "Feature",
      properties: { name: "Makueni" },
      geometry: { type: "Point", coordinates: [37.62, -2.25] },
    },
    // Central
    {
      type: "Feature",
      properties: { name: "Nyandarua" },
      geometry: { type: "Point", coordinates: [36.52, -0.18] },
    },
    {
      type: "Feature",
      properties: { name: "Nyeri" },
      geometry: { type: "Point", coordinates: [36.95, -0.42] },
    },
    {
      type: "Feature",
      properties: { name: "Kirinyaga" },
      geometry: { type: "Point", coordinates: [37.28, -0.66] },
    },
    {
      type: "Feature",
      properties: { name: "Murang'a" },
      geometry: { type: "Point", coordinates: [37.05, -0.72] },
    },
    {
      type: "Feature",
      properties: { name: "Kiambu" },
      geometry: { type: "Point", coordinates: [36.83, -1.03] },
    },
    // Rift Valley
    {
      type: "Feature",
      properties: { name: "Turkana" },
      geometry: { type: "Point", coordinates: [35.96, 3.81] },
    },
    {
      type: "Feature",
      properties: { name: "West Pokot" },
      geometry: { type: "Point", coordinates: [35.12, 1.62] },
    },
    {
      type: "Feature",
      properties: { name: "Samburu" },
      geometry: { type: "Point", coordinates: [36.91, 1.22] },
    },
    {
      type: "Feature",
      properties: { name: "Trans Nzoia" },
      geometry: { type: "Point", coordinates: [35.0, 1.1] },
    },
    {
      type: "Feature",
      properties: { name: "Uasin Gishu" },
      geometry: { type: "Point", coordinates: [35.3, 0.55] },
    },
    {
      type: "Feature",
      properties: { name: "Elgeyo Marakwet" },
      geometry: { type: "Point", coordinates: [35.51, 0.6] },
    },
    {
      type: "Feature",
      properties: { name: "Nandi" },
      geometry: { type: "Point", coordinates: [35.14, 0.18] },
    },
    {
      type: "Feature",
      properties: { name: "Baringo" },
      geometry: { type: "Point", coordinates: [36.08, 0.47] },
    },
    {
      type: "Feature",
      properties: { name: "Laikipia" },
      geometry: { type: "Point", coordinates: [36.78, 0.36] },
    },
    {
      type: "Feature",
      properties: { name: "Nakuru" },
      geometry: { type: "Point", coordinates: [36.07, -0.3] },
    },
    {
      type: "Feature",
      properties: { name: "Narok" },
      geometry: { type: "Point", coordinates: [35.87, -1.08] },
    },
    {
      type: "Feature",
      properties: { name: "Kajiado" },
      geometry: { type: "Point", coordinates: [36.78, -2.1] },
    },
    {
      type: "Feature",
      properties: { name: "Kericho" },
      geometry: { type: "Point", coordinates: [35.29, -0.37] },
    },
    {
      type: "Feature",
      properties: { name: "Bomet" },
      geometry: { type: "Point", coordinates: [35.34, -0.79] },
    },
    // Western
    {
      type: "Feature",
      properties: { name: "Kakamega" },
      geometry: { type: "Point", coordinates: [34.75, 0.28] },
    },
    {
      type: "Feature",
      properties: { name: "Vihiga" },
      geometry: { type: "Point", coordinates: [34.72, 0.07] },
    },
    {
      type: "Feature",
      properties: { name: "Bungoma" },
      geometry: { type: "Point", coordinates: [34.56, 0.56] },
    },
    {
      type: "Feature",
      properties: { name: "Busia" },
      geometry: { type: "Point", coordinates: [34.11, 0.46] },
    },
    // Nyanza
    {
      type: "Feature",
      properties: { name: "Siaya" },
      geometry: { type: "Point", coordinates: [34.29, -0.06] },
    },
    {
      type: "Feature",
      properties: { name: "Kisumu" },
      geometry: { type: "Point", coordinates: [34.76, -0.09] },
    },
    {
      type: "Feature",
      properties: { name: "Homa Bay" },
      geometry: { type: "Point", coordinates: [34.46, -0.52] },
    },
    {
      type: "Feature",
      properties: { name: "Migori" },
      geometry: { type: "Point", coordinates: [34.47, -1.06] },
    },
    {
      type: "Feature",
      properties: { name: "Kisii" },
      geometry: { type: "Point", coordinates: [34.77, -0.68] },
    },
    {
      type: "Feature",
      properties: { name: "Nyamira" },
      geometry: { type: "Point", coordinates: [34.94, -0.56] },
    },
    // Nairobi
    {
      type: "Feature",
      properties: { name: "Nairobi" },
      geometry: { type: "Point", coordinates: [36.82, -1.29] },
    },
  ],
};

// ── State ─────────────────────────────────────────────────────
let map = null;
let countyData = {};
let markers = {};
let selectedCounty = null;

// ── Init map ──────────────────────────────────────────────────
function initMap() {
  map = L.map("kenya-map", {
    center: [0.5, 37.9],
    zoom: 6,
    zoomControl: true,
    attributionControl: true,
  });

  window._leafletMap = map;

  // Dark base layer
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution: "© OpenStreetMap, © CARTO",
      subdomains: "abcd",
      maxZoom: 19,
    },
  ).addTo(map);

  // Labels on top
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
    { attribution: "", subdomains: "abcd", maxZoom: 19, pane: "shadowPane" },
  ).addTo(map);
}

// ── Fetch data & render ───────────────────────────────────────
async function loadCountyData() {
  try {
    const res = await fetch("/api/county-risks");
    const data = await res.json();
    countyData = data.counties;

    renderMap();
    renderSidebar(data);
    hideLoading();
  } catch (err) {
    console.error("Failed to load county data:", err);
    hideLoading();
  }
}

// ── Render map markers ────────────────────────────────────────
function renderMap() {
  KENYA_COUNTIES_GEOJSON.features.forEach((feature) => {
    const name = feature.properties.name;
    const [lng, lat] = feature.geometry.coordinates;
    const info = countyData[name];
    if (!info) return;

    const score = info.risk_score;
    const color = riskColor(score);
    const isInsecure = score >= THRESHOLD;
    const radius = 8 + score * 14;

    const circle = L.circleMarker([lat, lng], {
      radius,
      fillColor: color,
      fillOpacity: isInsecure ? 0.82 : 0.5,
      color,
      weight: isInsecure ? 2 : 1,
      opacity: isInsecure ? 1.0 : 0.6,
    }).addTo(map);

    // Pulse ring for Phase 4 / Phase 5
    if (score >= 0.6) {
      L.circleMarker([lat, lng], {
        radius: radius + 7,
        fillColor: "transparent",
        fillOpacity: 0,
        color,
        weight: 1.5,
        opacity: 0.35,
        className: "pulse-ring",
      }).addTo(map);
    }

    // Tooltip
    const tooltipContent = `
      <div class="county-tooltip">
        <div class="tt-county">${name}</div>
        <div class="tt-row">
          <span>IPC Phase</span>
          <span class="tt-val" style="
            background:${color};
            color:${riskTextColor(score)};
            padding:2px 8px;
            border-radius:10px;
            font-weight:600;
            font-size:10px;
          ">${riskPhase(score)} · ${riskLabel(score)}</span>
        </div>
        <div class="tt-row">
          <span>Risk Score</span>
          <span class="tt-val">${score.toFixed(3)}</span>
        </div>
        <div class="tt-row">
          <span>Region</span>
          <span class="tt-val">${info.region || "—"}</span>
        </div>
        ${info.is_asal ? '<div class="tt-row"><span class="tt-val" style="color:#F5A623;">ASAL County</span></div>' : ""}
      </div>
    `;

    circle.bindTooltip(tooltipContent, {
      permanent: false,
      direction: "top",
      offset: [0, -radius - 4],
      className: "leaflet-tooltip-custom",
    });

    circle.on("click", () => selectCounty(name, info));
    markers[name] = circle;
  });

  addMapLegend();
}

// ── Map legend ────────────────────────────────────────────────
function addMapLegend() {
  const legend = L.control({ position: "bottomleft" });
  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "map-legend-control");
    div.innerHTML = `
      <div style="
        background: rgba(10,18,8,0.94);
        border: 1px solid rgba(245,166,35,0.20);
        border-radius: 10px;
        padding: 12px 16px;
        font-family: 'Outfit', sans-serif;
        font-size: 11px;
        color: #70796d;
        backdrop-filter: blur(10px);
        min-width: 180px;
      ">
        <div style="text-transform:uppercase;letter-spacing:.10em;margin-bottom:10px;font-size:10px;font-weight:600;color:#F5A623;">
          IPC Phase Classification
        </div>
        ${[
          ["#640000", "#f0ede6", "5", "Famine", "≥ 0.75"],
          ["#C80000", "#f0ede6", "4", "Emergency", "≥ 0.60"],
          ["#E67800", "#f0ede6", "3", "Crisis", "≥ 0.45"],
          ["#FAE61E", "#1a5e1a", "2", "Stressed", "≥ 0.35"],
          ["#CDFACD", "#1a5e1a", "1", "Minimal", "< 0.35"],
        ]
          .map(
            ([bg, txt, ph, label, range]) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
            <div style="
              width:22px;height:22px;border-radius:5px;background:${bg};
              flex-shrink:0;display:flex;align-items:center;justify-content:center;
              font-size:9px;font-weight:700;color:${txt};
            ">${ph}</div>
            <div>
              <div style="color:#f0ede6;font-weight:600;font-size:11px;">${label}</div>
              <div style="color:#7a9170;font-size:9px;">${range}</div>
            </div>
          </div>
        `,
          )
          .join("")}
        <div style="
          margin-top:10px;padding-top:8px;
          border-top:1px solid rgba(255,255,255,0.07);
          display:flex;align-items:center;gap:8px;
        ">
          <div style="width:16px;height:2px;background:#F5A623;border-radius:1px;flex-shrink:0;"></div>
          <span style="color:#F5A623;font-size:10px;font-weight:500;">Threshold = 0.45</span>
        </div>
      </div>
    `;
    return div;
  };
  legend.addTo(map);
}

// ── Sidebar rendering ─────────────────────────────────────────
function renderSidebar(data) {
  const counties = Object.entries(data.counties).sort(
    (a, b) => b[1].risk_score - a[1].risk_score,
  );

  const insecureCount = counties.filter(
    ([, v]) => v.risk_score >= THRESHOLD,
  ).length;
  const secureCount = counties.length - insecureCount;

  document.getElementById("count-insecure").textContent = insecureCount;
  document.getElementById("count-secure").textContent = secureCount;
  document.getElementById("val-recall").textContent = data.metadata.recall
    ? (data.metadata.recall * 100).toFixed(0) + "%"
    : "88%";
  document.getElementById("val-auc").textContent = data.metadata.roc_auc
    ? data.metadata.roc_auc.toFixed(3)
    : "0.898";

  const list = document.getElementById("county-list");
  list.innerHTML = "";

  counties.forEach(([name, info], idx) => {
    const score = info.risk_score;
    const color = riskColor(score);
    const isInsecure = score >= THRESHOLD;

    const item = document.createElement("div");
    item.className = "county-item";
    item.dataset.county = name;
    item.style.animationDelay = `${0.05 + idx * 0.015}s`;

    item.innerHTML = `
      <span class="county-rank">${String(idx + 1).padStart(2, "0")}</span>
      <span class="county-name">${name}</span>
      <div class="county-bar-wrap">
        <div class="county-bar" style="width:${score * 100}%;background:${color};"></div>
      </div>
      <span class="county-score" style="color:${color}">${score.toFixed(2)}</span>
      <div class="county-flag ${isInsecure ? "insecure" : "secure"}">${isInsecure ? "!" : "✓"}</div>
    `;

    item.addEventListener("click", () => {
      selectCounty(name, info);
      const feature = KENYA_COUNTIES_GEOJSON.features.find(
        (f) => f.properties.name === name,
      );
      if (feature) {
        const [lng, lat] = feature.geometry.coordinates;
        map.flyTo([lat, lng], 8, { duration: 1.2, easeLinearity: 0.4 });
      }
    });

    list.appendChild(item);
  });
}

// ── Select county ─────────────────────────────────────────────
function selectCounty(name, info) {
  selectedCounty = name;

  document.querySelectorAll(".county-item").forEach((el) => {
    el.classList.toggle("selected", el.dataset.county === name);
  });

  const detail = document.getElementById("county-detail");
  detail.classList.add("visible");

  const score = info.risk_score;
  const color = riskColor(score);
  const isInsecure = score >= THRESHOLD;

  document.getElementById("cd-name").textContent = name;

  const badge = document.getElementById("cd-badge");
  badge.textContent = isInsecure
    ? `${riskPhase(score)} · ${riskLabel(score)}`
    : "Phase 1 · Minimal";
  badge.className = `cd-badge ${isInsecure ? "insecure" : "secure"}`;

  const fill = document.getElementById("cd-gauge-fill");
  fill.style.width = `${score * 100}%`;
  fill.style.background = isInsecure
    ? `linear-gradient(90deg, #E67800, ${color})`
    : `linear-gradient(90deg, #2D6A4F, #CDFACD)`;

  document.getElementById("cd-gauge-threshold").style.left =
    `${THRESHOLD * 100}%`;
  document.getElementById("cd-score-val").textContent = score.toFixed(3);
  document.getElementById("cd-crisis-rate").textContent =
    (info.crisis_rate * 100).toFixed(0) + "%";

  // Dim non-selected markers
  Object.entries(markers).forEach(([n, m]) => {
    const s = countyData[n]?.risk_score || 0;
    m.setStyle({
      fillOpacity: n === name ? 0.95 : s >= THRESHOLD ? 0.3 : 0.15,
      weight: n === name ? 3 : s >= THRESHOLD ? 1.5 : 1,
      opacity: n === name ? 1.0 : 0.35,
    });
  });
}

// ── Filter buttons ────────────────────────────────────────────
document
  .getElementById("btn-all")
  .addEventListener("click", () => setFilter("all"));
document
  .getElementById("btn-insecure")
  .addEventListener("click", () => setFilter("insecure"));
document
  .getElementById("btn-secure")
  .addEventListener("click", () => setFilter("secure"));

function setFilter(mode) {
  document
    .querySelectorAll(".ctrl-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(`btn-${mode}`).classList.add("active");

  document.querySelectorAll(".county-item").forEach((el) => {
    const score = countyData[el.dataset.county]?.risk_score || 0;
    let show = true;
    if (mode === "insecure") show = score >= THRESHOLD;
    if (mode === "secure") show = score < THRESHOLD;
    el.style.display = show ? "" : "none";
  });

  Object.entries(markers).forEach(([name, marker]) => {
    const score = countyData[name]?.risk_score || 0;
    let show = true;
    if (mode === "insecure") show = score >= THRESHOLD;
    if (mode === "secure") show = score < THRESHOLD;
    marker.setStyle({
      opacity: show ? 0.95 : 0.04,
      fillOpacity: show ? 0.8 : 0.04,
    });
  });
}

// ── Loading helpers ───────────────────────────────────────────
function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.4s";
    setTimeout(() => overlay.remove(), 400);
  }
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadCountyData();
});
