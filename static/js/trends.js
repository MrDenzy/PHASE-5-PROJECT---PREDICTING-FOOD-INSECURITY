/* ═══════════════════════════════════════════════════════════════
   trends.js — Tab 3 Trend Monitor
   Fixed to match index.html canvas IDs:
     chart-timeseries, chart-phases, chart-importance
   Fixed stat card IDs:
     trend-peak, trend-avg, trend-months, trend-trend
   Fixed county select ID:
     trend-county-select
   ═══════════════════════════════════════════════════════════════ */

const TREND_THRESHOLD = 0.45;

// ── Historical trend data (2019–2025) per county ──────────────
const TREND_DATA = {
  Turkana: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.6, 0.65, 0.62, 0.7, 0.68, 0.75, 0.8, 0.85, 0.78, 0.82, 0.79, 0.88, 0.8,
      0.87,
    ],
    ml_prediction: [
      0.62, 0.67, 0.64, 0.72, 0.7, 0.77, 0.82, 0.87, 0.8, 0.84, 0.81, 0.9, 0.82,
      0.89,
    ],
    ipc_phase: [3, 3, 3, 3, 3, 4, 4, 4, 3, 4, 4, 4, 3, 4],
  },
  Marsabit: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.55, 0.6, 0.58, 0.65, 0.63, 0.7, 0.75, 0.8, 0.72, 0.77, 0.74, 0.82, 0.75,
      0.81,
    ],
    ml_prediction: [
      0.57, 0.62, 0.6, 0.67, 0.65, 0.72, 0.77, 0.82, 0.74, 0.79, 0.76, 0.84,
      0.77, 0.83,
    ],
    ipc_phase: [3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 4, 3, 4],
  },
  Mandera: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.58, 0.62, 0.6, 0.68, 0.65, 0.72, 0.78, 0.82, 0.74, 0.79, 0.76, 0.84,
      0.78, 0.82,
    ],
    ml_prediction: [
      0.6, 0.64, 0.62, 0.7, 0.67, 0.74, 0.8, 0.84, 0.76, 0.81, 0.78, 0.86, 0.8,
      0.84,
    ],
    ipc_phase: [3, 3, 3, 3, 3, 4, 4, 4, 3, 4, 4, 4, 3, 4],
  },
  Wajir: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.52, 0.56, 0.54, 0.62, 0.6, 0.66, 0.72, 0.76, 0.68, 0.73, 0.7, 0.78,
      0.71, 0.75,
    ],
    ml_prediction: [
      0.54, 0.58, 0.56, 0.64, 0.62, 0.68, 0.74, 0.78, 0.7, 0.75, 0.72, 0.8,
      0.73, 0.77,
    ],
    ipc_phase: [3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 4, 3, 3],
  },
  Garissa: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.48, 0.52, 0.5, 0.58, 0.55, 0.62, 0.68, 0.72, 0.65, 0.7, 0.67, 0.75,
      0.68, 0.72,
    ],
    ml_prediction: [
      0.5, 0.54, 0.52, 0.6, 0.57, 0.64, 0.7, 0.74, 0.67, 0.72, 0.69, 0.77, 0.7,
      0.74,
    ],
    ipc_phase: [3, 3, 3, 3, 3, 3, 3, 4, 3, 3, 3, 4, 3, 3],
  },
  Samburu: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.4, 0.45, 0.42, 0.5, 0.48, 0.55, 0.62, 0.66, 0.58, 0.63, 0.6, 0.68, 0.61,
      0.65,
    ],
    ml_prediction: [
      0.42, 0.47, 0.44, 0.52, 0.5, 0.57, 0.64, 0.68, 0.6, 0.65, 0.62, 0.7, 0.63,
      0.67,
    ],
    ipc_phase: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  },
  Baringo: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.15, 0.1, 0.2, 0.15, 0.25, 0.35, 0.5, 0.45, 0.38, 0.3, 0.35, 0.28, 0.32,
      0.25,
    ],
    ml_prediction: [
      0.17, 0.12, 0.22, 0.17, 0.27, 0.37, 0.52, 0.47, 0.4, 0.32, 0.37, 0.3,
      0.34, 0.27,
    ],
    ipc_phase: [1, 1, 2, 1, 2, 3, 3, 3, 3, 2, 3, 2, 2, 2],
  },
  Kajiado: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.12, 0.08, 0.15, 0.1, 0.18, 0.22, 0.4, 0.35, 0.3, 0.22, 0.28, 0.2, 0.25,
      0.18,
    ],
    ml_prediction: [
      0.14, 0.1, 0.17, 0.12, 0.2, 0.24, 0.42, 0.37, 0.32, 0.24, 0.3, 0.22, 0.27,
      0.2,
    ],
    ipc_phase: [1, 1, 1, 1, 2, 2, 3, 3, 2, 2, 2, 1, 2, 1],
  },
  Nairobi: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.05, 0.04, 0.06, 0.05, 0.07, 0.06, 0.1, 0.08, 0.07, 0.06, 0.08, 0.07,
      0.08, 0.07,
    ],
    ml_prediction: [
      0.06, 0.05, 0.07, 0.06, 0.08, 0.07, 0.11, 0.09, 0.08, 0.07, 0.09, 0.08,
      0.09, 0.08,
    ],
    ipc_phase: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  Nakuru: {
    labels: [
      "Jan 2019",
      "Jul 2019",
      "Jan 2020",
      "Jul 2020",
      "Jan 2021",
      "Jul 2021",
      "Jan 2022",
      "Jul 2022",
      "Jan 2023",
      "Jul 2023",
      "Jan 2024",
      "Jul 2024",
      "Jan 2025",
      "Jul 2025",
    ],
    crisis_rate: [
      0.08, 0.07, 0.09, 0.08, 0.1, 0.09, 0.14, 0.12, 0.11, 0.09, 0.12, 0.1,
      0.11, 0.09,
    ],
    ml_prediction: [
      0.09, 0.08, 0.1, 0.09, 0.11, 0.1, 0.15, 0.13, 0.12, 0.1, 0.13, 0.11, 0.12,
      0.1,
    ],
    ipc_phase: [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
  },
};

