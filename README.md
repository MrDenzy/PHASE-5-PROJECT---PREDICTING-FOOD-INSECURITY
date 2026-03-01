# 📊 Predicting County-Level Acute Food Insecurity in Kenya  
### A Climate–Market–Conflict Early Warning Model

---

## 🌍 Project Overview

This project develops a **county-level early warning system** to predict acute food insecurity (IPC Phase 3 or worse) in Kenya one month ahead.

Current food security assessments under the :contentReference[oaicite:0]{index=0} (IPC) primarily describe past conditions. This limits proactive humanitarian action.

By integrating:

- Climate indicators  
- Market prices  
- Conflict data  

this project builds a predictive model that supports forward-looking humanitarian decision-making.

The analytical framework aligns with institutions such as:

- World Food Programme(WFP)  
- Food and Agriculture Organization(FAO)  
- Famine Early Warning Systems Network(FEWS NET)

---

## 🎯 Objectives

### Primary Objective
Build a county-level model that estimates the probability of entering **IPC Phase 3+** one month ahead.

### Secondary Objectives
- Construct a harmonized county–month panel dataset
- Identify the most important drivers of acute food insecurity
- Compare:
  - Logistic Regression
  - Random Forest
  - XGBoost
- Develop a prototype dashboard for risk visualization

---

## 🧠 Problem Statement

Food insecurity monitoring in Kenya is largely descriptive and retrospective. There is no simple, integrated predictive system combining:

- Rainfall variability  
- Vegetation health  
- Food prices  
- Conflict instability  

As a result:

- Humanitarian response is reactive  
- Resources are allocated after crisis onset  
- Early warning signals are not fully utilized  

This project addresses that gap with a **short-term classification model for IPC Phase 3+ risk.**

---

## 📦 Data Sources

All datasets were harmonized into a **county–month panel (2015–2025).**

### 1️⃣ IPC Classifications (Target Variable)

Source: https://www.ipcinfo.org/

- Original quarterly IPC phases expanded to monthly frequency  
- Binary Target:
  - `1` = IPC Phase ≥ 3 (Crisis or worse)  
  - `0` = IPC Phase ≤ 2  

---

### 2️⃣ Environmental Indicators (Climate & Vegetation)

Source: https://dataviz.vam.wfp.org/

**Rainfall Indicators**
- `r1q`: 1-month rainfall anomaly ratio  
- `r3q`: 3-month rainfall anomaly  
- `r1h`, `r3h`: rainfall totals  

**Vegetation Indicators**
- `vim`: NDVI (absolute greenness)  
- `viq`: Vegetation Index Quotient  

---

### 3️⃣ Food Prices (Market Access)

Source: https://price.vam.wfp.org/

- Monthly maize retail price per kg  
- Lag features  
- Percent change  

Maize is used as a proxy for household food access.

---

### 4️⃣ Conflict Events (Instability)

Source: https://acleddata.com/

- Monthly county-level:
  - Event counts  
  - Fatalities  

Captures market disruption and livelihood shocks.

---

## 🧹 Data Engineering Pipeline

### ✔ Temporal Alignment
- Standardized to `YYYY-MM`
- County-level harmonization
- Forward-filled IPC values

### ✔ Feature Engineering
Lag features created to capture delayed shock effects:

- IPC (1–2 month lags)
- Rainfall (1–3 month lags)
- Vegetation (1–3 month lags)
- Conflict (1–2 month lags)
- Prices (1–2 month lags + pct change)

### ✔ Missing Data Strategy
- Conflict → filled with 0  
- Climate → interpolated by county  
- Prices → imputed using monthly national averages  
- Dropped rows missing longest lags  

**Final Dataset Size:** 6,186 observations  
**Time Period:** 2015–2025  

---

## 📊 Exploratory Data Analysis

### Key Findings

#### 1️⃣ Food Insecurity Is Persistent
- `in_Phase3+_lag_1` correlation ≈ 0.92  
- Crisis conditions are “sticky”

#### 2️⃣ Vegetation Is the Strongest External Driver
- `vim_lag_3` ≈ -0.47 correlation  
- 3-month lag more predictive than current vegetation  
- Suggests a **~90-day warning window**

