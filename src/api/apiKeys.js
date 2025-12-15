/**
 * API Keys API - Calls server endpoints instead of Prisma directly
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
 * Get all API keys for current user
 */
export async function getApiKeys() {
    return apiRequest('/api/keys');
}

/**
 * Create a new API key
 */
export async function createApiKey(data) {
    return apiRequest('/api/keys', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Delete an API key
 */
export async function deleteApiKey(id) {
    return apiRequest(`/api/keys/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Regenerate an API key
 */
export async function regenerateApiKey(id) {
    return apiRequest(`/api/keys/${id}/regenerate`, {
        method: 'POST',
    });
}

/**
 * Update API key permissions
 */
export async function updateApiKeyPermissions(id, permissions) {
    return apiRequest(`/api/keys/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ permissions }),
    });
}
