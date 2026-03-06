import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from './constants';

/**
 * Common headers for Angel One SmartAPI
 * Reference: https://smartapi.angelone.in/docs/
 */
const ANGEL_ONE_BASE_URL = 'https://apiconnect.angelone.in';

const getAngelOneHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
    };

    if (process.env.ANGELONE_CLIENT_LOCAL_IP) {
        headers['X-ClientLocalIP'] = process.env.ANGELONE_CLIENT_LOCAL_IP;
    }
    if (process.env.ANGELONE_CLIENT_PUBLIC_IP) {
        headers['X-ClientPublicIP'] = process.env.ANGELONE_CLIENT_PUBLIC_IP;
    }
    if (process.env.ANGELONE_MAC_ADDRESS) {
        headers['X-MACAddress'] = process.env.ANGELONE_MAC_ADDRESS;
    }
    return headers;
};

export const api = axios.create({
    baseURL: ANGEL_ONE_BASE_URL,
    headers: getAngelOneHeaders(),
});

// in memory cache
export const angelSession = {
    jwtToken: '',
    feedToken: '',
    refreshToken: '',
};

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (process.env.ANGEL_ONE_API_KEY) {
            config.headers['X-PrivateKey'] = process.env.ANGEL_ONE_API_KEY;
        }

        const auth = angelSession.jwtToken;
        if (config.url?.includes(API_ENDPOINTS.generateToken)) {
            config.data = { "refreshToken": angelSession.refreshToken };
        }
        if (auth && typeof auth === 'string' && !auth.startsWith('Bearer ')) {
            config.headers['Authorization'] = `Bearer ${auth}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for common error handling
api.interceptors.response.use(
    (response) => {
        if ((response.config.url?.includes(API_ENDPOINTS.login) || response.config.url?.includes(API_ENDPOINTS.generateToken)) && response.data.status) {
            const tokenData = response.data.data;
            angelSession.jwtToken = tokenData.jwtToken;
            angelSession.refreshToken = tokenData.refreshToken;
            angelSession.feedToken = tokenData.feedToken;
        }
        return response
    },
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            console.error('Angel One API: Session expired or Unauthorized. Clearing session...');
            angelSession.jwtToken = '';
            angelSession.refreshToken = '';
            angelSession.feedToken = '';
        } else if (status === 429) {
            console.error('Angel One API: Rate limit exceeded.');
        }
        return Promise.reject(error);
    }
);