// Default for counties not in TREND_DATA
const DEFAULT_TREND = {
  labels: [
    "Jan 2019",
    "Jul 2019",
    "Jan 2020",
    "Jul 2020",
    "Jan 2021",
    "Jul 2021",
    "Jan 2022",
    "Jul 2022",
    "Jan 2023",
    "Jul 2023",
    "Jan 2024",
    "Jul 2024",
    "Jan 2025",
    "Jul 2025",
  ],
  crisis_rate: [
    0.2, 0.22, 0.18, 0.24, 0.26, 0.3, 0.38, 0.35, 0.28, 0.25, 0.28, 0.22, 0.25,
    0.2,
  ],
  ml_prediction: [
    0.22, 0.24, 0.2, 0.26, 0.28, 0.32, 0.4, 0.37, 0.3, 0.27, 0.3, 0.24, 0.27,
    0.22,
  ],
  ipc_phase: [2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2],
};

// Feature importance from your model (top_features.json order by importance)
const FEATURE_IMPORTANCE = [
  { name: "Vulnerability Score", value: 0.14 },
  { name: "Prev. Crisis (Lag 1)", value: 0.138 },
  { name: "Monthly Rainfall", value: 0.082 },
  { name: "Anomaly Lag 1m", value: 0.071 },
  { name: "Rainfall Lag 1m", value: 0.063 },
  { name: "Food Basket Cost", value: 0.058 },
  { name: "Rainfall Lag 3m", value: 0.051 },
  { name: "Price Change 1m", value: 0.044 },
  { name: "Is ASAL", value: 0.038 },
  { name: "Anomaly Lag 3m", value: 0.035 },
];

