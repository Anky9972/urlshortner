/**
 * Webhooks API - Calls server endpoints instead of Prisma directly
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
 * Get all webhooks for current user
 */
export async function getWebhooks() {
    return apiRequest('/api/webhooks');
}

/**
 * Create a webhook
 */
export async function createWebhook(data) {
    return apiRequest('/api/webhooks', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update a webhook
 */
export async function updateWebhook(id, data) {
    return apiRequest(`/api/webhooks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(id) {
    return apiRequest(`/api/webhooks/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Test a webhook
 */
export async function testWebhook(id) {
    return apiRequest(`/api/webhooks/${id}/test`, {
        method: 'POST',
    });
}
