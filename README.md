# Cross-Market Financial Sentiment Research Dashboard

A research project investigating whether Korean financial-news sentiment, combined with historical Korean and Swiss market data, can improve the prediction of Swiss Market Index (SMI) direction.

This repository contains the data-processing pipeline, sentiment analysis workflow, machine-learning experiments, evaluation outputs, and a read-only research dashboard developed as part of a final-year undergraduate thesis.

---

## 1. Research Overview

![image](assets/dashboard.png)

### Research question

**Can Korean financial-news sentiment, combined with historical Swiss market data, improve the prediction of Swiss Market Index direction?**

The study investigates whether information extracted from Korean financial news provides additional predictive information beyond historical market variables.

The research combines:

- Korean financial-news headlines and article content.
- Korean market data represented by the Korea Composite Stock Price Index (KOSPI).
- Swiss market data represented by the Swiss Market Index (SMI).
- Korean financial-news sentiment generated using a Korean financial sentiment model.
- Machine-learning models for next-session SMI return-direction classification.

The project is an academic investigation of cross-market information and predictive modelling. It is not a live trading system.

### Experimental comparison

Three feature configurations are evaluated:

| Configuration | Input features |
|---|---|
| Market-only | Historical SMI and KOSPI market variables |
| Market + Narrow Sentiment | Market variables plus sentiment from selected financial-news categories |
| Market + Broad Sentiment | Market variables plus sentiment from a wider selection of economic-news categories |

The purpose is to examine whether sentiment features provide additional predictive information and whether the scope of news selection affects model performance.

---

## 2. Research Pipeline

The project follows a sequential data-processing and modelling workflow.

```text
Korean Financial News       Korean & Swiss Market Data
          |                           |
          v                           v
    News Cleaning               Market Cleaning
          |                           |
          v                           |
    Category Filtering                |
          |                           |
          v                           |
    KR-FinBERT Sentiment               |
          |                           |
          v                           |
    Daily Aggregation                  |
          |                           |
          v                           |
    Temporal Alignment <---------------+
          |
          v
    Dataset Construction
          |
          v
    Feature Configuration
    |          |          |
    v          v          v
  Market    Market +    Market +
   Only      Narrow      Broad
    |          |          |
    +----------+----------+
               |
               v
       Model Training
               |
               v
       Walk-Forward Evaluation
               |
               v
       Saved Predictions & Metrics
               |
               v
       FastAPI Research Backend
               |
               v
       Next.js Dashboard
```

### 2.1 News processing

Korean news data is processed to prepare articles for sentiment analysis.

The workflow includes:

1. Loading and validating news records.
2. Preserving article identifiers as strings.
3. Checking exact duplicate records.
4. Applying news-category filters.
5. Preparing text for sentiment inference.
6. Generating article-level sentiment scores.
7. Aggregating article scores by publication date.

The project distinguishes between exact duplicate records and articles with repeated or similar headlines. Similar headlines are not automatically treated as duplicate articles.

### 2.2 Sentiment analysis

The sentiment model used in this study is:

