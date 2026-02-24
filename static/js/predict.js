/* ═══════════════════════════════════════════════════════════════
   predict.js — Tab 2 Prediction Panel
   Simplified dropdown inputs → main.py /api/predict
   ═══════════════════════════════════════════════════════════════ */

const PRED_THRESHOLD = 0.45;

// ── On county select → load county info strip ─────────────────
document
  .getElementById("predict-county")
  .addEventListener("change", async () => {
    const county = document.getElementById("predict-county").value;
    const strip = document.getElementById("county-info-strip");
    const priceNote = document.getElementById("price-band-note");

    if (!county) {
      strip.classList.remove("visible");
      priceNote.textContent = "";
      return;
    }

    try {
      const res = await fetch(
        `/api/county-defaults/${encodeURIComponent(county)}`,
      );
      const data = await res.json();

      // Show county info strip
      const povertyEl = document.getElementById("cis-poverty");
      povertyEl.textContent = data.poverty_level + " Poverty";
      povertyEl.className = "cis-badge " + data.poverty_level.toLowerCase();

      document.getElementById("cis-vuln").textContent =
        data.vulnerability_score.toFixed(3);

      const asalWrap = document.getElementById("cis-asal-wrap");
      asalWrap.style.display = data.is_asal ? "inline" : "none";

      strip.classList.add("visible");

      // Show county-specific price band hint
      const bands = data.price_bands;
      const note = data.limited_price_data
        ? `⚠ Limited price data — estimates based on nearby markets. Affordable < KES ${bands.Affordable}, High > KES ${bands.Elevated}`
        : `For ${county}: Affordable < KES ${bands.Affordable}/kg · Moderate KES ${bands.Affordable}–${bands.Moderate} · Elevated KES ${bands.Moderate}–${bands.Elevated} · High > KES ${bands.Elevated}`;
      priceNote.textContent = note;
    } catch (e) {
      strip.classList.remove("visible");
      priceNote.textContent = "";
    }
  });

// ── Auto-fill defaults for selected county ────────────────────
document.getElementById("btn-autofill").addEventListener("click", async () => {
  const county = document.getElementById("predict-county").value;
  if (!county) {
    flashError("Please select a county first");
    return;
  }

  const btn = document.getElementById("btn-autofill");
  btn.textContent = "⏳ Loading…";
  btn.disabled = true;

  try {
    const res = await fetch(
      `/api/county-defaults/${encodeURIComponent(county)}`,
    );
    const data = await res.json();
    const d = data.defaults;

    setDropdown("f-previous_crisis", d.previous_crisis);
    setDropdown("f-rainfall_last_month", d.rainfall_last_month);
    setDropdown("f-rainfall_3months_ago", d.rainfall_3months_ago);
    setDropdown("f-food_basket_level", d.food_basket_level);
    setDropdown("f-month", String(d.month));

    btn.textContent = "✅ Filled!";
    setTimeout(() => {
      btn.textContent = "⚡ Auto-fill defaults";
      btn.disabled = false;
    }, 1500);
  } catch (e) {
    btn.textContent = "⚡ Auto-fill defaults";
    btn.disabled = false;
    flashError("Could not load defaults");
  }
});

// ── Helper: set a select dropdown value + flash highlight ─────
function setDropdown(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = value;
  el.style.borderColor = "var(--accent)";
  setTimeout(() => {
    el.style.borderColor = "";
  }, 800);
}

// ── Run prediction ────────────────────────────────────────────
document.getElementById("btn-predict").addEventListener("click", runPrediction);

