import { api } from './common';
import { API_ENDPOINTS } from './constants';

export type OrderVariety = 'NORMAL' | 'STOPLOSS' | 'ROBO' | 'AMO';
export type TransactionType = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOPLOSS_LIMIT' | 'STOPLOSS_MARKET';
export type ProductType = 'DELIVERY' | 'CARRYFORWARD' | 'MARGIN' | 'INTRADAY' | 'BO';
export type OrderDuration = 'DAY' | 'IOC';
export type Exchange = 'BSE' | 'NSE' | 'NFO' | 'MCX' | 'BFO' | 'CDS';

export interface OrderParams {
    variety: OrderVariety;
    tradingsymbol: string;
    symboltoken: string;
    transactiontype: TransactionType;
    exchange: Exchange;
    ordertype: OrderType;
    producttype: ProductType;
    duration: OrderDuration;
    price: number;
    quantity: number;
    squareoff?: number;
    stoploss?: number;
    triggerprice?: number;
    disclosedquantity?: number;
    ordertag?: string;
    scripconsent?: string;
}

export interface OrderResponseData {
    script: string;
    orderid: string;
    uniqueorderid: string;
}

export type OrderResponse = { status: true; message: string; errorcode: ''; data: OrderResponseData } | { status: false; message: string; errorcode: string; data: null };

export async function placeOrder(params: OrderParams): Promise<OrderResponse> {
    try {
        const response = await api.post<OrderResponse>(API_ENDPOINTS.placeOrder, params);
        return response.data;
    } catch (error) {
        console.error('Error placing order:', error);
        throw error;
    }
}
