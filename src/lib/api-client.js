/**
 * API Client - Frontend HTTP client for Express server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // URL Methods
    async getUrls(userId) {
        return this.request(`/urls?userId=${userId}`);
    }

    async getUrl(id, userId) {
        return this.request(`/urls/${id}?userId=${userId}`);
    }

    async getRedirectUrl(shortUrl) {
        return this.request(`/urls/redirect/${shortUrl}`);
    }

    async createUrl(data) {
        return this.request('/urls', {
            method: 'POST',
            body: data,
        });
    }

    async updateUrl(id, data) {
        return this.request(`/urls/${id}`, {
            method: 'PATCH',
            body: data,
        });
    }

    async deleteUrl(id) {
        return this.request(`/urls/${id}`, { method: 'DELETE' });
    }

    async bulkDeleteUrls(ids) {
        return this.request('/urls/bulk-delete', {
            method: 'POST',
            body: { ids },
        });
    }

    async addTargetingRule(urlId, rule) {
        return this.request(`/urls/${urlId}/targeting`, {
            method: 'POST',
            body: rule,
        });
    }

    async getTargetingRules(urlId) {
        return this.request(`/urls/${urlId}/targeting`);
    }

    async deleteTargetingRule(ruleId) {
        return this.request(`/urls/targeting/${ruleId}`, { method: 'DELETE' });
    }

    // Click Methods
    async recordClick(data) {
        return this.request('/clicks', {
            method: 'POST',
            body: data,
        });
    }

    async getClicksForUrl(urlId) {
        return this.request(`/clicks/url/${urlId}`);
    }

    async getClicksForUrls(urlIds) {
        return this.request('/clicks/bulk', {
            method: 'POST',
            body: { urlIds },
        });
    }

    async getUrlAnalytics(urlId, days = 30) {
        return this.request(`/clicks/analytics/${urlId}?days=${days}`);
    }

    async getDashboardAnalytics(userId, days = 30) {
        return this.request(`/clicks/dashboard/${userId}?days=${days}`);
    }

    // Folder Methods
    async getFolders(userId) {
        return this.request(`/folders?userId=${userId}`);
    }

    async createFolder(data) {
        return this.request('/folders', {
            method: 'POST',
            body: data,
        });
    }

    async updateFolder(id, data) {
        return this.request(`/folders/${id}`, {
            method: 'PATCH',
            body: data,
        });
    }

    async deleteFolder(id) {
        return this.request(`/folders/${id}`, { method: 'DELETE' });
    }

    async moveUrlToFolder(urlId, folderId) {
        return this.request('/folders/move-url', {
            method: 'POST',
            body: { urlId, folderId },
        });
    }

    // Tag Methods
    async getTags() {
        return this.request('/folders/tags');
    }

    async createTag(data) {
        return this.request('/folders/tags', {
            method: 'POST',
            body: data,
        });
    }

    async deleteTag(id) {
        return this.request(`/folders/tags/${id}`, { method: 'DELETE' });
    }

    async addTagToUrl(urlId, tagId) {
        return this.request('/folders/tags/add-to-url', {
            method: 'POST',
            body: { urlId, tagId },
        });
    }

    async removeTagFromUrl(urlId, tagId) {
        return this.request('/folders/tags/remove-from-url', {
            method: 'DELETE',
            body: { urlId, tagId },
        });
    }

    // User Methods
    async authUser(data) {
        return this.request('/users/auth', {
            method: 'POST',
            body: data,
        });
    }

    async getUser(id) {
        return this.request(`/users/${id}`);
    }

    async getUserBySupabaseId(supabaseId) {
        return this.request(`/users/supabase/${supabaseId}`);
    }

    async updateUser(id, data) {
        return this.request(`/users/${id}`, {
            method: 'PATCH',
            body: data,
        });
    }

    async getUserStats(id) {
        return this.request(`/users/${id}/stats`);
    }

    // API Key Methods
    async getApiKeys(userId) {
        return this.request(`/keys?userId=${userId}`);
    }

    async createApiKey(data) {
        return this.request('/keys', {
            method: 'POST',
            body: data,
        });
    }

    async toggleApiKey(id, isActive) {
        return this.request(`/keys/${id}/toggle`, {
            method: 'PATCH',
            body: { isActive },
        });
    }

    async deleteApiKey(id) {
        return this.request(`/keys/${id}`, { method: 'DELETE' });
    }

    // Webhook Methods
    async getWebhooks(userId) {
        return this.request(`/webhooks?userId=${userId}`);
    }

    async createWebhook(data) {
        return this.request('/webhooks', {
            method: 'POST',
            body: data,
        });
    }

    async updateWebhook(id, data) {
        return this.request(`/webhooks/${id}`, {
            method: 'PATCH',
            body: data,
        });
    }

    async toggleWebhook(id, isActive) {
        return this.request(`/webhooks/${id}/toggle`, {
            method: 'PATCH',
            body: { isActive },
        });
    }

    async deleteWebhook(id) {
        return this.request(`/webhooks/${id}`, { method: 'DELETE' });
    }

    async testWebhook(id) {
        return this.request(`/webhooks/${id}/test`, { method: 'POST' });
    }
}

// Export singleton instance
export const api = new ApiClient();
export default api;