// IPC phase colors
const IPC_COLORS = {
  1: { bg: "rgba(16,185,129,0.20)", border: "#10b981", label: "Minimal" },
  2: { bg: "rgba(234,179,8,0.20)", border: "#eab308", label: "Stressed" },
  3: { bg: "rgba(249,115,22,0.20)", border: "#f97316", label: "Crisis" },
  4: { bg: "rgba(239,68,68,0.20)", border: "#ef4444", label: "Emergency" },
  5: { bg: "rgba(146,43,33,0.20)", border: "#922b21", label: "Famine" },
};

// ── Chart instances ───────────────────────────────────────────
let timeseriesChart = null;
let phasesChart = null;
let importanceChart = null;
let trendsInitialized = false;

// ── Public init — called from index.html tab switch ───────────
function initTrends() {
  if (trendsInitialized) return;
  trendsInitialized = true;

  const sel = document.getElementById("trend-county-select");
  if (sel) {
    sel.addEventListener("change", () => {
      const county = sel.value || "Turkana";
      updateTrends(county);
    });
    updateTrends(sel.value || "Turkana");
  }
}

// ── Also init on DOMContentLoaded if trends tab is active ─────
document.addEventListener("DOMContentLoaded", () => {
  const trendsTab = document.getElementById("tab-trends");
  if (trendsTab && trendsTab.classList.contains("active")) {
    initTrends();
  }
});

// ── Update all charts + stat cards ───────────────────────────
function updateTrends(county) {
  const data = TREND_DATA[county] || DEFAULT_TREND;
  updateStatCards(data, county);
  renderTimeseriesChart(data);
  renderPhasesChart(data);
  renderImportanceChart();
}

// ── Chart 1: Risk Score Over Time (timeseries) ────────────────
function renderTimeseriesChart(data) {
  const ctx = document.getElementById("chart-timeseries");
  if (!ctx) return;
  if (timeseriesChart) timeseriesChart.destroy();

  timeseriesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Actual IPC Crisis Rate",
          data: data.crisis_rate,
          borderColor: "#C80000",
          backgroundColor: "rgba(200,0,0,0.06)",
          borderWidth: 2,
          pointBackgroundColor: data.crisis_rate.map((v) =>
            v >= TREND_THRESHOLD ? "#C80000" : "#10b981",
          ),
          pointBorderColor: "transparent",
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.4,
        },
        {
          label: "ML Prediction",
          data: data.ml_prediction,
          borderColor: "#F5A623",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [4, 3],
          pointBackgroundColor: "#F5A623",
          pointBorderColor: "transparent",
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          tension: 0.4,
        },
        {
          label: "Threshold (0.45)",
          data: new Array(data.labels.length).fill(TREND_THRESHOLD),
          borderColor: "#FAE61E",
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(10,18,8,0.95)",
          borderColor: "rgba(245,166,35,0.25)",
          borderWidth: 1,
          titleFont: { size: 11 },
          bodyFont: { size: 11 },
          titleColor: "#7a9170",
          bodyColor: "#f0ede6",
          padding: 10,
          callbacks: {
            afterBody: (items) => {
              const idx = items[0].dataIndex;
              const phase = data.ipc_phase[idx];
              return [
                `IPC Phase ${phase}: ${IPC_COLORS[phase]?.label || "Unknown"}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#4a6a44", font: { size: 9 }, maxRotation: 45 },
          border: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
          min: 0,
          max: 1,
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "#4a6a44",
            font: { size: 10 },
            callback: (v) => (v * 100).toFixed(0) + "%",
          },
          border: { color: "rgba(255,255,255,0.06)" },
        },
      },
    },
  });
}

// ── Chart 2: IPC Phase Distribution (bar) ────────────────────
function renderPhasesChart(data) {
  const ctx = document.getElementById("chart-phases");
  if (!ctx) return;
  if (phasesChart) phasesChart.destroy();

  // Count how many periods in each phase
  const phaseCounts = [0, 0, 0, 0, 0]; // phases 1–5
  data.ipc_phase.forEach((p) => {
    if (p >= 1 && p <= 5) phaseCounts[p - 1]++;
  });

  phasesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Phase 1\nMinimal",
        "Phase 2\nStressed",
        "Phase 3\nCrisis",
        "Phase 4\nEmergency",
        "Phase 5\nFamine",
      ],
      datasets: [
        {
          label: "Periods",
          data: phaseCounts,
          backgroundColor: [
            "rgba(16,185,129,0.25)",
            "rgba(234,179,8,0.25)",
            "rgba(249,115,22,0.25)",
            "rgba(239,68,68,0.25)",
            "rgba(146,43,33,0.25)",
          ],
          borderColor: ["#10b981", "#eab308", "#f97316", "#ef4444", "#922b21"],
          borderWidth: 1.5,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(10,18,8,0.95)",
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1,
          titleColor: "#7a9170",
          bodyColor: "#f0ede6",
          padding: 10,
          callbacks: {
            label: (item) =>
              ` ${item.raw} assessment period${item.raw !== 1 ? "s" : ""}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "#4a6a44", font: { size: 9 } },
          border: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "#4a6a44",
            font: { size: 10 },
            stepSize: 1,
            callback: (v) => (Number.isInteger(v) ? v : ""),
          },
          border: { color: "rgba(255,255,255,0.06)" },
        },
      },
    },
  });
}