#### 3️⃣ Market Prices Matter
- Positive correlation (~0.32)  
- Rising maize prices increase crisis probability  
- Economic pressure finalizes crisis transitions

#### 4️⃣ Conflict Is Secondary
- Fatalities more predictive than event counts  
- Lower importance than vegetation or prices

#### 5️⃣ ASAL Context Matters
Arid and Semi-Arid Lands (ASAL) counties have structurally different baselines.

An `is_ASAL` flag was created and became one of the strongest predictors.

---

## ⚙️ Modeling

### Class Imbalance
- 86% = Non-Phase 3+  
- 14% = Phase 3+  

Handled using:
- `class_weight='balanced'`
- `scale_pos_weight` for XGBoost
- Temporal train-test split (last 12 months as test set)

---

## 🏆 Model Comparison

| Model | Precision (1) | Recall (1) | F1 | ROC-AUC | PR-AUC |
|-------|---------------|------------|-----|----------|--------|
| Logistic Regression | 0.24 | 0.90 | 0.37 | 0.88 | 0.26 |
| XGBoost | 0.30 | 1.00 | 0.46 | 0.94 | 0.37 |
| **Random Forest (Champion)** | **0.34** | **1.00** | **0.51** | **0.94** | **0.35** |

---

## 🥇 Champion Model: Tuned Balanced Random Forest

The Tuned Random Forest model was selected for deployment.

### Why?

- ✔ Recall = 1.00 (Zero missed crises)  
- ✔ Best Precision among high-recall models  
- ✔ Strong PR-AUC  
- ✔ Robust to nonlinear relationships

### it offers:

- Strong crisis detection capability
- Reduced false alarms compared to baseline
- Controlled overfitting
- Time-aware validation robustness
- Stable real-world deployment behavior

---

## 🔍 Feature Importance Insights

### 1️⃣ Regional Context (`is_ASAL`)
Most important feature  
Defines baseline vulnerability structure

### 2️⃣ 3-Month Vegetation Lag (`vim_lag_3`)
Confirms biological response delay  
Strong early warning signal

### 3️⃣ Market Prices (`maize_price_per_kg`)
Economic constraint often determines transition to crisis

---

## 📌 Key Conclusions

- Food insecurity is **persistent**
- Vegetation health provides a **3-month early warning window**
- Market prices are more decisive than short-term rainfall shocks
- Geographic baseline vulnerability must be modeled explicitly

---

## 🚀 Policy & Operational Recommendations

### A. Early Action Trigger
Monitor `vim_lag_3` as an early-warning threshold.  

Deploy:
- Livestock insurance payouts  
- Feed distribution  
- Strategic grain reserves  

### B. Market-Based Response
When prices spike:
- Implement cash transfers  
- Temporary price stabilization  
- Targeted subsidies  

### C. Conflict Monitoring
Maintain conflict variables in model.  

Future work:
- Explore price–conflict interaction effects  

---

## 📁 Repository Structure

```
├── Presentation/
│   ├── Hugging Face Deployment.txt
│   ├── presentation.pptx
├── data/
│   ├── cleaned_ipc_final.csv
│   ├── cleaned_dataset.csv
│   ├── cleaned_rain.csv
│   ├── cleaned_ndvi.csv
│   ├── cleaned_conflicts.csv
│   ├── cleaned_food_prices.csv
│   ├── ipc_ken_area_long.csv
│   ├── ken_rainfall_subnat_full.csv
│   ├── ken_mpi.csv
│   ├── kenya_political_violence_events_and_fatalities.csv
│   ├── wfp_food_prices_ken.csv
├── notebooks/
│   ├── main.ipynb
│   ├── blex.ipynb
│   ├── dennis.ipynb
│   ├── model.pkl
│
├── README.md
```

## 👤 Authors: Blex Olonde, Dennis Muriungi, Shem Omondi, Jasho Kiplangat, Valary Kones

---

Humanitarian Data Science Project  
Early Warning Modeling for Kenya  

---

## ⭐ Final Takeaway

By combining:

- Climate stress  
- Vegetation signals  
- Market access  
- Regional vulnerability  

this project transforms food security monitoring from **reactive reporting** to **predictive early warning**, enabling smarter, faster, and more targeted humanitarian response.
