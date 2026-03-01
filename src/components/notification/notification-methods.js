const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Request failed');
  }

  return response.json();
}

export const createNotification = async (userId, type, content) => {
  try {
    return await apiRequest('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({
        type,
        title: content.title || type,
        message: content.message || '',
        data: content,
      }),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const sendRoomInvitation = async (roomId, inviterId, invitedEmail) => {
  try {
    return await apiRequest(`/api/rooms/${roomId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email: invitedEmail }),
    });
  } catch (error) {
    console.error('Error sending room invitation:', error);
    throw error;
  }
};

export const sendGlobalAnnouncement = async (message) => {
  try {
    return await apiRequest('/api/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ type: 'announcement', title: 'Announcement', message }),
    });
  } catch (error) {
    console.error('Error sending announcement:', error);
    throw error;
  }
};

export const fetchNotifications = async () => {
  try {
    return await apiRequest('/api/notifications');
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return []; // Return empty array on error
  }
};

export const fetchNotificationsForUser = async (userId) => {
  return fetchNotifications();
};

export const markNotificationRead = async (notificationId) => {
  try {
    return await apiRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  } catch (error) {
    console.error('Error marking notification read:', error);
    throw error;
  }
};

export const markAllNotificationsRead = async () => {
  try {
    return await apiRequest('/api/notifications/read-all', {
      method: 'PATCH',
    });
  } catch (error) {
    console.error('Error marking all read:', error);
    throw error;
  }
};