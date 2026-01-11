import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
import matplotlib.pyplot as plt
import shap

# load the data
data_path = os.path.join('..', 'PCOS_data.csv')
if not os.path.exists(data_path):
    data_path = 'PCOS_data.csv'
df = pd.read_csv(data_path)
df.columns = df.columns.str.strip()
df = df.drop(['Sl. No', 'Patient File No.', 'Unnamed: 44'], axis=1, errors='ignore')
for col in df.columns:
    if df[col].dtype == 'object':
        df[col] = pd.to_numeric(df[col], errors='coerce')
df = df.fillna(df.median())
X = df.drop('PCOS (Y/N)', axis=1)
y = df['PCOS (Y/N)']
feature_names = list(X.columns)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("Training model with clean feature names...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred)*100:.2f}%")


print("Generating SHAP plots...")
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)
actual_shap = shap_values[1] if isinstance(shap_values, list) else shap_values

plt.figure(figsize=(10, 8))
shap.summary_plot(actual_shap, X_test, show=False)
plt.title("PCOS Feature Impact")
plt.savefig('shap_summary_plot.png')

joblib.dump(model, 'pcos_model.pkl')
joblib.dump(feature_names, 'model_features.pkl')
print("Success! Model and Features saved.")