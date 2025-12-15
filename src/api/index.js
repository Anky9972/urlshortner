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
    getUrlAnalytics,
    getDashboardAnalytics
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
    getOrCreateUser,
    getUserBySupabaseId,
    getUserById,
    updateUser,
    getUserStats
} from './users';

// API Keys
export {
    getApiKeys,
    createApiKey,
    deleteApiKey,
    toggleApiKey,
    validateApiKey
} from './apiKeys';

// Webhooks
export {
    getWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    triggerWebhooks,
    WEBHOOK_EVENTS
} from './webhooks';
