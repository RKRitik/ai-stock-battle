import { api } from "./common";
import { API_ENDPOINTS } from "./constants";
import { MarketDataRequest, MarketDataResponse } from "./types";
import { Stock } from "../../schema";
import { ensureAuthenticated } from "./auth";

/**
 * Mapping of common tickers to Angel One symbol tokens.
 * This can be expanded or replaced by a dynamic fetch from the official JSON list.
 */
export const STOCK_MAP: Record<string, { token: string; symbol: string; name: string }> = {
    "HDFCBANK": { token: "1333", symbol: "HDFCBANK-EQ", name: "HDFC Bank Ltd" },
    "SBIN": { token: "3045", symbol: "SBIN-EQ", name: "State Bank of India" },
    "TCS": { token: "11536", symbol: "TCS-EQ", name: "Tata Consultancy Services Ltd" },
    "INFY": { token: "1594", symbol: "INFY-EQ", name: "Infosys Ltd" },
    "RELIANCE": { token: "2885", symbol: "RELIANCE-EQ", name: "Reliance Industries Ltd" },
    "ONGC": { token: "2475", symbol: "ONGC-EQ", name: "Oil & Natural Gas Corporation Ltd" },
    "TATAMOTORS": { token: "3456", symbol: "TATAMOTORS-EQ", name: "Tata Motors Ltd" },
    "MARUTI": { token: "10999", symbol: "MARUTI-EQ", name: "Maruti Suzuki India Ltd" },
    "ITC": { token: "1660", symbol: "ITC-EQ", name: "ITC Ltd" },
    "HINDUNILVR": { token: "1330", symbol: "HINDUNILVR-EQ", name: "Hindustan Unilever Ltd" },
    "TATASTEEL": { token: "3499", symbol: "TATASTEEL-EQ", name: "Tata Steel Ltd" },
    "BEL": { token: "383", symbol: "BEL-EQ", name: "Bharat Electronics Ltd" },
    "SUNPHARMA": { token: "3351", symbol: "SUNPHARMA-EQ", name: "Sun Pharmaceutical Industries Ltd" },
    "CIPLA": { token: "694", symbol: "CIPLA-EQ", name: "Cipla Ltd" },
    "ADANIPORTS": { token: "15083", symbol: "ADANIPORTS-EQ", name: "Adani Ports and Special Economic Zone Ltd" },
    "LT": { token: "11483", symbol: "LT-EQ", name: "Larsen & Toubro Ltd" },
    "BHARTIARTL": { token: "10604", symbol: "BHARTIARTL-EQ", name: "Bharti Airtel Ltd" },
    "ICICIBANK": { token: "4963", symbol: "ICICIBANK-EQ", name: "ICICI Bank Ltd" },
    "BAJFINANCE": { token: "317", symbol: "BAJFINANCE-EQ", name: "Bajaj Finance Ltd" },
};

export async function getAngelOneMarketData(): Promise<Stock[]> {
    await ensureAuthenticated();

    const tokens = Object.values(STOCK_MAP).map(s => s.token);

    const requestBody: MarketDataRequest = {
        mode: "FULL",
        exchangeTokens: {
            "NSE": tokens
        }
    };

    try {
        const response = await api.post<MarketDataResponse>(API_ENDPOINTS.marketData, requestBody);

        if (!response.data.status || !response.data.data) {
            console.error("Angel One Market Data Error:", response.data.message);
            return [];
        }

        const stocks: Stock[] = response.data.data.fetched.map(item => {
            // Find our local ticker from token
            const mapped = Object.entries(STOCK_MAP).find(([_, info]) => info.token === item.symbolToken);
            const ticker = mapped ? mapped[0] : item.tradingSymbol;
            const name = mapped ? mapped[1].name : item.tradingSymbol;

            return {
                ticker: ticker,
                stock_name: name,
                live_price: item.ltp,
                "day_change_%": item.percentChange || 0,
                "52_week_high": item["52WeekHigh"] || item.high || 0,
                "52_week_low": item["52WeekLow"] || item.low || 0,
                current_volume: item.volume || item.totalQtyTraded || 0,
                current_day_high: item.high,
                current_day_low: item.low,
                daily_average_volume: item.avgVolume || item.volume || 0,
                volatility: null,
                "p/e_ratio": null,
                eps: null
            };
        });

        return stocks;
    } catch (error: any) {
        console.error("Angel One API Error:", error.response?.data || error.message);
        return [];
    }
}
