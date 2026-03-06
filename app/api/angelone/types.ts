type AngelApiWrapper<T> = { status: true; message: string; errorcode: ''; data: T } | { status: false; message: string; errorcode: string; data: null };

export type LoginResponse = AngelApiWrapper<{ jwtToken: string; refreshToken: string; feedToken: string; state: unknown; }>;

export type ProfileResponse = AngelApiWrapper<{ clientcode: string; name: string; email: string; mobileno: string; exchanges: string[]; products: string[]; lastlogintime: string; broker: string; }>;

export interface MarketDataRequest {
    mode: 'LTP' | 'FULL' | 'OHLC';
    exchangeTokens: {
        [key: string]: string[];
    };
}

export interface MarketDataItemLTP {
    exchange: string;
    tradingSymbol: string;
    symbolToken: string;
    ltp: number;
}

export interface MarketDataItemOHLC extends MarketDataItemLTP {
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface MarketDataItemFULL extends MarketDataItemOHLC {
    volume: number;
    percentChange: number;
    tradeVolume?: number;
    avgPrice?: number;
    netChange?: number;
    totBuyQuan?: number;
    totSellQuan?: number;
    upperCircuit?: number;
    lowerCircuit?: number;
    "52WeekHigh"?: number;
    "52WeekLow"?: number;
}

export type MarketDataResponse = AngelApiWrapper<{
    fetched: MarketDataItemFULL[]; // Defaulting to FULL as it's the most common use case in this app
    unfetched: {
        exchange: string;
        symbolToken: string;
    }[];
}>;
