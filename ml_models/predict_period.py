#!/usr/bin/env python3
"""
Period Prediction Service using ML Model
This script loads the PCOS/period prediction model and makes predictions
based on user's period log history.
"""

import sys
import json
import pickle
import os
from datetime import datetime, timedelta
from pathlib import Path

# Add the ml_models directory to path
MODEL_DIR = Path(__file__).parent

def load_model():
    """Load the trained ML model"""
    model_path = MODEL_DIR / "pcos_model.pkl"
    features_path = MODEL_DIR / "model_features.pkl"
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    # Load feature names if available
    features = None
    if features_path.exists():
        with open(features_path, 'rb') as f:
            features = pickle.load(f)
    
    return model, features

def calculate_cycle_features(logs):
    """
    Calculate features from period logs for the ML model.
    This function transforms period log data into features the model expects.
    
    Args:
        logs: List of period logs with startDate and endDate
        
    Returns:
        Dictionary of features for the model
    """
    if len(logs) < 2:
        return None
    
    # Sort logs by date
    sorted_logs = sorted(logs, key=lambda x: x['startDate'])
    
    # Calculate cycle lengths (days between period starts)
    cycle_lengths = []
    for i in range(1, len(sorted_logs)):
        start1 = datetime.fromisoformat(sorted_logs[i-1]['startDate'].replace('Z', '+00:00'))
        start2 = datetime.fromisoformat(sorted_logs[i]['startDate'].replace('Z', '+00:00'))
        cycle_length = (start2 - start1).days
        cycle_lengths.append(cycle_length)
    
    # Calculate period durations
    period_durations = []
    for log in sorted_logs:
        start = datetime.fromisoformat(log['startDate'].replace('Z', '+00:00'))
        end = datetime.fromisoformat(log['endDate'].replace('Z', '+00:00')) if log.get('endDate') else start
        duration = (end - start).days + 1
        period_durations.append(duration)
    
    # Calculate statistics
    avg_cycle_length = sum(cycle_lengths) / len(cycle_lengths) if cycle_lengths else 28
    avg_period_duration = sum(period_durations) / len(period_durations) if period_durations else 5
    
    # Days since last period
    last_period_start = datetime.fromisoformat(sorted_logs[-1]['startDate'].replace('Z', '+00:00'))
    days_since_last = (datetime.now() - last_period_start.replace(tzinfo=None)).days
    
    # Build feature dictionary
    # NOTE: Adjust these features based on what your actual model expects
    # You may need to check your model_features.pkl or training code
    features = {
        'avg_cycle_length': avg_cycle_length,
        'avg_period_duration': avg_period_duration,
        'days_since_last_period': days_since_last,
        'cycle_std': (sum((x - avg_cycle_length) ** 2 for x in cycle_lengths) / len(cycle_lengths)) ** 0.5 if len(cycle_lengths) > 1 else 0,
        'num_cycles': len(cycle_lengths),
    }
    
    return features

def predict_next_period(logs):
    """
    Predict the next period start date using the ML model.
    
    Args:
        logs: List of period logs (JSON format)
        
    Returns:
        Dictionary with predictedStartDate and confidence
    """
    try:
        # Load model
        model, feature_names = load_model()
        
        # Calculate features from logs
        features = calculate_cycle_features(logs)
        if features is None:
            return {
                "predictedStartDate": None,
                "confidence": 0,
                "error": "Insufficient data. Need at least 2 period logs."
            }
        
        # Convert features to array format expected by model
        # Adjust this based on your model's expected input format
        if feature_names:
            # If we have feature names, use them to order features
            feature_array = [features.get(name, 0) for name in feature_names]
        else:
            # Default feature order (adjust based on your model)
            feature_array = [
                features['avg_cycle_length'],
                features['avg_period_duration'],
                features['days_since_last_period'],
                features['cycle_std'],
                features['num_cycles']
            ]
        
        # Make prediction
        # If your model predicts cycle length, add it to last period date
        # If it predicts date directly, use that
        prediction = model.predict([feature_array])[0]
        
        # Get last period date
        sorted_logs = sorted(logs, key=lambda x: x['startDate'])
        last_period_start = datetime.fromisoformat(sorted_logs[-1]['startDate'].replace('Z', '+00:00'))
        
        # If prediction is a cycle length (number of days)
        if isinstance(prediction, (int, float)) and prediction < 100:
            # Prediction is likely cycle length in days
            next_period_date = last_period_start + timedelta(days=int(prediction))
        else:
            # Prediction might be a date or different format
            # Fallback: use average cycle length
            avg_cycle = features['avg_cycle_length']
            next_period_date = last_period_start + timedelta(days=int(avg_cycle))
        
        # Calculate confidence based on cycle regularity
        cycle_std = features['cycle_std']
        confidence = max(50, min(95, 100 - int(cycle_std * 2)))  # Higher std = lower confidence
        
        return {
            "predictedStartDate": next_period_date.strftime("%Y-%m-%d"),
            "confidence": confidence,
            "features": features  # For debugging
        }
        
    except Exception as e:
        return {
            "predictedStartDate": None,
            "confidence": 0,
            "error": str(e)
        }

def main():
    """Main entry point - reads from stdin, writes to stdout"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        logs = input_data.get('logs', [])
        
        # Make prediction
        result = predict_next_period(logs)
        
        # Write result to stdout
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "predictedStartDate": None,
            "confidence": 0,
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()
