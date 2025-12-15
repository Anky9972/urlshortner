const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const handleUrlRedirect = async (identifier) => {
  try {
    const response = await fetch(`${API_URL}/api/free-urls/lookup/${identifier}`);

    if (!response.ok) {
      if (response.status === 404 || response.status === 410) {
        return null;
      }
      throw new Error('Failed to lookup URL');
    }

    const data = await response.json();
    return data.originalUrl;
  } catch (error) {
    console.error('Redirect Error:', error);
    return null;
  }
};