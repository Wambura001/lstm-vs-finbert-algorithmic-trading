from pathlib import Path
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

DATA_FILE = Path(__file__).parent / "data" / "research_results.json"
with DATA_FILE.open(encoding="utf-8") as f:
    DATA = json.load(f)

app = FastAPI(
    title="Cross-Market Research API",
    description="Read-only API for verified thesis experiment outputs.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "research-api", "mode": "read-only"}

@app.get("/api/research/summary")
def summary():
    return {
        "project_title": DATA["project_title"],
        "research_question": DATA["research_question"],
        "dataset": DATA["dataset"],
        "available_sections": {
            "summary": True,
            "metrics": True,
            "predictions": True,
            "market_timeseries": False,
            "daily_sentiment": False,
            "article_explorer": False,
        },
        "notes": DATA["notes"],
    }

@app.get("/api/models/metrics")
def model_metrics():
    return DATA["metrics"]

@app.get("/api/predictions")
def predictions(model: str = "LSTM"):
    if model.upper() != "LSTM":
        raise HTTPException(
            status_code=404,
            detail="Prediction-level CSV for Logistic Regression is not available in this build. Aggregate metrics are available.",
        )
    return {"model": "LSTM", "count": len(DATA["predictions"]), "items": DATA["predictions"]}

@app.get("/api/models/confusion-matrices")
def confusion_matrices():
    return [
        {"model": "LSTM", "configuration": item["configuration"], "matrix": item["confusion_matrix"]}
        for item in DATA["metrics"]["LSTM"]
    ]

@app.get("/api/data/availability")
def data_availability():
    return {
        "market_timeseries": {"available": False, "reason": "The 208-row market CSV is not available as a standalone file in the accessible project files."},
        "daily_sentiment": {"available": False, "reason": "Daily sentiment CSVs are not available as standalone files in the accessible project files."},
        "article_sentiment": {"available": False, "reason": "Article-level sentiment CSV is not available as a standalone file in the accessible project files."},
        "experimental_summary": {"available": True},
        "lstm_predictions": {"available": True},
        "aggregate_metrics": {"available": True},
    }
