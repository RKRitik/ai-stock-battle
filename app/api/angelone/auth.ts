import { api } from "./common";
import { API_ENDPOINTS } from "./constants";
import { LoginResponse, ProfileResponse } from "./types";

export async function login(totp: string) {
    const body = {
        clientcode: process.env.ANGEL_ONE_CLIENT_ID,
        password: process.env.ANGEL_ONE_APP_PASSWORD,
        totp,
    }
    return api.post<LoginResponse>(API_ENDPOINTS.login, JSON.stringify(body))
        .catch(e => {
            console.log({ e });
        })
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