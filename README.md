# Asymmetric Algorithmic Trading Framework: Bridging South Korean Macro-Signals with Swiss Sanctuary Assets

This repository houses the complete data science pipeline and algorithmic trading framework developed for my **Final Year Bachelor's Thesis**. 

The core objective of this project is to build an asymmetric, cross-border trading system. It tests whether an AI reading **South Korean textual news** can act as an early "economic warning signal" to predict price trends for **Swiss financial assets**.

---
## Research Questions Being Addressed
* **RQ1:** Does integrating unstructured textual sentiment from an export-driven market (South Korea) significantly boost the out-of-sample directional forecasting accuracy of a European defensive asset network?
* **RQ2:** When subjected to realistic execution costs and liquidity constraints, does an NLP-driven predictive framework generate stable trading alpha, or do high-frequency transaction fees erode profitability?

---

## The Core Concept 

In global quantitative finance, South Korea is often nicknamed **"The Canary in the Coal Mine"** for the world economy. Because South Korea is a global manufacturing and technology powerhouse (producing the microchips and components everyone needs), its economy shows signs of trouble long before the rest of the world notices. 

Conversely, **Switzerland** is the world's **"financial bank vault"**. When global investors get nervous about bad economic news, they panic and immediately move their cash into safe Swiss assets like the Swiss Franc (CHF) or stable Swiss corporate stocks.

### The Algorithmic Hypothesis:
If local South Korean news turns negative regarding technology or exports, global investors will soon rotate their money into safe Swiss assets. By training an AI to read Korean text data, we aim to capture this market shift **before** it registers on traditional price charts.

---

## Technical Framework Overview

This project bypasses traditional, isolated trading approaches by splitting data processing into two specialized machine learning pipelines that feed a single execution engine:

[🇰🇷 Korean Text Pipeline] ──► [NLP Transformer (KoBERT)] ──► Sentiment Score ┐├──► [Stacked LSTM Deep Learning] ──► Trading Execution[🇨🇭 Swiss Market Data]    ──► [Numerical OHLCV Feeds]     ──► Tech Indicators ┘

1. **The Language Processor (NLP Pipeline):** Uses a fine-tuned Korean transformer model (**KoBERT / KcBERT**) to scrape local South Korean business headlines and monetary announcements. It translates chaotic human text into a clean mathematical "Worry Score" from `-1` (Panic) to `+1` (Growth).
2. **The Math Engine (Deep Learning Pipeline):** Uses a sequential **Long Short-Term Memory (LSTM)** neural network. It reviews historical Swiss market data (the Swiss Market Index and CHF exchange rates) *plus* the lagging Korean news score to forecast subsequent Swiss price directions.
3. **The Friction-Adjusted Backtester:** A custom-built event-driven simulation engine. It converts the AI's predictions into mock buys and sells, applying strict real-world penalties (10 basis point transaction fees and slippage parameters) to evaluate true commercial viability.

---

## Repository Directory Structure

The codebase is organized following production-grade software engineering standards to separate data management from training logic:

```text
├── config/                 # YAML profiles for hyperparameters, API keys, and trading fees
├── data/                   # Local storage for CSV files (Split into /raw and /processed)
├── notebooks/              # Jupyter Notebooks used for Exploratory Data Analysis (EDA)
├── src/                    # Primary Python source code modules
│   ├── data_pipeline/      # Scripts to programmatically download, clean, and align data
│   ├── models/             # Neural Network layers (LSTM) and Transformer fine-tuning (NLP)
│   └── backtester/         # Event loop simulation engine and quantitative metrics math
├── tests/                  # Unit tests verifying matrix dimensions and pipeline safety
├── main.py                 # The master compilation script to run the entire pipeline
└── requirements.txt        # Comprehensive list of required Python libraries
```

---

## Quick Start & Setup Guide

To replicate this environment locally on your machine, clone this repository and initialize the Python runtime:

```bash
# 1. Clone the repository
git clone https://github.com
cd YOUR_REPO_NAME

# 2. Create a virtual environment and activate it
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# 3. Install core computational dependencies
pip install -r requirements.txt

# 4. Execute the raw data ingestion script
python src/data_pipeline/fetcher.py
```

---

## Thesis Disclaimer
This project is developed strictly as a scholarly research thesis for academic validation. It does not constitute financial advice. Past simulated performance is not indicative of real-world financial results.