async function runPrediction() {
  const county = document.getElementById("predict-county").value;
  if (!county) {
    flashError("Please select a county first");
    return;
  }

  // Show loading
  document.getElementById("result-empty").style.display = "none";
  document.getElementById("result-card").style.display = "none";
  document.getElementById("result-loading").style.display = "flex";

  const payload = {
    county,
    previous_crisis: document.getElementById("f-previous_crisis").value,
    rainfall_last_month: document.getElementById("f-rainfall_last_month").value,
    rainfall_3months_ago: document.getElementById("f-rainfall_3months_ago")
      .value,
    food_basket_level: document.getElementById("f-food_basket_level").value,
    month: parseInt(document.getElementById("f-month").value) || 7,
  };

  try {
    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    document.getElementById("result-loading").style.display = "none";

    if (data.error || data.detail) {
      flashError(data.error || data.detail);
      document.getElementById("result-empty").style.display = "flex";
      return;
    }

    renderResult(data);
  } catch (e) {
    document.getElementById("result-loading").style.display = "none";
    document.getElementById("result-empty").style.display = "flex";
    flashError("Prediction failed — is the server running?");
  }
}

// ── Render result ─────────────────────────────────────────────
function renderResult(data) {
  const prob = data.probability;
  const isInsecure = prob >= PRED_THRESHOLD;
  const color = riskColorPred(prob);

  // Show card
  document.getElementById("result-card").style.display = "flex";

  // County name
  document.getElementById("res-county").textContent = data.county;

  // Gauge arc animation
  const arc = document.getElementById("gauge-arc");
  const arcLength = 251.2;
  arc.style.stroke = color;
  arc.style.strokeDashoffset = arcLength - prob * arcLength;

  // Threshold tick position on arc
  const threshAngle = Math.PI - PRED_THRESHOLD * Math.PI;
  const tx = 100 + 80 * Math.cos(threshAngle);
  const ty = 100 - 80 * Math.sin(threshAngle);
  const tick = document.getElementById("gauge-threshold");
  tick.setAttribute("x1", tx);
  tick.setAttribute("y1", ty - 8);
  tick.setAttribute("x2", tx);
  tick.setAttribute("y2", ty + 8);

  // Score text
  document.getElementById("gauge-score").textContent = prob.toFixed(3);
  document.getElementById("gauge-score").setAttribute("fill", color);

  // Verdict
  const verdict = document.getElementById("res-verdict");
  verdict.textContent = data.label;
  verdict.className = `result-verdict ${isInsecure ? "insecure" : "secure"}`;

  // Risk level badge
  const level = document.getElementById("res-level");
  level.textContent = data.risk_level;
  level.style.color = color;

  // Disclaimer
  const disclaimer = document.getElementById("res-disclaimer");
  if (data.disclaimer) {
    disclaimer.textContent = data.disclaimer;
    disclaimer.style.display = "block";
  } else {
    disclaimer.style.display = "none";
  }

  // County info below verdict
  if (data.county_info) {
    const ci = data.county_info;
    document.getElementById("res-model-info").textContent =
      `Poverty: ${ci.poverty_level} · ${ci.is_asal ? "ASAL · " : ""}Region: ${ci.region} · Threshold: ${data.threshold}`;
  }

  // Key driving factors
  const factorsList = document.getElementById("factors-list");
  factorsList.innerHTML = "";
  (data.factors || []).forEach((f) => {
    const icon =
      f.direction === "up" ? "↑" : f.direction === "down" ? "↓" : "—";
    const fColor =
      f.direction === "up"
        ? "var(--risk-critical)"
        : f.direction === "down"
          ? "var(--risk-secure)"
          : "var(--text-muted)";
    factorsList.innerHTML += `
      <div class="factor-row">
        <span class="factor-icon" style="color:${fColor}">${icon}</span>
        <span class="factor-name">${f.feature}</span>
        <span class="factor-val">${f.value}</span>
      </div>
    `;
  });
}

// ── Helpers ───────────────────────────────────────────────────
function riskColorPred(score) {
  if (score >= 0.75) return "#ef4444";
  if (score >= 0.6) return "#f97316";
  if (score >= 0.45) return "#eab308";
  if (score >= 0.35) return "#84cc16";
  return "#10b981";
}

function flashError(msg) {
  const btn = document.getElementById("btn-predict");
  const textEl = btn.querySelector(".predict-btn-text");
  const origText = textEl.textContent;
  textEl.textContent = msg;
  btn.style.borderColor = "var(--risk-critical)";
  setTimeout(() => {
    textEl.textContent = origText;
    btn.style.borderColor = "";
  }, 2500);
}
