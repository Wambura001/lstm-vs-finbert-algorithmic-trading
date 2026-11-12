# Research API

## Run
```bash
cd backend
python -m venv .venv
# activate the environment
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

## Read-only endpoints
- `GET /api/health`
- `GET /api/research/summary`
- `GET /api/models/metrics`
- `GET /api/models/confusion-matrices`
- `GET /api/predictions?model=LSTM`
- `GET /api/data/availability`

The API serves verified aggregate experiment results and the 19 LSTM prediction rows. It deliberately does not invent market time-series or article-level sentiment data that are not available as standalone files in this build.
