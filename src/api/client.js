// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Base API client with credentials support for HTTP-only cookies
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    const config = {
        ...options,
        credentials: 'include', // Important for cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

// Auth API
export const authApi = {
    async register({ name, email, password }) {
        return apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    },

    async login({ email, password }) {
        return apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    async logout() {
        return apiRequest('/api/auth/logout', {
            method: 'POST',
        });
    },

    async getCurrentUser() {
        try {
            const data = await apiRequest('/api/auth/me');
            return data.user;
        } catch {
            return null;
        }
    },

    async updateProfile({ name, avatarUrl }) {
        return apiRequest('/api/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify({ name, avatarUrl }),
        });
    },

    async changePassword({ currentPassword, newPassword }) {
        return apiRequest('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    },
};

// URLs API
export const urlsApi = {
    async getAll(userId) {
        return apiRequest(`/api/urls?userId=${userId}`);
    },

    async create(data) {
        return apiRequest('/api/urls', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id, data) {
        return apiRequest(`/api/urls/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    async delete(id) {
        return apiRequest(`/api/urls/${id}`, {
            method: 'DELETE',
        });
    },

    async getByShortUrl(shortUrl) {
        return apiRequest(`/api/urls/short/${shortUrl}`);
    },
};

// Folders API
export const foldersApi = {
    async getAll(userId) {
        return apiRequest(`/api/folders?userId=${userId}`);
    },

    async create(data) {
        return apiRequest('/api/folders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async delete(id) {
        return apiRequest(`/api/folders/${id}`, {
            method: 'DELETE',
        });
    },
};

// Clicks API
export const clicksApi = {
    async getByUrl(urlId) {
        return apiRequest(`/api/clicks/url/${urlId}`);
    },

    async record(data) {
        return apiRequest('/api/clicks', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// User Stats API
export const userApi = {
    async getStats(userId) {
        return apiRequest(`/api/users/${userId}/stats`);
    },
};

export default { authApi, urlsApi, foldersApi, clicksApi, userApi };
