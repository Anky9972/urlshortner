/**
 * A/B Split Testing API
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
 * Get split destinations for a URL
 */
export async function getSplits(urlId) {
    return apiRequest(`/api/splits/url/${urlId}`);
}

/**
 * Create a new split destination
 */
export async function createSplit(data) {
    return apiRequest('/api/splits', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update a split destination
 */
export async function updateSplit(id, data) {
    return apiRequest(`/api/splits/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a split destination
 */
export async function deleteSplit(id) {
    return apiRequest(`/api/splits/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Record a click on a split (called during redirect)
 */
export async function recordSplitClick(splitId) {
    return apiRequest(`/api/splits/${splitId}/click`, {
        method: 'POST',
    });
}

/**
 * Get redirect destination for A/B test
 */
export async function getSplitRedirect(urlId) {
    return apiRequest(`/api/splits/url/${urlId}/redirect`);
}

/**
 * Get split statistics for a URL
 */
export async function getSplitStats(urlId) {
    return apiRequest(`/api/splits/url/${urlId}/stats`);
}
