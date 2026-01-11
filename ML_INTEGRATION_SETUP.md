# ML Model Integration - Quick Start

## Overview

Your PCOS ML model has been integrated into the PiCO Period Tracker app. The prediction system now uses your trained model instead of OpenAI.

## Quick Setup (3 Steps)

### Step 1: Copy Your Model Files

Copy these files from your PCOS project to the `ml_models/` folder:

```
Your PCOS Project/          →    Pico-Period-Calendar/ml_models/
  ├── pcos_model.pkl        →    ├── pcos_model.pkl
  ├── model_features.pkl    →    ├── model_features.pkl (if you have it)
```

**Location:** `C:\Users\DELL\Downloads\Pico-Period-Calendar\Pico-Period-Calendar\ml_models\`

### Step 2: Install Python Dependencies

Open PowerShell/Command Prompt in the project root and run:

```bash
pip install -r ml_models/requirements.txt
```

Or if that doesn't work:

```bash
python -m pip install -r ml_models/requirements.txt
```

### Step 3: Test It!

1. Start your app: `npm run dev`
2. Log in and add at least 2 period logs
3. Click "Generate Prediction" on the dashboard
4. Your ML model will make the prediction!

## What Was Changed

✅ Created `ml_models/predict_period.py` - Python script that uses your model  
✅ Created `server/ml-predictor.ts` - Node.js service to call Python  
✅ Updated `server/routes.ts` - Now uses ML model instead of OpenAI  
✅ Added fallback - If ML fails, uses simple cycle average  

## Customization Needed?

You may need to adjust `ml_models/predict_period.py` to match your model's exact input format:

1. **Check your model's expected features:**
   - Look at your training code (`model_training.py`)
   - Check what features you used
   - Update `calculate_cycle_features()` if needed

2. **Check your model's output:**
   - Does it predict cycle length (days)?
   - Or a date directly?
   - Update `predict_next_period()` accordingly

## Troubleshooting

### "Python not found"
- Install Python 3.8+ from python.org
- Make sure it's added to PATH during installation

### "Model file not found"
- Double-check `pcos_model.pkl` is in `ml_models/` folder
- Check the file name matches exactly

### "Module not found"
- Run: `pip install numpy pandas scikit-learn`
- Or: `pip install -r ml_models/requirements.txt`

### Predictions not working?
- Check the server console for error messages
- The system will fallback to simple calculation if ML fails
- Verify your model file is not corrupted

## Need Help?

Check `ml_models/README.md` for detailed documentation.
