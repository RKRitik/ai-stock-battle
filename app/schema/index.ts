import z from "zod";

const naToNull = (val: any) => (val === "#N/A" || val === null ? null : val);

export const stocksSchema = z.object({
    ticker: z.string(),
    stock_name: z.string(),
    live_price: z.coerce.number(),
    "day_change_%": z.coerce.number(),
    "52_week_high": z.coerce.number(),
    "52_week_low": z.coerce.number(),
    current_volume: z.coerce.number(),
    daily_average_volume: z.coerce.number(),
    volatility: z.coerce.number(),
    "p/e_ratio": z.preprocess(naToNull, z.coerce.number().nullable()),
    eps: z.preprocess(naToNull, z.coerce.number().nullable()),
});

export const stocksResponseSchema = z.array(stocksSchema);

export type Stock = z.infer<typeof stocksSchema>;
export type StocksResponse = z.infer<typeof stocksResponseSchema>;

////// --------------------------------- /////

export const agentSchema = z.object({
    id: z.string(),
    name: z.string(),
    model_provider: z.enum(['google', 'openai', 'groq']),
    model_id: z.string(),
    system_prompt: z.string(),
    active: z.boolean(),
    balance: z.coerce.number(),
    max_stocks: z.number(),
    created_at: z.coerce.date(),
});

export type Agent = z.infer<typeof agentSchema>;
export type AgentsResponse = z.infer<typeof agentSchema>;

////// --------------------------------- /////

export const holdingSchema = z.object({
    agent_id: z.string(),
    symbol: z.string(),
    qty: z.number(),
    avg_buy_price: z.number()
});

export type Holding = z.infer<typeof holdingSchema>;
export type HoldingsResponse = z.infer<typeof holdingSchema>;

////// --------------------------------- /////

export const transactionSchema = z.object({
    id: z.number(),
    agent_id: z.string(),
    symbol: z.string(),
    side: z.string(),
    qty: z.number(),
    price: z.number(),
    time: z.coerce.date(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionsResponse = z.infer<typeof transactionSchema>;

export const transactionsWithAgentSchema = transactionSchema.extend({
    name: z.string(),
});

export type TransactionsWithAgent = z.infer<typeof transactionsWithAgentSchema>;
export type TransactionsWithAgentResponse = z.infer<typeof transactionsWithAgentSchema>;


//////// --------------------------------- /////

export const agentResponseSchema = z.array(z.object({
    action: z.enum(["BUY", "SELL"]),
    ticker: z.string(),
    allocation: z.number().min(0).max(100), // percentage based
}))
export type AgentResponse = z.infer<typeof agentResponseSchema>;

////// --------------------------------- /////

export const holdingsHistorySchema = z.object({
    id: z.number(),
    agent_id: z.string(),
    balance: z.coerce.number(),
    stocks_price: z.coerce.number(),
    time: z.coerce.date(),
});

export type HoldingsHistory = z.infer<typeof holdingsHistorySchema>;

//////// ------------------------------- /////
export interface HistoryRow {
    name: string;
    balance: number;
    stocks_price: number;
    time: Date;
}


////// --------------------------------- /////

const outputLogsSchema = z.object({
    id: z.number(),
    agent_id: z.string(),
    output: z.string(),
    created_at: z.coerce.date(),
});

// export type Output = z.infer<typeof outputLogsSchema>;
// export type OutputResponse = z.infer<typeof outputLogsSchema>;

export const outputsWithAgentSchema = outputLogsSchema.extend({
    name: z.string(),
});

// export type OutputWithAgent = z.infer<typeof transactionsWithAgentSchema>;
// export type OutputWithAgentResponse = z.infer<typeof transactionsWithAgentSchema>;