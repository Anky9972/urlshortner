/**
 * Rooms API - Calls server endpoints
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

// ==============================
// PUBLIC
// ==============================

/**
 * Get a public room by slug
 */
export async function getPublicRoom(slug) {
    return apiRequest(`/api/rooms/public/${slug}`);
}

// ==============================
// ROOMS
// ==============================

/**
 * Get all rooms owned by the current user
 */
export async function getMyRooms() {
    return apiRequest('/api/rooms');
}

/**
 * Get rooms the user has joined
 */
export async function getJoinedRooms() {
    return apiRequest('/api/rooms/joined');
}

/**
 * Get room by slug (authenticated)
 */
export async function getRoomBySlug(slug) {
    return apiRequest(`/api/rooms/slug/${slug}`);
}

/**
 * Get room by ID
 */
export async function getRoom(id) {
    return apiRequest(`/api/rooms/${id}`);
}

/**
 * Create a new room
 */
export async function createRoom(data) {
    return apiRequest('/api/rooms', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Update a room
 */
export async function updateRoom(id, data) {
    return apiRequest(`/api/rooms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a room
 */
export async function deleteRoom(id) {
    return apiRequest(`/api/rooms/${id}`, {
        method: 'DELETE',
    });
}

// ==============================
// MEMBERS
// ==============================

/**
 * Invite/add a member by email
 */
export async function addRoomMember(roomId, email, role = 'member') {
    return apiRequest(`/api/rooms/${roomId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
    });
}

/**
 * Remove a member
 */
export async function removeRoomMember(roomId, memberId) {
    return apiRequest(`/api/rooms/${roomId}/members/${memberId}`, {
        method: 'DELETE',
    });
}

/**
 * Leave a room
 */
export async function leaveRoom(roomId) {
    return apiRequest(`/api/rooms/${roomId}/leave`, {
        method: 'POST',
    });
}

// ==============================
// SHARED URLs
// ==============================

/**
 * Add a URL to a room
 */
export async function addRoomUrl(roomId, data) {
    return apiRequest(`/api/rooms/${roomId}/urls`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Remove a URL from a room
 */
export async function removeRoomUrl(roomId, urlId) {
    return apiRequest(`/api/rooms/${roomId}/urls/${urlId}`, {
        method: 'DELETE',
    });
}
