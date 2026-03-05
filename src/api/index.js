/**
 * API Index - Export all API functions
 */

// URL Management
export {
    getUrls,
    getUrl,
    getLongUrl,
    createUrl,
    updateUrl,
    deleteUrl,
    bulkDeleteUrls,
    addTargetingRule,
    getTargetingRules,
    deleteTargetingRule
} from './urls';

// Analytics & Clicks
export {
    recordClick,
    getClicksForUrl,
    getClicksForUrls,
    getClickAnalytics,
    getClicksByDateRange,
    getGeoAnalytics,
    getDeviceAnalytics,
    getReferrerAnalytics
} from './clicks';

// Folders & Tags
export {
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveUrlToFolder,
    getTags,
    createTag,
    deleteTag,
    addTagToUrl,
    removeTagFromUrl,
    getUrlsByTag
} from './folders';

// Users
export {
    getUser,
    updateUser,
    getUserStats,
    getUserDashboard
} from './users';

// API Keys
export {
    getApiKeys,
    createApiKey,
    deleteApiKey,
    regenerateApiKey,
    updateApiKeyPermissions
} from './apiKeys';

// Webhooks
export {
    getWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook
} from './webhooks';

// Pixels
export {
    getPixels,
    getPixel,
    createPixel,
    updatePixel,
    deletePixel,
    attachPixelToUrl,
    detachPixelFromUrl,
    PIXEL_TYPES
} from './pixels';

// Splits
export {
    getSplits,
    createSplit,
    updateSplit,
    deleteSplit,
    getSplitStats,
    getSplitRedirect,
    recordSplitClick
} from './splits';

// Health
export {
    getHealthHistory,
    getLatestHealth,
    getUnhealthyLinks,
    checkHealth,
    checkAllHealth,
    getHealthSummary
} from './health';

// LinkTrees
export {
    getPublicLinkTree,
    recordLinkTreeClick,
    getLinkTreeGallery,
    getMyLinkTrees,
    getLinkTree,
    createLinkTree,
    updateLinkTree,
    deleteLinkTree,
    addLinkTreeItem,
    updateLinkTreeItem,
    deleteLinkTreeItem,
    reorderLinkTreeItems,
    bulkUpdateLinks
} from './linktrees';

// Rooms
export {
    getPublicRoom,
    getMyRooms,
    getJoinedRooms,
    getRoomBySlug,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    addRoomMember,
    removeRoomMember,
    leaveRoom,
    addRoomUrl,
    removeRoomUrl
} from './rooms';

// Community Discussion Board
export {
    getCommunityPosts,
    getCommunityPost,
    createCommunityPost,
    addCommunityReply,
    toggleCommunityLike,
    resolveCommunityPost,
    deleteCommunityPost,
    deleteCommunityReply
} from './community';
