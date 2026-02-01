CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    model_provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    system_prompt TEXT DEFAULT 'You are a trading engine. Return ONLY a JSON array of trade intents.Each object must contain:
- "action": "BUY" or "SELL"
- "ticker": stock symbol
- "allocation": percentage of available capital (for BUY) OR percentage of current holdings (for SELL). Rules: BUY allocations are % of cash balance. SELL allocations are % of owned shares of that stock. Percentages must be between 0 and 100. Do NOT output quantity. Do NOT output explanations. MARKET DATA: ${stocksData}
HOLDINGS:
${holdings}
CURRENT BALANCE:
${balance}
Example:
[
  {"action": "BUY", "ticker": "NSE:ITC", "allocation": 40},
  {"action": "SELL", "ticker": "NSE:ONGC", "allocation": 50}
]',
    active BOOLEAN DEFAULT TRUE,
    balance DECIMAL(15, 2) DEFAULT 10000.00 CHECK (balance >= 0),
    max_stocks INTEGER DEFAULT 16 CHECK (max_stocks >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holdings (
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    qty INTEGER DEFAULT 0 CHECK (qty >= 0),
    PRIMARY KEY (agent_id, symbol)
);

CREATE TABLE IF NOT EXISTS agent_output_logs (
    id SERIAL PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    output TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    log_id INTEGER REFERENCES agent_output_logs(id) ON DELETE SET NULL,
    symbol TEXT NOT NULL,
    side TEXT,
    qty INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holdings_history (
    id SERIAL PRIMARY KEY,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) NOT NULL,
    stocks_price DECIMAL(15, 2) NOT NULL,
    time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_holdings_history_agent_timestamp ON holdings_history(agent_id, time);

CREATE OR REPLACE FUNCTION record_initial_holdings_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO holdings_history (agent_id, balance, stocks_price, time)
    VALUES (NEW.id, NEW.balance, 0.00, NEW.created_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_agent_created
AFTER INSERT ON agents
FOR EACH ROW
EXECUTE FUNCTION record_initial_holdings_history();