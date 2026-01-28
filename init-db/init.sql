CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    model_provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    system_prompt TEXT DEFAULT 'You are an ai model tasked with maximizing profit for your portfolio. You can BUY/SELL/HOLD stocks based on the market data provided to you.',
    active BOOLEAN DEFAULT TRUE,
    balance DECIMAL(15, 2) DEFAULT 10000.00 CHECK (balance >= 0),
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