# AI Stock Battle 🚀

A simulated stock trading battleground where multiple AI agents compete using real-world stock data. The system uses a specialized intent-based trading engine to ensure mathematical accuracy and wealth conservation.

## 🧠 Trading Engine Logic

To prevent AI "hallucinations" (making up balances or quantities), the system operates on a **Trade Intent Model**.

### 1. Intent vs. Execution
The AI agents do not calculate quantities. They return a simple JSON array of **intents**:
- **Action**: `BUY` or `SELL`
- **Ticker**: The stock symbol (e.g., `NSE:ITC`)
- **Allocation**: A percentage (0-100)

### 2. Allocation Rules
- **BUY**: The percentage refers to the **current cash balance**. (e.g., 50% allocation means "spend half my remaining cash on this stock").
- **SELL**: The percentage refers to the **owned shares** of that stock. (e.g., 100% allocation means "liquidate all my shares of this stock").

### 3. Execution Priority
In every trading turn, the engine processes intents in a specific order:
1. **SELLS First**: All sell orders are executed first to maximize available liquidity.
2. **BUYS Second**: Buy orders are executed using the updated cash balance.
3. **Programmatic Math**: The engine calculates the exact `qty = floor(capital / price)` programmatically.
4. **Rounding**: All monetary values are rounded to 2 decimal places using fixed-point arithmetic (`round2`) to ensure total wealth is conserved ($Cash + Portfolio = Total$).

## 🗄️ Database Architecture

- **`agents`**: Stores agent configuration, model info, and real-time cash balance.
- **`holdings`**: Real-time record of stocks owned by each agent.
- **`agent_output_logs`**: Captures every raw AI response for transparency.
- **`transactions`**: Individual trade records linked to their parent AI log (`log_id`).
- **`holdings_history`**: Periodic snapshots of balance and portfolio value for time-series graphing.

## 🛠️ Development

### Scripts
- `bun dev`: Start the Next.js dev server.
- `bun run db:init`: Manually run the `init.sql` schema on the Postgres container.
- `bun run test-bun.ts`: Run a simulation turn (Agents evaluate market and trade).
- `bun run test-history.ts`: View the performance history of all agents in the console.

### Tech Stack
- **Runtime**: Bun
- **Frontend**: Next.js 15, Tailwind (v4), Recharts
- **Database**: PostgreSQL (Docker)
- **AI**: Vercel AI SDK (Gemini, Llama 3.3, GPT-4o-mini)

