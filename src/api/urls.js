/**
 * URL API - Calls server endpoints instead of Prisma directly
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
 * Get all URLs for a user
 */
export async function getUrls() {
    return apiRequest('/api/urls');
}

/**
 * Get a single URL by ID
 */
export async function getUrl(id) {
    return apiRequest(`/api/urls/${id}`);
}

/**
 * Get URL by short/custom URL for redirect
 */
export async function getLongUrl(shortOrCustomUrl) {
    try {
        return await apiRequest(`/api/urls/redirect/${shortOrCustomUrl}`);
    } catch {
        return null;
    }
}

/**
 * Create a new shortened URL
 */
export async function createUrl(data, qrCodeUrl) {
    return apiRequest('/api/urls', {
        method: 'POST',
        body: JSON.stringify({
            title: data.title,
            longUrl: data.longUrl,
            customUrl: data.customUrl,
            userId: data.userId,
            expirationDate: data.expirationDate,
            password: data.password,
            clickLimit: data.clickLimit,
            activatesAt: data.activatesAt,
            deactivatesAt: data.deactivatesAt,
            folderId: data.folderId,
            utmSource: data.utmSource,
            utmMedium: data.utmMedium,
            utmCampaign: data.utmCampaign,
            utmTerm: data.utmTerm,
            utmContent: data.utmContent,
            isCloaked: data.isCloaked || false,
            pixels: data.pixels,
            qrCode: qrCodeUrl,
        }),
    });
}

/**
 * Update a URL
 */
export async function updateUrl(id, data) {
    return apiRequest(`/api/urls/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a URL
 */
export async function deleteUrl(id) {
    return apiRequest(`/api/urls/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Bulk delete URLs
 */
export async function bulkDeleteUrls(ids) {
    return apiRequest('/api/urls/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
    });
}

/**
 * Add targeting rule to a URL
 */
export async function addTargetingRule(urlId, rule) {
    return apiRequest(`/api/urls/${urlId}/targeting`, {
        method: 'POST',
        body: JSON.stringify(rule),
    });
}

/**
 * Get targeting rules for a URL
 */
export async function getTargetingRules(urlId) {
    return apiRequest(`/api/urls/${urlId}/targeting`);
}

/**
 * Delete targeting rule
 */
export async function deleteTargetingRule(urlId, ruleId) {
    return apiRequest(`/api/urls/${urlId}/targeting/${ruleId}`, {
        method: 'DELETE',
    });
}
