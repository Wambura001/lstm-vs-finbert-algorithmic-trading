"use client";
import {useEffect,useMemo,useState} from "react";
import {Activity,BarChart3,BookOpen,Database,FileText,Layers,Network} from "lucide-react";

type Metric={configuration:string;accuracy:number;precision:number;recall:number;f1:number;balanced_accuracy:number;predicted_non_positive:number;predicted_positive:number;confusion_matrix?:number[][]};
type Prediction={date:string;actual:number;market_only:number;narrow:number;broad:number};
type Payload={project_title:string;research_question:string;dataset:any;available_sections:any;notes:string[]};
const API=process.env.NEXT_PUBLIC_API_BASE_URL||"http://127.0.0.1:8000";
const pct=(v:number)=>(v*100).toFixed(2)+"%";
const label=(v:number)=>v===1?"Positive":"Non-positive";
export default function Dashboard(){
 const [summary,setSummary]=useState<Payload|null>(null);
 const [metrics,setMetrics]=useState<Record<string,Metric[]>>({});
 const [predictions,setPredictions]=useState<Prediction[]>([]);
 const [status,setStatus]=useState("Connecting");
 const [tab,setTab]=useState("Overview");
 const [model,setModel]=useState("LSTM");
 const [error,setError]=useState("");
 useEffect(()=>{
  let active=true;
  Promise.all([
   fetch(`${API}/api/research/summary`).then(r=>{if(!r.ok)throw Error("Summary API unavailable");return r.json()}),
   fetch(`${API}/api/models/metrics`).then(r=>{if(!r.ok)throw Error("Metrics API unavailable");return r.json()}),
   fetch(`${API}/api/predictions?model=LSTM`).then(r=>{if(!r.ok)throw Error("Prediction API unavailable");return r.json()})
  ]).then(([s,m,p])=>{if(!active)return;setSummary(s);setMetrics(m);setPredictions(p.items||[]);setStatus("Connected");})
   .catch(e=>{if(!active)return;setStatus("Offline");setError(e.message||"Could not connect to API");});
  return()=>{active=false};
 },[]);
 const current=metrics[model]||[];
 const best=useMemo(()=>[...(metrics.LSTM||[])].sort((a,b)=>b.accuracy-a.accuracy)[0],[metrics]);
 const nav=[["Overview",Activity],["Model Evaluation",BarChart3],["Predictions",Layers],["Data & Methodology",BookOpen]];
 return <main className="min-h-screen">
  <div className="flex min-h-screen">
   <aside className="hidden md:block w-60 border-r border-slate-800 p-5">
    <div className="flex items-center gap-2 mb-10"><div className="rounded-lg bg-indigo-500/20 p-2"><Network size={18}/></div><div><div className="font-semibold text-sm">Cross-Market Lab</div><div className="text-xs muted">Research workspace</div></div></div>
    <div className="kicker mb-3">Workspace</div>
    {nav.map(([name,Icon]:any)=><button key={name} onClick={()=>setTab(name)} className={`navlink w-full flex items-center gap-3 mb-1 text-left ${tab===name?"bg-slate-800 text-white":""}`}><Icon size={16}/>{name}</button>)}
    <div className="panel p-3 mt-10"><div className="kicker mb-2">API status</div><div className="flex items-center gap-2 text-sm"><span className={`w-2 h-2 rounded-full ${status==="Connected"?"bg-emerald-400":status==="Offline"?"bg-rose-400":"bg-amber-400"}`}/>{status}</div><p className="text-xs muted mt-2">Read-only historical research data</p></div>
   </aside>
   <section className="flex-1 min-w-0 p-5 md:p-9 max-w-[1500px]">
    <header className="flex flex-wrap justify-between gap-4 items-start border-b border-slate-800 pb-6 mb-7">
     <div><div className="kicker mb-2">Thesis research dashboard</div><h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Korean News Sentiment × Swiss SMI</h1><p className="muted text-sm mt-2 max-w-3xl">A comparative study of market-only and sentiment-enhanced features for next-session SMI direction classification.</p></div>
     <div className="panel px-3 py-2 text-xs muted flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${status==="Connected"?"bg-emerald-400":status==="Offline"?"bg-rose-400":"bg-amber-400"}`}/>{status==="Connected"?"Research API connected":status}</div>
    </header>
    <div className="flex md:hidden gap-2 overflow-x-auto mb-6">{nav.map(([n]:any)=><button key={n} onClick={()=>setTab(n)} className="panel px-3 py-2 text-xs whitespace-nowrap">{n}</button>)}</div>
    {error&&<div className="panel p-4 mb-5 border-rose-900 text-rose-300 text-sm">{error}. Start the FastAPI service and check NEXT_PUBLIC_API_BASE_URL.</div>}
    {!summary?<div className="panel p-8 muted">Loading verified experiment outputs…</div>:<>
    {tab==="Overview"&&<>
     <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
      {[
       ["Experimental observations",summary.dataset.experimental_observations,"Across three configurations"],
       ["Walk-forward predictions",summary.dataset.walk_forward_test_observations,"Chronological test window"],
       ["LSTM best accuracy",best?pct(best.accuracy):"—",best?.configuration||""],
       ["News articles scored",summary.dataset.news_articles.broad.toLocaleString(),"Broad category selection"]
      ].map(([t,v,s])=><div className="panel p-4" key={String(t)}><div className="kicker">{t}</div><div className="metric mt-3">{v}</div><div className="text-xs muted mt-1">{s}</div></div>)}
     </div>
     <div className="grid lg:grid-cols-3 gap-4 mb-6">
      <div className="panel p-5 lg:col-span-2"><div className="flex justify-between items-center mb-4"><div><div className="font-semibold">LSTM configuration comparison</div><div className="text-xs muted mt-1">Out-of-sample classification accuracy</div></div><BarChart3 size={18} className="muted"/></div>
       {(metrics.LSTM||[]).map(x=><div className="mb-4" key={x.configuration}><div className="flex justify-between text-sm mb-2"><span>{x.configuration}</span><span className="font-mono">{pct(x.accuracy)}</span></div><div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-400 rounded-full" style={{width:`${x.accuracy*100}%`}}/></div></div>)}
       <p className="text-xs muted mt-5">The narrow and broad sentiment LSTM configurations have identical predictions and aggregate metrics in this test window.</p>
      </div>
      <div className="panel p-5"><div className="font-semibold mb-3">Experimental design</div><div className="space-y-3 text-sm">
       <div><div className="kicker">Sentiment model</div><div className="mt-1">KR-FinBERT-SC</div></div>
       <div><div className="kicker">Lookback</div><div className="mt-1">5 sessions</div></div>
       <div><div className="kicker">Initial training</div><div className="mt-1">43 observations</div></div>
       <div><div className="kicker">Evaluation</div><div className="mt-1">19 expanding-window predictions</div></div>
      </div></div>
     </div>
     <div className="panel p-5"><div className="font-semibold mb-2">Research question</div><p className="text-sm muted">{summary.research_question}</p></div>
    </>}
    {tab==="Model Evaluation"&&<div className="space-y-5">
     <div className="flex flex-wrap justify-between gap-3 items-center"><div><h2 className="text-xl font-semibold">Model evaluation</h2><p className="text-sm muted mt-1">Aggregate metrics from the verified walk-forward prediction outputs.</p></div><select value={model} onChange={e=>setModel(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm"><option>LSTM</option><option>Logistic Regression</option><option>Baselines</option></select></div>
     <div className="panel overflow-x-auto"><table className="w-full min-w-[760px]"><thead><tr>{["Configuration","Accuracy","Precision","Recall","F1","Balanced accuracy"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{current.map(x=><tr key={x.configuration}><td className="font-medium">{x.configuration}</td><td>{pct(x.accuracy)}</td><td>{pct(x.precision)}</td><td>{pct(x.recall)}</td><td>{pct(x.f1)}</td><td>{pct(x.balanced_accuracy)}</td></tr>)}</tbody></table></div>
     {model==="LSTM"&&<div className="grid md:grid-cols-3 gap-4">{current.map(x=><div className="panel p-4" key={x.configuration}><div className="text-sm font-medium mb-3">{x.configuration}</div><div className="kicker mb-2">Confusion matrix</div>{x.confusion_matrix?.map((row:number[],i:number)=><div className="grid grid-cols-2 gap-2 mb-2" key={i}>{row.map((v:number,j:number)=><div className="bg-slate-800 rounded-lg p-3 text-center" key={j}><div className="text-xl font-semibold">{v}</div><div className="text-[10px] muted">{i===0?(j===0?"True non-positive":"False positive"):(j===0?"False negative":"True positive")}</div></div>)}</div>)}</div>)}</div>}
     <div className="panel p-4 text-sm muted">Test set: 7 non-positive and 12 positive observations. The always-positive baseline achieves 63.16% accuracy but only 50.00% balanced accuracy. Interpret all results cautiously given the 19-observation test set.</div>
    </div>}
    {tab==="Predictions"&&<div className="space-y-4"><div><h2 className="text-xl font-semibold">LSTM prediction explorer</h2><p className="text-sm muted mt-1">Actual and predicted classes for each of the 19 test dates.</p></div><div className="panel overflow-x-auto"><table className="w-full min-w-[680px]"><thead><tr><th>Date</th><th>Actual</th><th>Market-only</th><th>Narrow</th><th>Broad</th></tr></thead><tbody>{predictions.map(p=><tr key={p.date}><td className="font-mono">{p.date}</td><td>{label(p.actual)}</td>{[p.market_only,p.narrow,p.broad].map((v,i)=><td key={i}><span className={`px-2 py-1 rounded text-xs ${v===p.actual?"bg-emerald-500/15 text-emerald-300":"bg-rose-500/15 text-rose-300"}`}>{label(v)}</span></td>)}</tr>)}</tbody></table></div><p className="text-xs muted">Prediction-level rows shown here are for LSTM. Logistic Regression aggregate metrics are available under Model Evaluation.</p></div>}
    {tab==="Data & Methodology"&&<div className="space-y-4"><div><h2 className="text-xl font-semibold">Data & methodology</h2><p className="text-sm muted mt-1">What is represented in this dashboard and what remains unavailable.</p></div><div className="grid md:grid-cols-2 gap-4">
      <div className="panel p-5"><Database className="muted mb-3"/><div className="font-semibold mb-3">Verified dataset facts</div><ul className="text-sm muted space-y-2"><li>• Original market observations: 208</li><li>• BIG KINDS news records: 6,414</li><li>• Broad sentiment articles: 5,356</li><li>• Narrow sentiment articles: 4,680</li><li>• Aligned sentiment observations: 63</li><li>• Labelled experimental observations: 62 per configuration</li><li>• Target: next-session SMI return direction</li></ul></div>
      <div className="panel p-5"><FileText className="muted mb-3"/><div className="font-semibold mb-3">Evaluation protocol</div><ul className="text-sm muted space-y-2"><li>• Chronological 43 / 19 initial split</li><li>• Expanding-window walk-forward testing</li><li>• Five-session lookback</li><li>• Fold-specific scaler fitting</li><li>• LSTM and Logistic Regression</li><li>• Expanding-majority and always-positive baselines</li></ul></div>
     </div><div className="panel p-5"><div className="font-semibold mb-2">Availability and limitations</div><ul className="text-sm muted space-y-2">{summary.notes.map((n:string,i:number)=><li key={i}>• {n}</li>)}</ul><p className="text-xs muted mt-4">Market price history, daily sentiment charts and article-level news browsing are intentionally not shown until their source CSVs are connected. No synthetic observations are generated.</p></div></div>}
    </>}
    <footer className="border-t border-slate-800 mt-10 pt-5 text-xs muted flex flex-wrap justify-between gap-2"><span>Cross-Market Financial Sentiment Research Dashboard</span><span>Academic research visualization · Read-only</span></footer>
   </section>
  </div>
 </main>
}
