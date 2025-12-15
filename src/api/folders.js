/**
 * Folders & Tags API - Calls server endpoints instead of Prisma directly
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

// ============================================
// FOLDERS
// ============================================

/**
 * Get all folders for a user
 */
export async function getFolders(userId) {
    return apiRequest(`/api/folders?userId=${userId}`);
}

/**
 * Create a new folder
 */
export async function createFolder(userId, data) {
    return apiRequest('/api/folders', {
        method: 'POST',
        body: JSON.stringify({ ...data, userId }),
    });
}

/**
 * Update a folder
 */
export async function updateFolder(id, data) {
    return apiRequest(`/api/folders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a folder
 */
export async function deleteFolder(id) {
    return apiRequest(`/api/folders/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Move URL to folder
 */
export async function moveUrlToFolder(urlId, folderId) {
    return apiRequest(`/api/urls/${urlId}`, {
        method: 'PATCH',
        body: JSON.stringify({ folderId }),
    });
}

// ============================================
// TAGS
// ============================================

/**
 * Get all tags
 */
export async function getTags() {
    return apiRequest('/api/tags');
}

/**
 * Create a new tag
 */
export async function createTag(data) {
    return apiRequest('/api/tags', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a tag
 */
export async function deleteTag(id) {
    return apiRequest(`/api/tags/${id}`, {
        method: 'DELETE',
    });
}

/**
 * Add tag to URL
 */
export async function addTagToUrl(urlId, tagId) {
    return apiRequest('/api/tags/add-to-url', {
        method: 'POST',
        body: JSON.stringify({ urlId, tagId }),
    });
}

/**
 * Remove tag from URL
 */
export async function removeTagFromUrl(urlId, tagId) {
    return apiRequest('/api/tags/remove-from-url', {
        method: 'DELETE',
        body: JSON.stringify({ urlId, tagId }),
    });
}

/**
 * Get URLs by tag
 */
export async function getUrlsByTag(tagId, userId) {
    return apiRequest(`/api/tags/${tagId}/urls?userId=${userId}`);
}

