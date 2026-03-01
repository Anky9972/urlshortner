import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon,
    Key,
    Webhook,
    User,
    Bell,
    Shield,
    Save,
    Code2,
    Activity,
    Globe,
    ChevronRight,
} from 'lucide-react';
import { BarLoader } from 'react-spinners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import ApiKeysManager from '@/components/api-keys-manager';
import WebhooksManager from '@/components/webhooks-manager';
import RetargetingPixelsManager from '@/components/retargeting-pixels';
import LinkHealthDashboard from '@/components/link-health-dashboard';
import DomainsTab from '@/components/settings/domains-tab';
import AuditLogViewer from '@/components/audit-log-viewer';
import { SEOMetadata } from '@/components/seo-metadata';
import { UrlState } from '@/context';
import {
    getApiKeys, createApiKey, deleteApiKey, updateApiKeyPermissions,
    getWebhooks, createWebhook, deleteWebhook, updateWebhook,
    updateUser
} from '@/api';

const Settings = () => {
    const { user } = UrlState();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    const [apiKeys, setApiKeys] = useState([]);
    const [webhooks, setWebhooks] = useState([]);

    const [notifications, setNotifications] = useState({
        emailOnClick: false,
        emailOnLinkExpiry: true,
        emailOnClickLimit: true,
        weeklyReport: true
    });

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const [keysData, webhooksData] = await Promise.all([
                getApiKeys().catch(() => []),
                getWebhooks().catch(() => [])
            ]);
            setApiKeys(keysData);
            setWebhooks(webhooksData);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApiKey = async (data) => { const key = await createApiKey(data); setApiKeys([key, ...apiKeys]); return key; };
    const handleDeleteApiKey = async (id) => { await deleteApiKey(id); setApiKeys(apiKeys.filter(k => k.id !== id)); };
    const handleToggleApiKey = async (id, isActive) => { await updateApiKeyPermissions(id, { isActive }); setApiKeys(apiKeys.map(k => k.id === id ? { ...k, isActive } : k)); };
    const handleCreateWebhook = async (data) => { const webhook = await createWebhook(data); setWebhooks([webhook, ...webhooks]); return webhook; };
    const handleDeleteWebhook = async (id) => { await deleteWebhook(id); setWebhooks(webhooks.filter(w => w.id !== id)); };
    const handleToggleWebhook = async (id, isActive) => { await updateWebhook(id, { isActive }); setWebhooks(webhooks.map(w => w.id === id ? { ...w, isActive } : w)); };

    const handleSaveProfile = async () => {
        try { await updateUser(user?.id, profile); } catch (error) { console.error('Error saving profile:', error); }
    };

    const tabItems = [
        { value: 'profile', label: 'Profile', icon: User, desc: 'Account details' },
        { value: 'domains', label: 'Domains', icon: Globe, desc: 'Custom domains' },
        { value: 'api', label: 'API Keys', icon: Key, desc: 'Developer access' },
        { value: 'webhooks', label: 'Webhooks', icon: Webhook, desc: 'Event hooks' },
        { value: 'audit', label: 'Audit Logs', icon: Shield, desc: 'Activity history' },
        { value: 'pixels', label: 'Pixels', icon: Code2, desc: 'Tracking pixels' },
        { value: 'health', label: 'Health', icon: Activity, desc: 'Link monitoring' },
        { value: 'notifications', label: 'Alerts', icon: Bell, desc: 'Notifications' },
    ];

    const colorMap = {
        profile: 'blue', domains: 'indigo', api: 'amber', webhooks: 'rose',
        audit: 'violet', pixels: 'emerald', health: 'blue', notifications: 'amber',
    };

    return (
        <>
            <SEOMetadata
                title="Settings | TrimLink"
                description="Manage your account settings, API keys, and webhooks."
                canonical={`${import.meta.env.VITE_APP_URL || 'https://trimlynk.com'}/settings`}
            />

            <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 lg:p-8">
                {loading && (
                    <div className="fixed top-16 left-0 right-0 z-50">
                        <BarLoader width="100%" height={2} color="#2563eb" />
                    </div>
                )}

                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <SettingsIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Settings</h1>
                                <p className="text-slate-500 text-sm">Manage your account and preferences</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar navigation */}
                        <motion.nav
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:w-56 shrink-0"
                        >
                            <div className="lg:sticky lg:top-24 space-y-1">
                                {tabItems.map((tab) => {
                                    const isActive = activeTab === tab.value;
                                    return (
                                        <button
                                            key={tab.value}
                                            onClick={() => setActiveTab(tab.value)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                                isActive
                                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-[hsl(230,10%,12%)] border border-transparent'
                                            }`}
                                        >
                                            <tab.icon className="w-4 h-4 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{tab.label}</p>
                                                <p className="text-[10px] text-slate-600 truncate hidden lg:block">{tab.desc}</p>
                                            </div>
                                            {isActive && <ChevronRight className="w-3 h-3 shrink-0 hidden lg:block" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.nav>

                        {/* Content */}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex-1 min-w-0"
                        >
                            {/* Profile */}
                            {activeTab === 'profile' && (
                                <div className="space-y-5">
                                    <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden">
                                        <div className="px-6 py-4 border-b border-[hsl(230,10%,13%)]">
                                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                                <User className="w-4 h-4 text-blue-400" />
                                                Profile Information
                                            </h3>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Name</label>
                                                    <Input
                                                        value={profile.name}
                                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                        className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-white focus:border-blue-500/50"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Email</label>
                                                    <Input
                                                        value={profile.email}
                                                        disabled
                                                        className="bg-[hsl(230,10%,12%)] border-[hsl(230,10%,20%)] text-slate-500"
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-10">
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-red-500/15 bg-[hsl(230,12%,9%)] overflow-hidden">
                                        <div className="px-6 py-4 border-b border-red-500/10">
                                            <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Danger Zone
                                            </h3>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/[0.04] border border-red-500/15">
                                                <div>
                                                    <p className="font-medium text-white text-sm">Delete Account</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Permanently delete your account and all data</p>
                                                </div>
                                                <Button variant="outline" size="sm" className="border-red-500/25 text-red-400 hover:bg-red-500/10 rounded-xl text-xs">
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Domains */}
                            {activeTab === 'domains' && <DomainsTab />}

                            {/* API Keys */}
                            {activeTab === 'api' && (
                                <ApiKeysManager
                                    apiKeys={apiKeys}
                                    onCreateKey={handleCreateApiKey}
                                    onDeleteKey={handleDeleteApiKey}
                                    onToggleKey={handleToggleApiKey}
                                />
                            )}

                            {/* Webhooks */}
                            {activeTab === 'webhooks' && (
                                <WebhooksManager
                                    webhooks={webhooks}
                                    onCreateWebhook={handleCreateWebhook}
                                    onDeleteWebhook={handleDeleteWebhook}
                                    onToggleWebhook={handleToggleWebhook}
                                />
                            )}

                            {/* Audit Logs */}
                            {activeTab === 'audit' && <AuditLogViewer />}

                            {/* Retargeting Pixels */}
                            {activeTab === 'pixels' && <RetargetingPixelsManager />}

                            {/* Link Health */}
                            {activeTab === 'health' && <LinkHealthDashboard />}

                            {/* Notifications */}
                            {activeTab === 'notifications' && (
                                <div className="rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] overflow-hidden">
                                    <div className="px-6 py-4 border-b border-[hsl(230,10%,13%)]">
                                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-amber-400" />
                                            Email Notifications
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-[hsl(230,10%,13%)]">
                                        {[
                                            { key: 'emailOnClick', label: 'Click Milestones', desc: 'Get notified at click milestones', icon: MousePointerClick },
                                            { key: 'emailOnLinkExpiry', label: 'Link Expiration', desc: 'Get notified before links expire', icon: Clock },
                                            { key: 'emailOnClickLimit', label: 'Click Limit', desc: 'Get notified when limit is reached', icon: Shield },
                                            { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly performance summary', icon: BarChart3 }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between px-6 py-4 hover:bg-[hsl(230,10%,11%)] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[hsl(230,10%,14%)] flex items-center justify-center">
                                                        {item.icon && <item.icon className="w-3.5 h-3.5 text-slate-400" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white text-sm">{item.label}</p>
                                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={notifications[item.key]}
                                                    onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Need these icons for notifications section
import { MousePointerClick, Clock, BarChart3 } from 'lucide-react';

export default Settings;
