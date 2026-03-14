import { api } from './common';
import { API_ENDPOINTS } from './constants';

export type BrokerageProductType = 'DELIVERY' | 'CARRYFORWARD' | 'MARGIN' | 'INTRADAY' | 'BO';
export type BrokerageTransactionType = 'BUY' | 'SELL';
export type BrokerageExchange = 'BSE' | 'NSE';

export interface BrokerageOrder {
    product_type: BrokerageProductType;
    transaction_type: BrokerageTransactionType;
    quantity: string;
    price: string;
    exchange: BrokerageExchange;
    symbol_name: string;
    token: string;
}

export interface BrokerageRequest {
    orders: BrokerageOrder[];
}

export interface BrokerageBreakup {
    name: string;
    amount: number;
    msg: string;
    breakup?: BrokerageBreakup[];
}

export interface BrokerageSummary {
    total_charges: number;
    trade_value: number;
    breakup: BrokerageBreakup[];
}

export interface BrokerageData {
    summary: BrokerageSummary;
}

export type BrokerageResponse = { status: true; message: string; errorcode: ''; data: BrokerageData } | { status: false; message: string; errorcode: string; data: null };

export async function estimateCharges(orders: BrokerageOrder[]): Promise<BrokerageResponse> {
    try {
        const request: BrokerageRequest = { orders };
        const response = await api.post<BrokerageResponse>(API_ENDPOINTS.brokerage, request);
        return response.data;
    } catch (error) {
        console.error('Error estimating charges:', error);
        throw error;
    }
}
