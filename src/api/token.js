/**
 * Token storage utility for JWT auth.
 * Stores in localStorage so tokens persist across page refreshes,
 * even when cross-site cookies are blocked by the browser.
 */

const TOKEN_KEY = 'auth_token';

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token) {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        }
    } catch {
        // localStorage unavailable (e.g., incognito in some browsers)
    }
}

export function removeToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch {
        // ignore
    }
}
