import streamlit as st
import pandas as pd
import joblib

# Load trained model
model = joblib.load("rf_model.pkl")

st.title("Kenya Food Insecurity Early Warning System")

st.markdown("Predict probability of IPC Phase 3+ Crisis")

# -------------------------
# User Inputs
# -------------------------

rain_lag1 = st.number_input("Rainfall (Lag 1)", value=50.0)
usdprice = st.number_input("Food Price (USD)", value=30.0)
mpi = st.number_input("MPI", value=0.2)
headcount = st.number_input("Headcount Ratio", value=40.0)
intensity = st.number_input("Intensity of Deprivation", value=45.0)
vulnerable = st.number_input("Vulnerable to Poverty", value=25.0)
severe = st.number_input("In Severe Poverty", value=15.0)

# Create dataframe for prediction
input_data = pd.DataFrame([[
    rain_lag1,
    usdprice,
    mpi,
    headcount,
    intensity,
    vulnerable,
    severe
]], columns=[
    "rain_lag1",
    "usdprice",
    "MPI",
    "Headcount Ratio",
    "Intensity of Deprivation",
    "Vulnerable to Poverty",
    "In Severe Poverty"
])

# -------------------------
# Predict
# -------------------------

if st.button("Predict Crisis Risk"):
    probability = model.predict_proba(input_data)[0][1]
    prediction = model.predict(input_data)[0]

    st.subheader("Prediction Result")

    if prediction == 1:
        st.error(f"Crisis Likely (Probability: {probability:.2f})")
    else:
        st.success(f"No Crisis Likely (Probability: {probability:.2f})")