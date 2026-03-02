/**
 * Clicks API - Calls server endpoints instead of Prisma directly
 */
import { getToken } from './token';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }
    return data;
}

/**
 * Record a click
 */
export async function recordClick(urlId, clickData) {
    return apiRequest('/api/clicks', {
        method: 'POST',
        body: JSON.stringify({ urlId, ...clickData }),
    });
}

/**
 * Get clicks for a URL
 */
export async function getClicksForUrl(urlId) {
    return apiRequest(`/api/clicks/url/${urlId}`);
}

/**
 * Get clicks for multiple URLs
 */
export async function getClicksForUrls(urlIds) {
    if (!urlIds || urlIds.length === 0) return [];
    try {
        const results = await Promise.all(
            urlIds.map(id => apiRequest(`/api/clicks/url/${id}`).catch(() => []))
        );
        return results.flat();
    } catch {
        return [];
    }
}

/**
 * Get click analytics summary
 */
export async function getClickAnalytics(urlId) {
    return apiRequest(`/api/clicks/analytics/${urlId}`);
}

/**
 * Get clicks by date range
 */
export async function getClicksByDateRange(urlId, startDate, endDate) {
    return apiRequest(`/api/clicks/url/${urlId}?startDate=${startDate}&endDate=${endDate}`);
}

/**
 * Get geographic analytics
 */
export async function getGeoAnalytics(urlId) {
    return apiRequest(`/api/clicks/analytics/${urlId}`).then(d => d.countryStats || []);
}

/**
 * Get device analytics
 */
export async function getDeviceAnalytics(urlId) {
    return apiRequest(`/api/clicks/analytics/${urlId}`).then(d => d.deviceStats || []);
}

/**
 * Get referrer analytics
 */
export async function getReferrerAnalytics(urlId) {
    return apiRequest(`/api/clicks/analytics/${urlId}`).then(d => d.referrerStats || []);
}
