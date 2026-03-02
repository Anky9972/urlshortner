/**
 * Linktrees API - Calls server endpoints
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

// ==============================
// PUBLIC
// ==============================

/**
 * Get a linktree by slug (public view)
 */
export async function getPublicLinkTree(slug) {
    return apiRequest(`/api/linktrees/public/${slug}`);
}

/**
 * Record a link click on a public linktree
 */
export async function recordLinkTreeClick(slug, linkId) {
    return apiRequest(`/api/linktrees/public/${slug}/click/${linkId}`, {
        method: 'POST',
    });
}

/**
 * Get linktree gallery (public)
 */
export async function getLinkTreeGallery() {
    return apiRequest('/api/linktrees/gallery');
}

// ==============================
// AUTHENTICATED
// ==============================

/**
 * Get all linktrees for the current user
 */
export async function getMyLinkTrees() {
    return apiRequest('/api/linktrees');
}

/**
 * Get a single linktree by ID
 */
export async function getLinkTree(id) {
    return apiRequest(`/api/linktrees/${id}`);
}

/**
 * Create a new linktree
 */
export async function createLinkTree(data) {
    return apiRequest('/api/linktrees', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update a linktree
 */
export async function updateLinkTree(id, data) {
    return apiRequest(`/api/linktrees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a linktree
 */
export async function deleteLinkTree(id) {
    return apiRequest(`/api/linktrees/${id}`, {
        method: 'DELETE',
    });
}

// ==============================
// LINK ITEMS
// ==============================

/**
 * Add a link to a linktree
 */
export async function addLinkTreeItem(treeId, data) {
    return apiRequest(`/api/linktrees/${treeId}/links`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update a link item
 */
export async function updateLinkTreeItem(treeId, linkId, data) {
    return apiRequest(`/api/linktrees/${treeId}/links/${linkId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a link item
 */
export async function deleteLinkTreeItem(treeId, linkId) {
    return apiRequest(`/api/linktrees/${treeId}/links/${linkId}`, {
        method: 'DELETE',
    });
}

/**
 * Reorder links
 */
export async function reorderLinkTreeItems(treeId, orderedIds) {
    return apiRequest(`/api/linktrees/${treeId}/links/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ orderedIds }),
    });
}

/**
 * Bulk update all links (replace)
 */
export async function bulkUpdateLinks(treeId, links) {
    return apiRequest(`/api/linktrees/${treeId}/links`, {
        method: 'PUT',
        body: JSON.stringify({ links }),
    });
}
