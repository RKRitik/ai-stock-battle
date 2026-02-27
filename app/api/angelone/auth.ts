import { api } from "./common";
import { API_ENDPOINTS } from "./constants";
import { LoginResponse, ProfileResponse } from "./types";

export async function login() {
    // Dynamic import to avoid Next.js compilation issues on Windows
    const { generate } = await import("otplib");

    const secret = process.env.ANGEL_ONE_CLIENT_SECRET;
    if (!secret) {
        throw new Error("ANGEL_ONE_CLIENT_SECRET is missing in .env");
    }

    const totp = await generate({ secret });

    const body = {
        clientcode: process.env.ANGEL_ONE_CLIENT_ID,
        password: process.env.ANGEL_ONE_APP_PASSWORD,
        totp,
    }
    return api.post<LoginResponse>(API_ENDPOINTS.login, JSON.stringify(body))
        .then(response => {
            if (response.data.status) {
                console.info("Angel One: Login successful");
            } else {
                console.error("Angel One: Login failed", response.data.message);
            }
            return response;
        })
        .catch(e => {
            console.log("Angel One: Login Error", e.response?.data || e.message);
            throw e;
        })
}

export async function ensureAuthenticated() {
    const { angelSession } = await import("./common");
    if (!angelSession.jwtToken) {
        console.info("Angel One: No session found, logging in...");
        await login();
    }
}

export async function generateToken() {
    return api.post<LoginResponse>(API_ENDPOINTS.generateToken)
        .catch(e => {
            console.log({ e });
        })
}


export function getProfile() {
    api.get<ProfileResponse>(API_ENDPOINTS.profile).then(response => {
        console.log({ response: response.data });
    }).catch(e => {
        console.log({ e });
    })
}
