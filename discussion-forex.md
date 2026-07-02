# Discussion: TradingAgents Setup & Forex Auto Trading Research
**Date:** 2026-07-01

---

## 1. TradingAgents Repo Setup

**Repo:** https://github.com/TauricResearch/TradingAgents  
**Local path:** `/Applications/Sites/TradingAgents`

### Installation
```bash
python3 -m venv .venv
.venv/bin/pip install .
cp .env.example .env
```

### Current .env Config
Real values live in `/Applications/Sites/TradingAgents/.env` (gitignored there, not committed).
```
GROQ_API_KEY=<see .env>
OPENROUTER_API_KEY=<see .env>
ALPHA_VANTAGE_API_KEY=<see .env>

TRADINGAGENTS_LLM_PROVIDER=groq
TRADINGAGENTS_DEEP_THINK_LLM=meta-llama/llama-4-scout-17b-16e-instruct
TRADINGAGENTS_QUICK_THINK_LLM=meta-llama/llama-4-scout-17b-16e-instruct
TRADINGAGENTS_MAX_TOKENS=8192
```

### How to Run (CLI)
```bash
cd /Applications/Sites/TradingAgents
.venv/bin/tradingagents
```
Prompts you need to answer:
1. **Ticker** — type symbol (e.g. `AAPL`, `XAUUSD`, `EURUSD`)
2. **Date** — press Enter for today
3. **Language** — press Enter for English
4. **Analysts** — press `a` to select all, then Enter
5. Provider/models/depth → auto-skipped from `.env`

---

## 2. Supported Ticker Symbols

| You type | Maps to | Asset |
|---|---|---|
| `XAUUSD` or `GOLD` | `GC=F` | Gold futures |
| `XAGUSD` or `SILVER` | `SI=F` | Silver futures |
| `USOIL` or `WTI` | `CL=F` | WTI Crude Oil |
| `BRENT` or `UKOIL` | `BZ=F` | Brent Crude |
| `EURUSD` | `EURUSD=X` | Forex |
| `BTC-USD` or `BTCUSD` | `BTC-USD` | Bitcoin |
| `NAS100` or `US100` | `^NDX` | Nasdaq 100 |
| `SPX500` or `US500` | `^GSPC` | S&P 500 |
| `AAPL`, `NVDA`, etc. | unchanged | US stocks |
| `0700.HK` | unchanged | HK stocks |

---

## 3. Analysis Date

- Use **today's date** for a live trading decision (default when you press Enter)
- Use a **past date** for backtesting
- Avoid weekends and market holidays

---

## 4. What TradingAgents Does (and Doesn't Do)

**Does:**
- Multi-agent LLM analysis: Market → Sentiment → News → Fundamentals → Researcher debate → Trader → Risk Mgmt → Portfolio Manager
- Outputs BUY / SELL / HOLD decision with detailed reasoning

**Does NOT:**
- Connect to any broker
- Place or execute orders
- Run on a schedule automatically
- Manage a real portfolio

---

## 5. Connecting to MT5 for Auto Trading

Technically possible but needs a custom bridge script:

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
import MetaTrader5 as mt5

ta = TradingAgentsGraph(config=DEFAULT_CONFIG.copy())
_, decision = ta.propagate("XAUUSD", "2026-07-01")

action = decision.strip().upper()  # BUY / SELL / HOLD

mt5.initialize()
if action == "BUY":
    mt5.order_send(...)
elif action == "SELL":
    mt5.order_send(...)
```

**Caveat:** `MetaTrader5` Python package only works on **Windows**. On macOS you need a Windows VM or VPS.

---

## 6. Open Source AI Trading Repos (with Auto Execution)

| Repo | LLM | Auto Trade | Broker |
|---|---|---|---|
| [Itachi-Uchiha581/Auto-Trader](https://github.com/Itachi-Uchiha581/Auto-Trader) | Yes | Yes | Various |
| [fsaavedra0003/Agentic-AI-Trading-Bot](https://github.com/fsaavedra0003/Agentic-AI-Trading-Bot-with-LLM-reasoning-sentiment-analysis) | Yes | Yes | Alpaca, Binance |
| [python-telegramBot/ai-auto-trading](https://github.com/python-telegramBot/ai-auto-trading) | Yes (DeepSeek, Grok, Claude) | Yes | Binance, Gate.io |
| [Drakkar-Software/OctoBot](https://github.com/drakkar-software/octobot) | Yes (ChatGPT mode) | Yes | 15+ exchanges |
| [ilahuerta-IA/mt5_live_trading_bot](https://github.com/ilahuerta-IA/mt5_live_trading_bot) | No | Yes | MT5 (XAUUSD) |
| [zero-was-here/tradingbot](https://github.com/zero-was-here/tradingbot) | DRL (not LLM) | Yes | MT5 (XAUUSD) |

**Recommended approach:** Use TradingAgents as the analysis engine (best quality), borrow the broker execution layer from `fsaavedra0003/Agentic-AI-Trading-Bot`, build your own GUI on top.

---

## 7. Issues Encountered During Setup

| Issue | Fix |
|---|---|
| OpenRouter free tier — DeepSeek R1 removed from free | Switched to `qwen/qwen3-coder:free` |
| OpenRouter free models rate-limited | Switched to Groq |
| Groq `llama-3.3-70b-versatile` 12k TPM limit exceeded (23k tokens) | Switched to `meta-llama/llama-4-scout-17b-16e-instruct` |
| `max_tokens=65535` default exceeded credit ceiling | Added `TRADINGAGENTS_MAX_TOKENS=8192` support to the repo |

### Code changes made to this repo
- `tradingagents/llm_clients/openai_client.py` — added `max_tokens` to `_PASSTHROUGH_KWARGS`
- `tradingagents/default_config.py` — added `max_tokens` config key + `TRADINGAGENTS_MAX_TOKENS` env override
- `tradingagents/graph/trading_graph.py` — forward `max_tokens` from config to LLM client via `_get_provider_kwargs()`

---

## 8. Test Result — AAPL 2026-07-01

**Model:** `meta-llama/llama-4-scout-17b-16e-instruct` via Groq  
**Decision: HOLD**

| Agent | Finding |
|---|---|
| Market Analyst | Neutral to slightly bearish, moderate volatility |
| Sentiment Analyst | Bullish (StockTwits 43% bullish, AI/iPhone optimism) |
| Fundamentals Analyst | Strong fundamentals → BUY signal |
| News Analyst | Mixed (Epic Games lawsuit risk, AI/supply chain positives) |
| Final (Portfolio Manager) | Cautious → **HOLD** |
