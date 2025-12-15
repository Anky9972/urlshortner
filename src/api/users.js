/**
 * Users API - Calls server endpoints instead of Prisma directly
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
 * Get user by ID
 */
export async function getUser(id) {
    return apiRequest(`/api/users/${id}`);
}

/**
 * Get user stats
 */
export async function getUserStats(id) {
    return apiRequest(`/api/users/${id}/stats`);
}

/**
 * Update user profile
 */
export async function updateUser(id, data) {
    return apiRequest(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Get user dashboard data
 */
export async function getUserDashboard(id) {
    return apiRequest(`/api/users/${id}/dashboard`);
}
