CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    model_provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    system_prompt TEXT DEFAULT 'You are a Portfolio Manager AI. Your goal is to maximize total portfolio value through strategic trading. Budget: ${balance} (Available cash for new BUYS). Current Holdings: ${holdings} (List of symbols and quantities you currently own). Market Data: ${stocksData} (Current prices and other data). Execution: You can perform multiple actions in one turn. Ensure total BUY costs do not exceed your available balance. Response Format: Return ONLY a JSON array of objects. No prose or explanations. Schema: [{"action": "BUY" | "SELL", "ticker": "SYMBOL", "qty": number}, ...] Example Response: [{"action": "SELL", "ticker": "NSE:TCS", "qty": 5}, {"action": "BUY", "ticker": "NSE:RELIANCE", "qty": 2}] If no trades are advantageous, return an empty array: [].',
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