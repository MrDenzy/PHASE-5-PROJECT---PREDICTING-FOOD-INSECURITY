import streamlit as st
import pandas as pd
import joblib

st.set_page_config(page_title="Crisis Early Warning System")

@st.cache_resource
def load_model():
    return joblib.load("model_pipeline.pkl")

model = load_model()

st.title("Kenya Food Insecurity Early Warning System")

# ---- INPUTS ----
rain_lag1 = st.number_input("Rainfall (Lag 1)", value=50.0)
usdprice = st.number_input("Food Price (USD)", value=30.0)
mpi = st.number_input("MPI", value=0.2)
headcount = st.number_input("Headcount Ratio", value=40.0)
intensity = st.number_input("Intensity of Deprivation", value=45.0)
vulnerable = st.number_input("Vulnerable to Poverty", value=25.0)
severe = st.number_input("In Severe Poverty", value=15.0)

# If County exists in training data:
county = st.text_input("County", value="Baringo")

input_df = pd.DataFrame([{
    "rain_lag1": rain_lag1,
    "usdprice": usdprice,
    "MPI": mpi,
    "Headcount Ratio": headcount,
    "Intensity of Deprivation": intensity,
    "Vulnerable to Poverty": vulnerable,
    "In Severe Poverty": severe,
    "County": county
}])

# ---- PREDICT ----
if st.button("Predict Crisis Risk"):
    prob = model.predict_proba(input_df)[0][1]
    pred = model.predict(input_df)[0]

    if pred == 1:
        st.error(f"⚠ Crisis Likely (Probability: {prob:.2f})")
    else:
        st.success(f"✓ No Crisis Likely (Probability: {prob:.2f})")