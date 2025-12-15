/**
 * Link Health Monitoring API
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
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
 * Get health history for a URL
 */
export async function getHealthHistory(urlId, limit = 10) {
    return apiRequest(`/api/link-health/url/${urlId}?limit=${limit}`);
}

/**
 * Get latest health status for a URL
 */
export async function getLatestHealth(urlId) {
    return apiRequest(`/api/link-health/url/${urlId}/latest`);
}

/**
 * Get all unhealthy links for a user
 */
export async function getUnhealthyLinks(userId) {
    return apiRequest(`/api/link-health/unhealthy?userId=${userId}`);
}

/**
 * Manually trigger health check for a URL
 */
export async function checkHealth(urlId) {
    return apiRequest(`/api/link-health/check/${urlId}`, {
        method: 'POST',
    });
}

/**
 * Trigger health check for all user URLs
 */
export async function checkAllHealth(userId) {
    return apiRequest('/api/link-health/check-all', {
        method: 'POST',
        body: JSON.stringify({ userId }),
    });
}

/**
 * Get health summary for user
 */
export async function getHealthSummary(userId) {
    return apiRequest(`/api/link-health/summary?userId=${userId}`);
}
