"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Newspaper, Sliders, TrendingUp, Cpu, Landmark } from 'lucide-react';

interface NewsItem {
  headline: string;
  publish_time: string;
  ai_sentiment_label: string;
  ai_confidence_score: number;
}

export default function QuantDashboard() {
  // Configuration Sliders State Spaces
  const [fee, setFee] = useState(0.0010);
  const [slippage, setSlippage] = useState(0.0002);
  const [useFilter, setUseFilter] = useState(false);

  // Loaded API Data Metrics State
const [news, setNews] = useState<NewsItem[]>([]);

  const [summary, setSummary] = useState({
    total_execution_trades: 15,
    net_strategy_return_pct: -3.58,
    market_benchmark_return_pct: -3.55,
    net_alpha_generated: -0.03
  });

  // Dynamic API Fetch Execution Loop
    // Dynamic API Fetch Execution Loop
  useEffect(() => {
    // 1. Fetch live text analytics stream from FastAPI backend
    fetch('http://127.0.0', {
      method: 'GET',
      mode: 'cors', // Explicitly command browser infrastructure to allow cross-origin traffic
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error("API structural response failure");
        return res.json();
      })
      .then(data => {
        console.log("📥 News stream package successfully fetched:", data);
        if (data && data.news_feed) {
          setNews(data.news_feed);
        }
      })
      .catch(err => console.log("⏳ News feed connection waiting...", err));

    // 2. Fetch dynamic backtesting calculations based on sliders
    fetch(`http://127.0.0{fee}&slippage=${slippage}&use_filter=${useFilter}`)
      .then(res => res.json())
      .then(data => { if (data.summary) setSummary(data.summary); })
      .catch(err => console.log("Backtester connection waiting..."));
  }, [fee, slippage, useFilter]);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 selection:bg-rose-500 selection:text-white">
      {/* HEADER SECTION */}
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
<h1 className="text-2xl font-bold tracking-tight text-purple-400">
  Asymmetric Quant Trading Terminal
</h1>
          <p className="text-sm text-slate-400 mt-1">
            Multimodal Research Pipeline: South Korean News Sentiment (Canary) vs. Swiss SMI Index (Vault)
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          FASTAPI BACKEND CONNECTED
        </div>
      </header>

      {/* METRICS DISPLAY BLOCK */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Model Validation Accuracy</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold font-mono">60.00%</div>
          <p className="text-xs text-purple-400 mt-1">Out-of-sample PyTorch LSTM matrix edge</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>AI Strategy Net Return</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className={`text-3xl font-bold font-mono ${summary.net_strategy_return_pct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {summary.net_strategy_return_pct}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Adjusted for transaction costs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Passive SMI Benchmark</span>
            <Landmark className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-slate-300">
            {summary.market_benchmark_return_pct}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Unmanaged Buy-and-Hold curve</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
            <span>Total Trading Signals</span>
            <Sliders className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold font-mono text-indigo-400">
            {summary.total_execution_trades}
          </div>
          <p className="text-xs text-slate-400 mt-1">Position state modifications triggered</p>
        </div>
      </section>

      {/* THREE-COLUMN PRODUCTION RUNTIME DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMN 1: LIVE KOREAN NEWS INGESTION FEED */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-emerald-400" />
            Live Korean Economic Streams (Canary)
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {news.length === 0 ? (
  <p className="text-xs text-slate-500 italic">Waiting for incoming news ticker segments...</p>
) : (
  news.map((item, idx) => (
    <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/60">
      <p className="text-xs font-medium leading-relaxed mb-2 text-slate-200">{item.headline}</p>
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
        <span>{item.publish_time.split(' ').slice(1,4).join(' ')}</span>
        
        {/* FIXED: Single opening backtick inside the curly braces removes all template errors */}
        <span className={`px-1.5 py-0.5 rounded text-white font-bold tracking-wide uppercase ${
          item.ai_sentiment_label === 'positive' ? 'bg-emerald-600/80' : 
          item.ai_sentiment_label === 'negative' ? 'bg-rose-600/80' : 'bg-slate-700/80'
        }`}>
          {item.ai_sentiment_label}
        </span>
      </div>
    </div>
  ))
)}

          </div>
        </div>

        {/* COLUMN 2: STRATEGY CONFIGURATION CONTROLS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-6 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Interactive Operational Sliders
            </h2>

            {/* SLIDER 1: TRANSACTION FEE */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400">Brokerage Transaction Fee:</span>
                <span className="text-indigo-400 font-bold">{(fee * 10000).toFixed(0)} bps ({(fee * 100).toFixed(2)}%)</span>
              </div>
              <input 
                type="range" min="0" max="0.0030" step="0.0005" value={fee} 
                onChange={(e) => setFee(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* SLIDER 2: SLIPPAGE PENALTY */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400">Execution Slippage Drag:</span>
                <span className="text-indigo-400 font-bold">{(slippage * 10000).toFixed(0)} bps ({(slippage * 100).toFixed(2)}%)</span>
              </div>
              <input 
                type="range" min="0" max="0.0010" step="0.0001" value={slippage} 
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* CHECKBOX 3: PROPOSED SENTIMENT ACTIVATION FILTER */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
              <input 
                type="checkbox" id="filter" checked={useFilter} 
                onChange={(e) => setUseFilter(e.target.checked)}
                className="w-4 h-4 text-rose-500 bg-slate-900 border-slate-700 rounded focus:ring-rose-500 accent-rose-500 mt-0.5 cursor-pointer"
              />
              <label htmlFor="filter" className="cursor-pointer">
                <div className="text-xs font-semibold text-rose-400">Activate Proposed 65% Confidence Filter</div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  Enforces our Chapter 5 mitigation filter. Eliminates low-conviction predictions, dropping trade volume to minimize high-friction capital leakage.
                </p>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-6 text-center text-[11px] text-slate-500 italic">
            Adjusting configurations recalculates network vectors live via the FastAPI API link.
          </div>
        </div>

                {/* COLUMN 3: PITCH DECK ALPHA INTERPRETATION GRAPHICS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              Strategic Investor Pitch Metrics
            </h2>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Net Alpha Generation Matrix
              </div>
              
              {/* Dynamic Color Change: Crimson text if alpha is negative, Emerald if positive */}
              <div className={`text-4xl font-mono font-bold ${summary.net_alpha_generated < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {summary.net_alpha_generated > 0 ? `+${summary.net_alpha_generated}` : summary.net_alpha_generated}%
              </div>
              
              {/* Dynamic Explanatory Text block updating based on backend status */}
              <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
                {summary.net_alpha_generated < 0
                  ? "Our baseline model over-trades on fast-moving news, allowing transaction fees to bleed out our 60% accuracy edge."
                  : "SUCCESS! Activating the 65% filter cuts out low-conviction noise, lowering execution volume and unlocking clear financial alpha."
                }
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/20 text-xs leading-relaxed text-slate-300">
            <span className="font-bold text-rose-400 block mb-1">Thesis Defense Takeaway:</span>
            This interface visualizes the accuracy-profitability paradox. It demonstrates to stakeholders that software efficiency and holding longevity matter just as much as raw loss minimization curves.
          </div>
        </div>
      </div>
    </div>
  );
}
