"""
main.py — Kenya Food Insecurity Early Warning System
FastAPI backend serving the ML model and data endpoints
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
import fastapi.templating
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import joblib
import json
import numpy as np
import pandas as pd
from pathlib import Path

# ── App init ──────────────────────────────────────────────────
app = FastAPI(title="Kenya Food Insecurity Early Warning System")

# Static files & templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = fastapi.templating.Jinja2Templates(directory="templates")

# ── Load model artifacts ──────────────────────────────────────
BASE = Path(__file__).parent
model      = joblib.load(BASE / "models" / "rf_food_insecurity_model.pkl")
scaler     = joblib.load(BASE / "models" / "scaler.pkl")
with open(BASE / "models" / "top_features.json") as f:
    TOP_FEATURES = json.load(f)
with open(BASE / "models" / "model_metadata.json") as f:
    MODEL_META = json.load(f)

# ── The 28 features the scaler was fitted on (exact order matters) ──
SCALER_FEATURES = [
    'monthly_rainfall_mm', 'anomaly_lag1m', 'anomaly_lag2m', 'anomaly_lag3m',
    'rainfall_lag1m', 'rainfall_lag3m', 'is_drought', 'is_flood',
    'in_long_rains', 'in_short_rains', 'season', 'food_basket_cost',
    'maize_price_change_1m', 'beans_price_change_1m', 'maize_price_stress',
    'has_price_data', 'month', 'quarter', 'is_lean_season',
    'food_insecure_lag1', 'vulnerability_score', 'is_asal',
    'region_Coast', 'region_Eastern', 'region_Nairobi',
    'region_North Eastern', 'region_Nyanza', 'region_Rift Valley'
]

THRESHOLD = MODEL_META.get("threshold", 0.45)

# ── Vulnerability scores per county (from MPI 2022 DHS) ──────
VULNERABILITY_SCORES = {
    "Mombasa": 0.040, "Kwale": 0.195, "Kilifi": 0.174,
    "Tana River": 0.404, "Lamu": 0.123, "Taita Taveta": 0.059,
    "Garissa": 0.296, "Wajir": 0.409, "Mandera": 0.500,
    "Marsabit": 0.368, "Isiolo": 0.199, "Meru": 0.100,
    "Tharaka Nithi": 0.086, "Embu": 0.061, "Kitui": 0.123,
    "Machakos": 0.049, "Makueni": 0.071, "Nyandarua": 0.036,
    "Nyeri": 0.029, "Kirinyaga": 0.032, "Murang'a": 0.035,
    "Kiambu": 0.014, "Turkana": 0.558, "West Pokot": 0.361,
    "Samburu": 0.465, "Trans Nzoia": 0.065, "Uasin Gishu": 0.046,
    "Elgeyo Marakwet": 0.106, "Nandi": 0.086, "Baringo": 0.200,
    "Laikipia": 0.077, "Nakuru": 0.060, "Narok": 0.162,
    "Kajiado": 0.109, "Kericho": 0.090, "Bomet": 0.064,
    "Kakamega": 0.069, "Vihiga": 0.056, "Bungoma": 0.084,
    "Busia": 0.094, "Siaya": 0.073, "Kisumu": 0.047,
    "Homa Bay": 0.078, "Migori": 0.109, "Kisii": 0.090,
    "Nyamira": 0.077, "Nairobi": 0.007,
}

# ── ASAL counties ─────────────────────────────────────────────
ASAL_COUNTIES = {
    "Turkana", "Marsabit", "Mandera", "Wajir", "Garissa",
    "Isiolo", "Samburu", "Tana River", "Baringo", "Laikipia",
    "West Pokot", "Kajiado", "Narok", "Kitui", "Makueni",
    "Taita Taveta", "Kilifi", "Kwale", "Lamu", "Tharaka Nithi",
}

# ── Region mapping ────────────────────────────────────────────
COUNTY_REGION = {
    "Mombasa": "Coast", "Kwale": "Coast", "Kilifi": "Coast",
    "Tana River": "Coast", "Lamu": "Coast", "Taita Taveta": "Coast",
    "Garissa": "North Eastern", "Wajir": "North Eastern", "Mandera": "North Eastern",
    "Marsabit": "Eastern", "Isiolo": "Eastern", "Meru": "Eastern",
    "Tharaka Nithi": "Eastern", "Embu": "Eastern", "Kitui": "Eastern",
    "Machakos": "Eastern", "Makueni": "Eastern",
    "Nyandarua": "Central", "Nyeri": "Central", "Kirinyaga": "Central",
    "Murang'a": "Central", "Kiambu": "Central",
    "Turkana": "Rift Valley", "West Pokot": "Rift Valley", "Samburu": "Rift Valley",
    "Trans Nzoia": "Rift Valley", "Uasin Gishu": "Rift Valley",
    "Elgeyo Marakwet": "Rift Valley", "Nandi": "Rift Valley", "Baringo": "Rift Valley",
    "Laikipia": "Rift Valley", "Nakuru": "Rift Valley", "Narok": "Rift Valley",
    "Kajiado": "Rift Valley", "Kericho": "Rift Valley", "Bomet": "Rift Valley",
    "Kakamega": "Western", "Vihiga": "Western", "Bungoma": "Western", "Busia": "Western",
    "Siaya": "Nyanza", "Kisumu": "Nyanza", "Homa Bay": "Nyanza",
    "Migori": "Nyanza", "Kisii": "Nyanza", "Nyamira": "Nyanza",
    "Nairobi": "Nairobi",
}

# ── County price bands (KES/kg) — county specific ─────────────
PRICE_BANDS = {
    "Turkana":      {"Affordable": 55,  "Moderate": 98,  "Elevated": 140, "High": 183},
    "Garissa":      {"Affordable": 60,  "Moderate": 100, "Elevated": 140, "High": 179},
    "Marsabit":     {"Affordable": 12,  "Moderate": 51,  "Elevated": 91,  "High": 130},
    "Mandera":      {"Affordable": 10,  "Moderate": 67,  "Elevated": 124, "High": 181},
    "Isiolo":       {"Affordable": 75,  "Moderate": 120, "Elevated": 165, "High": 210},
    "Tana River":   {"Affordable": 79,  "Moderate": 123, "Elevated": 167, "High": 211},
    "Wajir":        {"Affordable": 69,  "Moderate": 110, "Elevated": 151, "High": 192},
    "Baringo":      {"Affordable": 44,  "Moderate": 84,  "Elevated": 124, "High": 164},
    "Samburu":      {"Affordable": 33,  "Moderate": 80,  "Elevated": 127, "High": 173},
    "Kajiado":      {"Affordable": 38,  "Moderate": 65,  "Elevated": 92,  "High": 119},
    "Kilifi":       {"Affordable": 45,  "Moderate": 74,  "Elevated": 104, "High": 134},
    "Mombasa":      {"Affordable": 34,  "Moderate": 60,  "Elevated": 86,  "High": 112},
    "Nairobi":      {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Kitui":        {"Affordable": 16,  "Moderate": 41,  "Elevated": 65,  "High": 90},
    "Makueni":      {"Affordable": 34,  "Moderate": 80,  "Elevated": 126, "High": 171},
    "Taita Taveta": {"Affordable": 28,  "Moderate": 80,  "Elevated": 132, "High": 185},
    "West Pokot":   {"Affordable": 55,  "Moderate": 98,  "Elevated": 140, "High": 183},
    "Lamu":         {"Affordable": 45,  "Moderate": 74,  "Elevated": 104, "High": 134},
    "Kwale":        {"Affordable": 45,  "Moderate": 74,  "Elevated": 104, "High": 134},
    "Tharaka Nithi":{"Affordable": 16,  "Moderate": 41,  "Elevated": 65,  "High": 90},
    "Embu":         {"Affordable": 16,  "Moderate": 41,  "Elevated": 65,  "High": 90},
    "Machakos":     {"Affordable": 16,  "Moderate": 41,  "Elevated": 65,  "High": 90},
    "Meru":         {"Affordable": 34,  "Moderate": 60,  "Elevated": 86,  "High": 112},
    "Narok":        {"Affordable": 44,  "Moderate": 84,  "Elevated": 124, "High": 164},
    "Laikipia":     {"Affordable": 44,  "Moderate": 84,  "Elevated": 124, "High": 164},
    "Nakuru":       {"Affordable": 44,  "Moderate": 84,  "Elevated": 124, "High": 164},
    "Elgeyo Marakwet":{"Affordable": 44,"Moderate": 84,  "Elevated": 124, "High": 164},
    "Uasin Gishu":  {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Trans Nzoia":  {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Nandi":        {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Kericho":      {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Bomet":        {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Kakamega":     {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Vihiga":       {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Bungoma":      {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Busia":        {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Siaya":        {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Kisumu":       {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Homa Bay":     {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Migori":       {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Kisii":        {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Nyamira":      {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Nyandarua":    {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Nyeri":        {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Kirinyaga":    {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Murang'a":     {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
    "Kiambu":       {"Affordable": 29,  "Moderate": 55,  "Elevated": 81,  "High": 107},
}

LIMITED_PRICE_DATA = {"Makueni", "Taita Taveta", "Lamu"}

# ── County coordinate centroids (all 47) ─────────────────────
COUNTY_COORDS = {
    "Mombasa": [-4.05, 39.67], "Kwale": [-4.18, 39.45],
    "Kilifi": [-3.63, 39.85], "Tana River": [-1.54, 39.68],
    "Lamu": [-2.27, 40.90], "Taita Taveta": [-3.40, 38.37],
    "Garissa": [0.46, 39.65], "Wajir": [1.75, 40.06],
    "Mandera": [3.94, 41.86], "Marsabit": [2.34, 37.99],
    "Isiolo": [0.35, 37.58], "Meru": [0.05, 37.65],
    "Tharaka Nithi": [-0.30, 37.92], "Embu": [-0.53, 37.45],
    "Kitui": [-1.37, 38.01], "Machakos": [-1.52, 37.27],
    "Makueni": [-2.25, 37.62], "Nyandarua": [-0.18, 36.52],
    "Nyeri": [-0.42, 36.95], "Kirinyaga": [-0.66, 37.28],
    "Murang'a": [-0.72, 37.05], "Kiambu": [-1.03, 36.83],
    "Turkana": [3.81, 35.96], "West Pokot": [1.62, 35.12],
    "Samburu": [1.22, 36.91], "Trans Nzoia": [1.10, 35.00],
    "Uasin Gishu": [0.55, 35.30], "Elgeyo Marakwet": [0.60, 35.51],
    "Nandi": [0.18, 35.14], "Baringo": [0.47, 36.08],
    "Laikipia": [0.36, 36.78], "Nakuru": [-0.30, 36.07],
    "Narok": [-1.08, 35.87], "Kajiado": [-2.10, 36.78],
    "Kericho": [-0.37, 35.29], "Bomet": [-0.79, 35.34],
    "Kakamega": [0.28, 34.75], "Vihiga": [0.07, 34.72],
    "Bungoma": [0.56, 34.56], "Busia": [0.46, 34.11],
    "Siaya": [-0.06, 34.29], "Kisumu": [-0.09, 34.76],
    "Homa Bay": [-0.52, 34.46], "Migori": [-1.06, 34.47],
    "Kisii": [-0.68, 34.77], "Nyamira": [-0.56, 34.94],
    "Nairobi": [-1.29, 36.82],
}

# ── Helpers ───────────────────────────────────────────────────
def get_region_dummies(county: str) -> dict:
    region = COUNTY_REGION.get(county, "Other")
    return {
        "region_Coast":         1 if region == "Coast" else 0,
        "region_Eastern":       1 if region == "Eastern" else 0,
        "region_Nairobi":       1 if region == "Nairobi" else 0,
        "region_North Eastern": 1 if region == "North Eastern" else 0,
        "region_Nyanza":        1 if region == "Nyanza" else 0,
        "region_Rift Valley":   1 if region == "Rift Valley" else 0,
    }

def get_quarter(month: int) -> int:
    return (month - 1) // 3 + 1

def price_label_to_value(label: str, county: str) -> float:
    bands = PRICE_BANDS.get(county, PRICE_BANDS["Nairobi"])
    midpoints = {
        "Affordable": bands["Affordable"] * 0.75,
        "Moderate":   (bands["Affordable"] + bands["Moderate"]) / 2,
        "Elevated":   (bands["Moderate"] + bands["Elevated"]) / 2,
        "High":       bands["Elevated"] * 1.2,
    }
    return midpoints.get(label, midpoints["Moderate"])

def rainfall_label_to_values(label: str, county: str) -> dict:
    region = COUNTY_REGION.get(county, "Other")
    base_rain = {
        "North Eastern": 25, "Eastern": 50, "Coast": 65,
        "Rift Valley": 60, "Central": 80, "Western": 90,
        "Nyanza": 85, "Nairobi": 75, "Other": 55,
    }.get(region, 55)
    multipliers = {
        "Much Below Normal": 0.30, "Below Normal": 0.65,
        "Normal": 1.00, "Above Normal": 1.40, "Much Above Normal": 1.90,
    }
    anomaly_pct = {
        "Much Below Normal": -70, "Below Normal": -35,
        "Normal": 0, "Above Normal": 40, "Much Above Normal": 90,
    }
    mult = multipliers.get(label, 1.0)
    return {
        "mm": round(base_rain * mult, 1),
        "anomaly_pct": anomaly_pct.get(label, 0),
    }

def get_season_encoded(month: int) -> int:
    """Encode season as integer: dry_season=0, long_rains=1, short_rains=2"""
    if month in [3, 4, 5]:
        return 1  # long_rains
    elif month in [10, 11, 12]:
        return 2  # short_rains
    return 0      # dry_season

def risk_level(prob: float) -> str:
    if prob >= 0.75: return "Severe Risk"
    if prob >= 0.60: return "High Risk"
    if prob >= 0.45: return "Moderate Risk"
    if prob >= 0.35: return "Elevated Risk"
    return "Low Risk"

def ipc_label(prob: float, is_insecure: bool) -> str:
    if prob >= 0.75: return "⚠ Famine Risk Detected"
    if prob >= 0.60: return "⚠ Emergency — Intervention Needed"
    if prob >= 0.45: return "⚠ Crisis — Food Insecure"
    if prob >= 0.35: return "⚡ Stressed — Monitor Closely"
    return "✓ Minimal Risk — Food Secure"

def get_key_factors(features_dict: dict, prob: float) -> list:
    factors = []
    if features_dict.get("food_insecure_lag1", 0) == 1:
        factors.append({"feature": "Previous Crisis", "value": "Yes", "direction": "up"})
    else:
        factors.append({"feature": "Previous Crisis", "value": "No", "direction": "down"})
    vuln = features_dict.get("vulnerability_score", 0)
    factors.append({
        "feature": "Vulnerability Score",
        "value": f"{vuln:.3f}",
        "direction": "up" if vuln > 0.25 else "down"
    })
    anomaly = features_dict.get("anomaly_lag1m", 0)
    factors.append({
        "feature": "Rainfall Anomaly",
        "value": f"{anomaly:+.0f}%",
        "direction": "up" if anomaly < -20 else "down" if anomaly > 20 else "neutral"
    })
    basket = features_dict.get("food_basket_cost", 0)
    factors.append({
        "feature": "Food Basket Cost",
        "value": f"KES {basket:.0f}/kg",
        "direction": "up" if features_dict.get("maize_price_stress", 0) == 1 else "neutral"
    })
    if features_dict.get("is_asal", 0) == 1:
        factors.append({"feature": "ASAL County", "value": "Yes", "direction": "up"})
    return factors[:5]


def scale_and_predict(features: dict) -> float:
    """
    Scale using all 28 scaler features, subset to top 21, then predict.
    This matches exactly how the model was trained in the notebook.
    """
    # Build full 28-feature vector (in scaler order)
    X_full = np.array([[features.get(f, 0) for f in SCALER_FEATURES]])
    # Scale with the original 28-feature scaler
    X_scaled = scaler.transform(X_full)
    # Convert to DataFrame so we can subset by column name
    X_scaled_df = pd.DataFrame(X_scaled, columns=SCALER_FEATURES)
    # Subset to the top 21 features the model was trained on
    X_model = X_scaled_df[TOP_FEATURES].values
    return float(model.predict_proba(X_model)[0][1])


# ── Pydantic model for prediction request ─────────────────────
class PredictRequest(BaseModel):
    county: str
    previous_crisis: str          # "Yes" or "No"
    rainfall_last_month: str      # "Much Below Normal" … "Much Above Normal"
    rainfall_3months_ago: str
    food_basket_level: str        # "Affordable" / "Moderate" / "Elevated" / "High"
    month: int = 6                # 1–12

# ── Routes ────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/county-risks")
async def county_risks():
    results = {}
    for county, coords in COUNTY_COORDS.items():
        vuln = VULNERABILITY_SCORES.get(county, 0.1)
        is_asal = 1 if county in ASAL_COUNTIES else 0
        region_dummies = get_region_dummies(county)
        month = 7

        features = {
            "monthly_rainfall_mm":   40 if is_asal else 70,
            "anomaly_lag1m":         -15 if is_asal else 5,
            "anomaly_lag2m":         -10 if is_asal else 4,
            "anomaly_lag3m":         -12 if is_asal else 3,
            "rainfall_lag1m":        38 if is_asal else 68,
            "rainfall_lag3m":        35 if is_asal else 65,
            "is_drought":            1 if is_asal else 0,
            "is_flood":              0,
            "in_long_rains":         0,
            "in_short_rains":        0,
            "season":                get_season_encoded(month),
            "food_basket_cost":      110 if is_asal else 65,
            "maize_price_change_1m": 3 if is_asal else 1,
            "beans_price_change_1m": 2,
            "maize_price_stress":    1 if is_asal else 0,
            "has_price_data":        1,
            "month":                 month,
            "quarter":               3,
            "is_lean_season":        0,
            "food_insecure_lag1":    1 if vuln > 0.25 else 0,
            "vulnerability_score":   vuln,
            "is_asal":               is_asal,
            **region_dummies,
        }

        prob = scale_and_predict(features)

        results[county] = {
            "risk_score":   round(prob, 3),
            "crisis_rate":  round(vuln, 3),
            "lat":          coords[0],
            "lng":          coords[1],
            "is_asal":      bool(is_asal),
            "region":       COUNTY_REGION.get(county, "Other"),
        }

    insecure = sum(1 for v in results.values() if v["risk_score"] >= THRESHOLD)

    return {
        "counties": results,
        "metadata": {
            "recall":    MODEL_META.get("recall"),
            "roc_auc":   MODEL_META.get("roc_auc"),
            "threshold": THRESHOLD,
            "total":     len(results),
            "insecure":  insecure,
            "secure":    len(results) - insecure,
        }
    }

@app.get("/api/county-defaults/{county}")
async def county_defaults(county: str):
    vuln = VULNERABILITY_SCORES.get(county, 0.1)
    is_asal = county in ASAL_COUNTIES
    bands = PRICE_BANDS.get(county, PRICE_BANDS["Nairobi"])
    has_limited = county in LIMITED_PRICE_DATA
    return {
        "county": county,
        "vulnerability_score": round(vuln, 3),
        "poverty_level": (
            "High" if vuln > 0.30 else
            "Medium" if vuln > 0.15 else "Low"
        ),
        "is_asal": is_asal,
        "price_bands": bands,
        "limited_price_data": has_limited,
        "defaults": {
            "previous_crisis": "Yes" if vuln > 0.25 else "No",
            "rainfall_last_month": "Below Normal" if is_asal else "Normal",
            "rainfall_3months_ago": "Below Normal" if is_asal else "Normal",
            "food_basket_level": "Elevated" if is_asal else "Moderate",
            "month": 7,
        }
    }

@app.post("/api/predict")
async def predict(req: PredictRequest):
    county = req.county
    if county not in VULNERABILITY_SCORES:
        raise HTTPException(status_code=404, detail=f"County '{county}' not found")

    vuln = VULNERABILITY_SCORES[county]
    is_asal = 1 if county in ASAL_COUNTIES else 0
    region_dummies = get_region_dummies(county)

    food_insecure_lag1 = 1 if req.previous_crisis == "Yes" else 0

    rain1 = rainfall_label_to_values(req.rainfall_last_month, county)
    rain3 = rainfall_label_to_values(req.rainfall_3months_ago, county)

    basket_cost = price_label_to_value(req.food_basket_level, county)
    maize_price_stress = 1 if req.food_basket_level in ("Elevated", "High") else 0
    maize_price_change = 5 if req.food_basket_level == "High" else 2 if req.food_basket_level == "Elevated" else 0

    month = req.month
    quarter = get_quarter(month)
    season = get_season_encoded(month)
    is_lean_season = 1 if month in [1, 2, 3, 7, 8, 9] else 0
    in_long_rains = 1 if month in [3, 4, 5] else 0
    in_short_rains = 1 if month in [10, 11, 12] else 0
    anomaly_avg = (rain1["anomaly_pct"] + rain3["anomaly_pct"]) / 2

    features = {
        "monthly_rainfall_mm":   rain1["mm"],
        "anomaly_lag1m":         rain1["anomaly_pct"],
        "anomaly_lag2m":         anomaly_avg,
        "anomaly_lag3m":         rain3["anomaly_pct"],
        "rainfall_lag1m":        rain1["mm"],
        "rainfall_lag3m":        rain3["mm"],
        "is_drought":            1 if rain1["anomaly_pct"] < -30 else 0,
        "is_flood":              0,
        "in_long_rains":         in_long_rains,
        "in_short_rains":        in_short_rains,
        "season":                season,
        "food_basket_cost":      basket_cost,
        "maize_price_change_1m": maize_price_change,
        "beans_price_change_1m": maize_price_change * 0.6,
        "maize_price_stress":    maize_price_stress,
        "has_price_data":        1,
        "month":                 month,
        "quarter":               quarter,
        "is_lean_season":        is_lean_season,
        "food_insecure_lag1":    food_insecure_lag1,
        "vulnerability_score":   vuln,
        "is_asal":               is_asal,
        **region_dummies,
    }

    prob = scale_and_predict(features)
    is_insecure = prob >= THRESHOLD

    bands = PRICE_BANDS.get(county, PRICE_BANDS["Nairobi"])
    limited = county in LIMITED_PRICE_DATA

    return {
        "county":      county,
        "probability": round(prob, 4),
        "label":       ipc_label(prob, is_insecure),
        "risk_level":  risk_level(prob),
        "is_insecure": is_insecure,
        "threshold":   THRESHOLD,
        "model_used":  "Random Forest (Tuned, Simplified)",
        "factors":     get_key_factors(features, prob),
        "county_info": {
            "vulnerability_score": round(vuln, 3),
            "poverty_level": "High" if vuln > 0.30 else "Medium" if vuln > 0.15 else "Low",
            "is_asal": bool(is_asal),
            "region": COUNTY_REGION.get(county, "Other"),
            "price_bands": bands,
            "limited_price_data": limited,
        },
        "disclaimer": (
            "⚠ Limited historical IPC data for this county — prediction is indicative only."
            if county not in [
                "Turkana", "Marsabit", "Mandera", "Wajir", "Garissa", "Samburu",
                "Isiolo", "Tana River", "Baringo", "Laikipia", "Kajiado", "Kilifi",
                "Kitui", "Makueni", "Nairobi", "Mombasa", "Nakuru", "Narok",
                "West Pokot", "Elgeyo Marakwet", "Taita Taveta", "Kwale", "Kisumu",
            ] else None
        ),
    }

@app.get("/api/price-bands/{county}")
async def price_bands(county: str):
    bands = PRICE_BANDS.get(county, PRICE_BANDS["Nairobi"])
    limited = county in LIMITED_PRICE_DATA
    return {
        "county": county,
        "bands": bands,
        "limited_data": limited,
        "note": "Based on limited market observations — use with caution." if limited else None,
    }

# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=False)