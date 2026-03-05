/**
 * Community Discussion Board API
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
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
 * List community posts (paginated, filterable)
 * @param {{ category?: string, search?: string, sort?: 'latest'|'oldest'|'popular', page?: number }} params
 */
export async function getCommunityPosts(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.search) qs.set('search', params.search);
  if (params.sort) qs.set('sort', params.sort);
  if (params.page) qs.set('page', String(params.page));
  const query = qs.toString();
  return apiRequest(`/api/community${query ? `?${query}` : ''}`);
}

/**
 * Get a single community post with replies
 */
export async function getCommunityPost(id) {
  return apiRequest(`/api/community/${id}`);
}

/**
 * Create a new community post (auth required)
 */
export async function createCommunityPost({ title, content, category }) {
  return apiRequest('/api/community', {
    method: 'POST',
    body: JSON.stringify({ title, content, category }),
  });
}

/**
 * Add a reply to a post (auth required)
 */
export async function addCommunityReply(postId, content) {
  return apiRequest(`/api/community/${postId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

/**
 * Toggle like on a post (auth required)
 */
export async function toggleCommunityLike(postId) {
  return apiRequest(`/api/community/${postId}/like`, {
    method: 'POST',
  });
}

/**
 * Mark a post as resolved / unresolved (author or admin)
 */
export async function resolveCommunityPost(postId, isResolved) {
  return apiRequest(`/api/community/${postId}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ isResolved }),
  });
}

/**
 * Delete a community post (author or admin)
 */
export async function deleteCommunityPost(postId) {
  return apiRequest(`/api/community/${postId}`, {
    method: 'DELETE',
  });
}

/**
 * Delete a community reply (author or admin)
 */
export async function deleteCommunityReply(replyId) {
  return apiRequest(`/api/community/reply/${replyId}`, {
    method: 'DELETE',
  });
}
