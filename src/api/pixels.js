/**
 * Retargeting Pixels API
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
 * Get all pixels for a user
 */
export async function getPixels(userId) {
    return apiRequest(`/api/pixels?userId=${userId}`);
}

/**
 * Get single pixel
 */
export async function getPixel(id) {
    return apiRequest(`/api/pixels/${id}`);
}

/**
 * Create a new pixel
 */
export async function createPixel(data) {
    return apiRequest('/api/pixels', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update a pixel
 */
export async function updatePixel(id, data) {
    return apiRequest(`/api/pixels/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a pixel
 */
export async function deletePixel(id) {
    return apiRequest(`/api/pixels/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Attach pixel to URL
 */
export async function attachPixelToUrl(urlId, pixelId) {
    return apiRequest('/api/pixels/attach', {
        method: 'POST',
        body: JSON.stringify({ urlId, pixelId }),
    });
}

/**
 * Detach pixel from URL
 */
export async function detachPixelFromUrl(urlId, pixelId) {
    return apiRequest('/api/pixels/detach', {
        method: 'DELETE',
        body: JSON.stringify({ urlId, pixelId }),
    });
}

/**
 * Get pixels for a URL
 */
export async function getUrlPixels(urlId) {
    return apiRequest(`/api/pixels/url/${urlId}`);
}

// Pixel type options for UI
export const PIXEL_TYPES = [
    { value: 'facebook', label: 'Facebook Pixel', icon: 'facebook' },
    { value: 'google', label: 'Google Analytics', icon: 'google' },
    { value: 'tiktok', label: 'TikTok Pixel', icon: 'tiktok' },
    { value: 'linkedin', label: 'LinkedIn Insight', icon: 'linkedin' },
    { value: 'twitter', label: 'Twitter Pixel', icon: 'twitter' },
    { value: 'custom', label: 'Custom Script', icon: 'code' },
];