**[`snunlp/KR-FinBERT-SC`](https://huggingface.co/snunlp/KR-FinBERT-SC)**

The model produces three sentiment classes:

- Negative
- Neutral
- Positive

Article-level probabilities are aggregated into daily sentiment features.

The sentiment score is calculated as:

\[
SentimentScore_t = P(Positive)_t - P(Negative)_t
\]

Daily article volume is also represented using:

\[
LogArticleCount_t = \ln(1 + ArticleCount_t)
\]

These values are model-derived estimates, not independently verified or calibrated ground-truth sentiment labels.

### 2.3 News-category configurations

Two news-selection configurations are evaluated.

**Narrow sentiment**

Includes the selected financial and securities-market categories:

- `경제>증권_증시`
- `경제>금융_재테크`

**Broad sentiment**

Includes the narrow categories and additional economic-news categories.

The comparison investigates whether including a wider range of economic news changes the information available to the predictive models.

### 2.4 Temporal alignment

News sentiment is aligned with the next available Swiss trading session.

The alignment uses a forward date-matching procedure with exact-date matches excluded. This is intended to ensure that sentiment from a publication date is not assigned to an SMI session that has already occurred.

Where multiple news dates map to the same Swiss trading session, sentiment is aggregated using article-count weighting.

Temporal alignment reduces potential look-ahead bias, although differences in publication timestamps, time zones, and trading calendars remain limitations.

---

## 3. Market Data and Experimental Dataset

The market dataset contains:

- `Date`
- `Korea_KOSPI`
- `Swiss_SMI`
- `Swiss_Returns`
- `Korea_Returns`

The experimental datasets use a common aligned date range to support fair comparison between the three feature configurations.

### Target variable

The prediction target is the direction of the next-session Swiss return:

\[
Target_t =
\begin{cases}
1 & \text{if } SwissReturn_{t+1} > 0\\
0 & \text{otherwise}
\end{cases}
\]

Class definitions:

- `1`: Positive next-session SMI return.
- `0`: Non-positive next-session SMI return.

The model predicts market direction, not the exact future index value.

### Dataset configurations

| Dataset | Description |
|---|---|
| Market-only | Market variables without news sentiment |
| Market + Narrow | Market variables and narrow sentiment features |
| Market + Broad | Market variables and broad sentiment features |

The market-only dataset uses the same aligned evaluation period as the sentiment-enhanced datasets.

---

## 4. Machine-Learning Models

The study evaluates two model families.

### 4.1 Long Short-Term Memory (LSTM)

The LSTM model learns temporal patterns from sequential market and sentiment features.

Current experimental configuration:

| Parameter | Value |
|---|---:|
| Architecture | Single-layer LSTM |
| Hidden size | 16 |
| Dropout | 0.2 |
| Lookback window | 5 sessions |
| Learning rate | 0.001 |
| Weight decay | 0.001 |
| Optimizer | Adam |
| Loss function | Binary Cross-Entropy |
| Gradient clipping | 1.0 |
| Random seed | 42 |

The model produces a probability for the positive next-session return class, which is converted into a binary prediction.

### 4.2 Logistic Regression

Logistic Regression is used as a conventional machine-learning comparison.

The sequential input is flattened into a feature vector for classification.

Current configuration:

| Parameter | Value |
|---|---:|
| Regularization parameter (C) | 0.1 |
| Maximum iterations | 2,000 |
| Class weighting | None |
| Random state | 42 |
| Lookback window | 5 sessions |

---

## 5. Evaluation Methodology

The experiments use chronological evaluation rather than randomly shuffling observations.

The current evaluation procedure includes:

1. A chronological 70:30 training/test division.
2. An initial training period of 43 observations.
3. A test period of 19 observations.
4. Expanding-window walk-forward evaluation.
5. A five-session lookback window.
6. Training-only scaler fitting within each evaluation fold.

For every test observation, the model is trained using information available before that observation and then evaluated on the next observation.

### Evaluation metrics

The following metrics are used:

- Accuracy
- Precision
- Recall
- F1-score
- Balanced accuracy
- Confusion matrix

Baseline comparisons are included to provide context for model performance.

Because the current test set contains only 19 observations, results should be interpreted as preliminary. The evaluation does not establish statistical significance or demonstrate reliable future performance.

---

## 6. Research Dashboard

The dashboard provides a visual interface for exploring the data, sentiment outputs, experimental configurations, and evaluation results.

### Technology stack

**Backend**

- Python
- FastAPI
- Pandas
- NumPy

**Frontend**

- Next.js
- React
- TypeScript
- Tailwind CSS

**Machine learning and NLP**

- PyTorch
- Hugging Face Transformers
- KR-FinBERT-SC
- Scikit-learn

### Dashboard sections

| Section | Purpose |
|---|---|
| Overview | Research summary and high-level experimental results |
| Market Data | Historical KOSPI and SMI observations |
| News & Sentiment | Daily sentiment trends and article-level scores |
| Model Evaluation | Model metrics and confusion matrices |
| Prediction Explorer | Actual versus predicted market-direction classes |
| Data & Methodology | Dataset information, processing and evaluation methodology |

### Dashboard architecture

The dashboard follows a separation-of-concerns design:

```text
Python Research Pipeline
          |
          v
Processed CSV Outputs
          |
          v
FastAPI Read-Only API
          |
          v
Next.js Frontend
          |
          v
Charts, Tables and Research Views
```

The Python pipeline remains the source of truth for data transformations, sentiment scores, target construction, model predictions, and evaluation metrics.

The dashboard reads and displays these outputs. It must not independently recalculate experimental results or introduce fabricated data.

### API design

The backend exposes research data through read-only HTTP endpoints.

The current API includes:

- `GET /api/health`
- `GET /api/research/summary`
- `GET /api/models/metrics`
- `GET /api/predictions`
- `GET /api/models/confusion-matrices`
- `GET /api/data/availability`

Planned data endpoints:

- `GET /api/market/daily`
- `GET /api/sentiment/daily`
- `GET /api/sentiment/articles`

The planned endpoints will be implemented as the corresponding canonical CSV outputs are connected and validated.

---

## 7. Repository Structure

The repository is organized to separate research processing, backend services, frontend presentation, and data storage.

```text
project/
│
├── backend/
│   ├── api.py
│   ├── requirements.txt
│   └── data/
│       ├── raw/
│       └── processed/
│
├── frontend/
│   ├── src/
│   │   └── app/
│   ├── package.json
│   └── next.config.ts
│
├── notebooks/
│   ├── 01_eda.ipynb
│   └── 02_news_sentiment_pipeline.ipynb
│
├── data/
│   ├── raw/
│   └── processed/
│
├── README.md
└── .gitignore
```

The directory tree is a recommended logical organization. Actual notebook and data filenames may vary depending on the current repository version.

Large datasets and generated model artifacts should be managed separately from source code where appropriate. Do not commit API keys, passwords, private credentials, or unnecessary raw personal data.

---

## 8. Installation and Local Setup

### Requirements

- Python
- Node.js and npm
- Git

### Clone the repository

```bash
git clone https://github.com/Wambura001/lstm-vs-finbert-algorithmic-trading.git

cd lstm-vs-finbert-algorithmic-trading
```

Switch to the dashboard development branch if necessary:

```bash
git checkout feature/nextjs-dashboard
```

### Backend setup

```bash
cd backend

python -m venv .venv
```

Activate the environment.

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn api:app --reload --port 8000
```

The API will be available at:

```text
http://127.0.0.1:8000
```

### Frontend setup

Open another terminal:

```bash
cd frontend

npm install
```

Create the local environment file using `.env.local.example` as a template.

The API base URL should point to:

```text
http://127.0.0.1:8000
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 9. Reproducibility and Data Integrity

Reproducibility is an important requirement of this research project.

The following practices should be maintained:

- Preserve raw data separately from processed data.
- Document data providers and retrieval dates.
- Preserve article identifiers as strings.
- Record the news-category definitions.
- Keep temporal alignment rules consistent.
- Use chronological train/test splitting.
- Fit preprocessing scalers only on training data within each evaluation fold.
- Save model configurations and random seeds.
- Store prediction outputs and evaluation metrics.
- Ensure dashboard results match the saved experimental outputs.

Any changes to preprocessing, feature construction, model architecture, or evaluation methodology should be documented.

---

## 10. Limitations

The current study has several limitations:

1. The aligned experimental dataset is relatively small.
2. The test period contains only 19 observations.
3. Sentiment probabilities are model estimates and are not independently calibrated ground truth.
4. Temporal alignment cannot completely eliminate differences in publication timing and market-session boundaries.
5. The study examines a specific combination of Korean news and Swiss market data.
6. The results should not be generalized to other markets or periods without further testing.

The dashboard is intended to support transparent academic exploration of these results, not to imply certainty about future market movements.

---

## 11. Research Scope and Disclaimer

This repository is an academic research project focused on financial-news sentiment analysis, cross-market data integration, and next-session SMI direction prediction.

It is not a live trading platform, investment service, or automated execution system.

All reported metrics should be interpreted within the dataset, experimental design, and limitations documented in the research.

---

## 12. Project Status

The project is being developed in stages:

- [x] Market-data cleaning and preparation
- [x] Korean news preprocessing
- [x] Narrow and broad news-category selection
- [x] Article-level sentiment inference
- [x] Daily sentiment aggregation
- [x] News-to-market temporal alignment
- [x] Experimental dataset construction
- [x] LSTM and Logistic Regression evaluation
- [x] Initial read-only research API
- [x] Initial dashboard implementation
- [ ] Connect canonical market CSV to dashboard
- [ ] Connect narrow and broad daily sentiment CSVs
- [ ] Connect article-level sentiment explorer
- [ ] Complete dashboard data-validation tests
- [ ] Finalize thesis documentation and reproducibility materials

**Research focus:** Evaluating the additional predictive information, if any, provided by Korean financial-news sentiment when forecasting Swiss Market Index direction.