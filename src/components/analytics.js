import { recordLinkTreeClick } from "../api/linktrees";

export const incrementLinkClicks = async (linkId, treeSlug) => {
  try {
    await recordLinkTreeClick(treeSlug, linkId);
    return true;
  } catch (err) {
    console.error("Error updating link clicks:", err);
    return false;
  }
};

export const incrementTreeViews = async () => {
  // View count is now auto-incremented by the server when the public linktree is fetched
  return true;
};

export const trackAndUpdateTreeLinkClick = async (linkUrl, treeSlug, linkId) => {
  // Track in Google Analytics
  if (window.gtag) {
    window.gtag('event', 'click', {
      event_category: 'Link',
      event_label: linkUrl,
    });
  }

  // Update clicks via API
  return await incrementLinkClicks(linkId, treeSlug);
};

export const trackLinkClick = (shortUrl) => {
  if (window.gtag) {
    window.gtag('event', 'click', {
      event_category: 'Link',
      event_label: shortUrl,
    });
  }
};

export const trackViewTree = async (treeId) => {
  if (window.gtag) {
    window.gtag('event', 'view', {
      event_category: 'Link',
      event_label: treeId,
    });
  }
  // View count is auto-incremented by the public endpoint
  return true;
};
