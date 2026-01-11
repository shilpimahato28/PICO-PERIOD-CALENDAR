# ML Model Integration Guide

This directory contains the Python ML model integration for period predictions.

## Setup Instructions

### 1. Copy Your ML Model Files

Copy your trained ML model files to this directory:

```
ml_models/
  ├── pcos_model.pkl          # Your trained model (REQUIRED)
  ├── model_features.pkl      # Feature names (OPTIONAL but recommended)
  ├── predict_period.py       # Prediction script (already created)
  └── requirements.txt        # Python dependencies (already created)
```

**Important:** Make sure `pcos_model.pkl` is in this directory.

### 2. Install Python Dependencies

Install the required Python packages:

```bash
# On Windows
pip install -r requirements.txt

# On Mac/Linux
pip3 install -r requirements.txt
```

Or if you prefer using a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Verify Python Installation

Make sure Python 3.8+ is installed and accessible:

```bash
python --version
# or
python3 --version
```

### 4. Test the Integration

You can test the Python script directly:

```bash
# Test with sample data
echo '{"logs": [{"startDate": "2024-01-01", "endDate": "2024-01-05"}, {"startDate": "2024-01-29", "endDate": "2024-02-02"}]}' | python ml_models/predict_period.py
```

## Customizing for Your Model

The `predict_period.py` script needs to match your model's expected input format. You may need to adjust:

### 1. Feature Extraction

Edit `calculate_cycle_features()` in `predict_period.py` to match what your model expects. Check:
- Your training code to see what features were used
- The `model_features.pkl` file (if you have it)
- Your model's input requirements

### 2. Model Output Format

The script assumes your model predicts:
- **Cycle length** (number of days) - most common
- Or a **date directly**

If your model outputs something different, adjust the `predict_next_period()` function.

### 3. Feature Order

If you have `model_features.pkl`, the script will use it to order features correctly. Otherwise, you may need to manually specify the feature order in the script.

## Troubleshooting

### "Model file not found"
- Make sure `pcos_model.pkl` is in the `ml_models/` directory
- Check the file path is correct

### "Python not found"
- Install Python 3.8 or higher
- Make sure Python is in your system PATH
- On Windows, you may need to use `python` instead of `python3`

### "Module not found" errors
- Run `pip install -r requirements.txt` again
- Make sure you're using the correct Python environment

### Prediction errors
- Check that your model file is not corrupted
- Verify the feature extraction matches your training data
- Check the console logs for detailed error messages

## How It Works

1. **Node.js backend** receives a prediction request
2. **ml-predictor.ts** calls the Python script with period log data
3. **predict_period.py** loads your ML model and makes a prediction
4. **Result** is returned to the backend and stored in the database

The system includes a **fallback mechanism** - if the ML model fails, it uses a simple cycle average calculation.
