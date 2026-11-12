# Cross-Market Financial Sentiment Research Dashboard

A read-only research dashboard built from the verified thesis experiment results available in the project context.

## Contents
- `backend/`: FastAPI read-only API and verified research JSON.
- `frontend/`: Next.js 16 / React 19 dashboard.

## Run locally
Terminal 1:
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Terminal 2:
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit http://localhost:3000.

## Included verified data
- 62 labelled observations in each feature configuration.
- 43 initial training observations and 19 walk-forward test predictions.
- LSTM, Logistic Regression and baseline aggregate metrics.
- Actual and predicted LSTM classes for all 19 test dates.
- Dataset metadata and methodology.

## Intentionally excluded
No live-news scraping, fabricated fallback articles, simulated trading, transaction-cost sliders, alpha/profitability claims, or execution functions.

The standalone 208-row market CSV, daily sentiment CSVs and article-level sentiment CSV were not available as readable standalone assets at build time. The dashboard explicitly reports their absence instead of creating substitute values.
