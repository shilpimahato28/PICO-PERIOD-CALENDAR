import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score

#load the model and the  data

try:
    model = joblib.load('pcos_model.pkl')
    features = joblib.load('model_features.pkl')
    
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
    
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Column names cleaned and data loaded!")
    
except Exception as e:
    print(f"Error: {e}")
    exit()

# --- SECTION 3: PLOTTING ---
y_pred = model.predict(X_test)

# Confusion Matrix
plt.figure(figsize=(8, 6))
sns.heatmap(confusion_matrix(y_test, y_pred), annot=True, fmt='d', cmap='RdPu')
plt.title('Final Model Evaluation: Confusion Matrix')
plt.savefig('confusion_matrix.png')
plt.show()



# Feature Importance
importance = pd.Series(model.feature_importances_, index=features)
plt.figure(figsize=(10, 8))
importance.nlargest(10).plot(kind='barh', color='teal').invert_yaxis()
plt.title('Top 10 Predictors (Cleaned Features)')
plt.savefig('feature_importance.png')
plt.show()

print("\nAccuracy Score:", accuracy_score(y_test, y_pred))