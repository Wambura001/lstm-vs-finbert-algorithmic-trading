# src/backtester/engine.py
import numpy as np

def run_friction_backtest(predictions, actual_returns, fee=0.0010, slippage=0.0002):
    """
    Production-grade execution simulator computing friction-adjusted equity curves.
    """
    capital_history = [1.0]
    current_position = 0
    total_trades = 0
    
    for t in range(len(predictions)):
        ai_signal = predictions[t]
        market_return = actual_returns[t]
        previous_capital = capital_history[-1]
        
        if ai_signal == 1:
            if current_position == 0:
                # Buy order transaction costs
                net_capital = previous_capital * (1.0 - (fee + slippage))
                new_capital = net_capital * (1.0 + market_return)
                current_position = 1
                total_trades += 1
            else:
                new_capital = previous_capital * (1.0 + market_return)
        else:
            if current_position == 1:
                # Sell order transaction costs
                new_capital = previous_capital * (1.0 - (fee + slippage))
                current_position = 0
                total_trades += 1
            else:
                new_capital = previous_capital
                
        capital_history.append(new_capital)
        
    strategy_curve = np.array(capital_history[1:])
    benchmark_curve = np.cumprod(1.0 + actual_returns)
    
    return strategy_curve, benchmark_curve, total_trades
