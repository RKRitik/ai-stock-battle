type AngelApiWrapper<T> = { status: true; message: string; errorcode: ''; data: T } | { status: false; message: string; errorcode: string; data: null };

export type LoginResponse = AngelApiWrapper<{ jwtToken: string; refreshToken: string; feedToken: string; state: unknown; }>;

export type ProfileResponse = AngelApiWrapper<{ clientcode: string; name: string; email: string; mobileno: string; exchanges: string[]; products: string[]; lastlogintime: string; broker: string; }>;

export interface MarketDataRequest {
    mode: 'LTP' | 'FULL' | 'OHLC';
    exchangeTokens: {
        [key: string]: string[];
    };
}

export type MarketDataResponse = AngelApiWrapper<{
    fetched: {
        exchange: string;
        tradingSymbol: string;
        symbolToken: string;
        ltp: number;
        open: number;
        high: number;
        low: number;
        close: number;
        percentChange: number;
        volume: number;
        // more fields in FULL mode
    }[];
    unfetched: unknown[];
}>;