// ── Chart 3: Feature Importance (horizontal bar) ──────────────
function renderImportanceChart() {
  const ctx = document.getElementById("chart-importance");
  if (!ctx) return;
  if (importanceChart) importanceChart.destroy();

  importanceChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: FEATURE_IMPORTANCE.map((f) => f.name),
      datasets: [
        {
          label: "Importance",
          data: FEATURE_IMPORTANCE.map((f) => f.value),
          backgroundColor: FEATURE_IMPORTANCE.map((_, i) =>
            i === 0
              ? "rgba(245,166,35,0.35)"
              : i === 1
                ? "rgba(239,68,68,0.25)"
                : "rgba(122,145,112,0.20)",
          ),
          borderColor: FEATURE_IMPORTANCE.map((_, i) =>
            i === 0 ? "#F5A623" : i === 1 ? "#ef4444" : "#7a9170",
          ),
          borderWidth: 1.5,
          borderRadius: 3,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(10,18,8,0.95)",
          borderColor: "rgba(255,255,255,0.08)",
          borderWidth: 1,
          titleColor: "#7a9170",
          bodyColor: "#f0ede6",
          padding: 10,
          callbacks: {
            label: (item) => ` Importance: ${(item.raw * 100).toFixed(1)}%`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: "#4a6a44",
            font: { size: 9 },
            callback: (v) => (v * 100).toFixed(0) + "%",
          },
          border: { color: "rgba(255,255,255,0.06)" },
        },
        y: {
          grid: { display: false },
          ticks: { color: "#f0ede6", font: { size: 10 } },
          border: { color: "rgba(255,255,255,0.06)" },
        },
      },
    },
  });
}

// ── Update stat cards ─────────────────────────────────────────
function updateStatCards(data, county) {
  const rates = data.crisis_rate;
  const total = rates.length;
  const peak = Math.max(...rates);
  const avg = rates.reduce((a, b) => a + b, 0) / total;
  const crisisMonths = rates.filter((v) => v >= TREND_THRESHOLD).length;

  // 6-month trend: compare last 3 vs previous 3
  const recent = rates.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const prior = rates.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
  const trendUp = recent > prior + 0.02;
  const trendDn = recent < prior - 0.02;
  const trendText = trendUp
    ? "↑ Worsening"
    : trendDn
      ? "↓ Improving"
      : "→ Stable";
  const trendColor = trendUp ? "#ef4444" : trendDn ? "#10b981" : "#F5A623";

  // Update DOM — using correct IDs from index.html
  document.getElementById("trend-peak").textContent =
    (peak * 100).toFixed(0) + "%";
  document.getElementById("trend-avg").textContent =
    (avg * 100).toFixed(0) + "%";
  document.getElementById("trend-months").textContent =
    crisisMonths + " / " + total;

  const trendEl = document.getElementById("trend-trend");
  trendEl.textContent = trendText;
  trendEl.style.color = trendColor;
}
