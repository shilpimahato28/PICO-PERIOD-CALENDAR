import pandas as pd
import numpy as np

# Visualization
import plotly.express as px

# ML
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib


# ==========================================
# STEP 1: LOAD DATA
# ==========================================

data = pd.read_csv('PCOS_data.csv')
print("Dataset Loaded Successfully")

# ==========================================
# STEP 2: DATA CLEANING (PREPROCESSING)
# ==========================================

# Remove ID / empty columns
data = data.drop(['Sl. No', 'Patient File No.', 'Unnamed: 44'], axis=1)

# Convert text columns to numeric
data['AMH(ng/mL)'] = pd.to_numeric(data['AMH(ng/mL)'], errors='coerce')
data['II    beta-HCG(mIU/mL)'] = pd.to_numeric(
    data['II    beta-HCG(mIU/mL)'], errors='coerce'
)

# Handle missing values
data = data.fillna(data.median(numeric_only=True))

print("--- Data Cleaning Complete ---")
print(f"Dataset Shape: {data.shape}")


# ==========================================
# STEP 3: INTERACTIVE EDA (PLOTLY)
# ==========================================

# Skin Darkening vs PCOS
fig1 = px.histogram(
    data,
    x='Skin darkening (Y/N)',
    color='PCOS (Y/N)',
    barmode='group',
    title='Skin Darkening vs PCOS',
    labels={
        'Skin darkening (Y/N)': 'Skin Darkening (0 = No, 1 = Yes)',
        'count': 'Number of Patients',
        'PCOS (Y/N)': 'PCOS'
    },
    template='plotly_white'
)
fig1.show()


# Cycle Length vs PCOS
fig2 = px.box(
    data,
    x="PCOS (Y/N)",
    y="Cycle length(days)",
    title="Cycle Length vs PCOS",
    labels={
        "PCOS (Y/N)": "PCOS (0 = No, 1 = Yes)",
        "Cycle length(days)": "Cycle Length (days)"
    },
    template="plotly_white"
)
fig2.show()

