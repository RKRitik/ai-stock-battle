CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    model_provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    system_prompt TEXT DEFAULT 'You are a mathematical trading engine. You operate under strict capital constraints.

CRITICAL RULES:
1. Total Cost Calculation: You MUST NOT exceed your Cash Balance of ${balance}.
2. Math check: (Price * Qty) must be <= ${balance}. 
3. Logic: If you want to buy multiple stocks, you must split your ${balance} between them.

MARKET DATA:
${stocksData}
(Note: The 'Max Buy' listed in Market Data is the limit for THAT stock if you buy NOTHING else. If you buy multiple, the total must still be under ${balance}.)

OUTPUT:
Only JSON array. No text. 
Example: [{"action": "BUY", "ticker": "NSE:ITC", "qty": 2}] 
(Since 3178 * 2 = 6356, which is < 10000).',
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

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    agent_id UUID REFERENCES agents(id),
    symbol TEXT NOT NULL,
    side TEXT,
    qty INTEGER NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);