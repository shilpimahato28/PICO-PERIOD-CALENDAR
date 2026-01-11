/**
 * ML Model Prediction Service
 * Calls Python ML model to make period predictions
 */

import { spawn } from "child_process";
import { join } from "path";
import type { PeriodLog } from "@shared/schema";

interface PredictionResult {
  predictedStartDate: string | null;
  confidence: number;
  error?: string;
  features?: Record<string, number>;
}

/**
 * Predict next period using ML model
 * @param logs Array of period logs from the database
 * @returns Prediction result with date and confidence
 */
export async function predictWithMLModel(
  logs: PeriodLog[]
): Promise<PredictionResult> {
  try {
    // Convert logs to format expected by Python script
    const logsForPython = logs.map((log) => ({
      startDate: log.startDate.toISOString().split("T")[0], // YYYY-MM-DD
      endDate: log.endDate
        ? log.endDate.toISOString().split("T")[0]
        : log.startDate.toISOString().split("T")[0],
      flowIntensity: log.flowIntensity,
      symptoms: log.symptoms,
    }));

    // Prepare input data
    const inputData = {
      logs: logsForPython,
    };

    // Path to Python script
    const pythonScript = join(__dirname, "..", "ml_models", "predict_period.py");
    
    // Determine Python command
    const pythonCmd = process.platform === "win32" ? "python" : "python3";

    // Execute Python script with input via stdin
    const result = await new Promise<PredictionResult>((resolve, reject) => {
      const python = spawn(pythonCmd, [pythonScript], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      python.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      python.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      python.on("close", (code) => {
        if (code !== 0) {
          console.error("Python script error:", stderr);
          reject(new Error(`Python script exited with code ${code}: ${stderr}`));
          return;
        }

        if (stderr && !stderr.includes("WARNING")) {
          console.warn("Python script warnings:", stderr);
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });

      python.on("error", (error) => {
        if (error.message.includes("ENOENT")) {
          reject(
            new Error(
              `Python not found. Please install Python 3.8+ and ensure it's in your PATH. Tried: ${pythonCmd}`
            )
          );
        } else {
          reject(error);
        }
      });

      // Send input data to Python script
      python.stdin.write(JSON.stringify(inputData));
      python.stdin.end();
    });

    if (result.error) {
      throw new Error(result.error);
    }

    if (!result.predictedStartDate) {
      throw new Error("Model did not return a predicted date");
    }

    return result;
  } catch (error: any) {
    console.error("ML prediction error:", error);
    
    // Fallback to simple calculation if ML fails
    return fallbackPrediction(logs);
  }
}

/**
 * Fallback prediction using simple cycle average
 * Used when ML model is unavailable
 */
function fallbackPrediction(logs: PeriodLog[]): PredictionResult {
  if (logs.length < 2) {
    return {
      predictedStartDate: null,
      confidence: 0,
      error: "Need at least 2 period logs for prediction",
    };
  }

  // Sort by date
  const sortedLogs = [...logs].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  // Calculate average cycle length
  const cycleLengths: number[] = [];
  for (let i = 1; i < sortedLogs.length; i++) {
    const days =
      (sortedLogs[i].startDate.getTime() - sortedLogs[i - 1].startDate.getTime()) /
      (1000 * 60 * 60 * 24);
    cycleLengths.push(days);
  }

  const avgCycleLength =
    cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;

  // Predict next period
  const lastPeriodDate = sortedLogs[sortedLogs.length - 1].startDate;
  const nextPeriodDate = new Date(lastPeriodDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + Math.round(avgCycleLength));

  // Calculate confidence based on cycle regularity
  const variance =
    cycleLengths.reduce(
      (sum, len) => sum + Math.pow(len - avgCycleLength, 2),
      0
    ) / cycleLengths.length;
  const stdDev = Math.sqrt(variance);
  const confidence = Math.max(50, Math.min(95, 100 - Math.round(stdDev * 2)));

  return {
    predictedStartDate: nextPeriodDate.toISOString().split("T")[0],
    confidence,
  };
}
