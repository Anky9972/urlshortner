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
    Globe
} from 'lucide-react';
import { BarLoader } from 'react-spinners';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
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

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // Load settings from API
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApiKey = async (data) => {
        const mockKey = {
            id: Date.now().toString(),
            ...data,
            keyFull: 'tk_' + Math.random().toString(36).substring(2, 34),
            keyMasked: '••••••••' + Math.random().toString(36).substring(2, 10),
            isActive: true,
            createdAt: new Date().toISOString()
        };
        setApiKeys([mockKey, ...apiKeys]);
        return mockKey;
    };

    const handleDeleteApiKey = async (id) => {
        setApiKeys(apiKeys.filter(k => k.id !== id));
    };

    const handleToggleApiKey = async (id, isActive) => {
        setApiKeys(apiKeys.map(k => k.id === id ? { ...k, isActive } : k));
    };

    const handleCreateWebhook = async (data) => {
        const mockWebhook = {
            id: Date.now().toString(),
            ...data,
            secretFull: 'whsec_' + Math.random().toString(36).substring(2, 34),
            secretMasked: '••••••••' + Math.random().toString(36).substring(2, 10),
            isActive: true,
            failureCount: 0,
            createdAt: new Date().toISOString()
        };
        setWebhooks([mockWebhook, ...webhooks]);
        return mockWebhook;
    };

    const handleDeleteWebhook = async (id) => {
        setWebhooks(webhooks.filter(w => w.id !== id));
    };

    const handleToggleWebhook = async (id, isActive) => {
        setWebhooks(webhooks.map(w => w.id === id ? { ...w, isActive } : w));
    };

    const handleSaveProfile = async () => {
        console.log('Saving profile:', profile);
    };

    const tabItems = [
        { value: 'profile', label: 'Profile', icon: User },
        { value: 'domains', label: 'Domains', icon: Globe },
        { value: 'api', label: 'API Keys', icon: Key },
        { value: 'webhooks', label: 'Webhooks', icon: Webhook },
        { value: 'audit', label: 'Audit Logs', icon: Shield },
        { value: 'pixels', label: 'Pixels', icon: Code2 },
        { value: 'health', label: 'Health', icon: Activity },
        { value: 'notifications', label: 'Alerts', icon: Bell },
    ];

    return (
        <>
            <SEOMetadata
                title="Settings | TrimLink"
                description="Manage your account settings, API keys, and webhooks."
                canonical="https://trimlynk.com/settings"
            />

            <div className="min-h-screen bg-zinc-950 p-4 lg:p-8">
                {loading && (
                    <div className="fixed top-16 left-0 right-0 z-50">
                        <BarLoader width="100%" height={2} color="#06b6d4" />
                    </div>
                )}

                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
                            <SettingsIcon className="w-6 h-6 text-zinc-400" />
                            Settings
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            Manage your account and preferences
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="w-full flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg h-auto">
                            {tabItems.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-500 rounded-md py-2.5 transition-colors"
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline text-sm">{tab.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <div className="space-y-6">
                                <Card className="bg-zinc-900 border-zinc-800">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                            <User className="w-4 h-4 text-cyan-400" />
                                            Profile Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-zinc-400">Name</label>
                                                <Input
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                    className="bg-zinc-800 border-zinc-700 text-white focus:border-zinc-600"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-zinc-400">Email</label>
                                                <Input
                                                    value={profile.email}
                                                    disabled
                                                    className="bg-zinc-800 border-zinc-700 text-zinc-500"
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleSaveProfile} className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900">
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="bg-zinc-900 border-zinc-800 border-l-2 border-l-red-500/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-medium text-red-400 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            Danger Zone
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                                            <div>
                                                <p className="font-medium text-white text-sm">Delete Account</p>
                                                <p className="text-sm text-zinc-500">Permanently delete your account</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Custom Domains Tab */}
                        <TabsContent value="domains">
                            <DomainsTab />
                        </TabsContent>

                        {/* API Keys Tab */}
                        <TabsContent value="api">
                            <ApiKeysManager
                                apiKeys={apiKeys}
                                onCreateKey={handleCreateApiKey}
                                onDeleteKey={handleDeleteApiKey}
                                onToggleKey={handleToggleApiKey}
                            />
                        </TabsContent>

                        {/* Webhooks Tab */}
                        <TabsContent value="webhooks">
                            <WebhooksManager
                                webhooks={webhooks}
                                onCreateWebhook={handleCreateWebhook}
                                onDeleteWebhook={handleDeleteWebhook}
                                onToggleWebhook={handleToggleWebhook}
                            />
                        </TabsContent>

                        {/* Audit Logs Tab */}
                        <TabsContent value="audit">
                            <AuditLogViewer />
                        </TabsContent>

                        {/* Retargeting Pixels Tab */}
                        <TabsContent value="pixels">
                            <RetargetingPixelsManager />
                        </TabsContent>

                        {/* Link Health Tab */}
                        <TabsContent value="health">
                            <LinkHealthDashboard />
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                        <Bell className="w-4 h-4 text-amber-400" />
                                        Email Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {[
                                        { key: 'emailOnClick', label: 'Click Milestones', description: 'Get notified at click milestones' },
                                        { key: 'emailOnLinkExpiry', label: 'Link Expiration', description: 'Get notified before links expire' },
                                        { key: 'emailOnClickLimit', label: 'Click Limit', description: 'Get notified when limit is reached' },
                                        { key: 'weeklyReport', label: 'Weekly Report', description: 'Weekly performance summary' }
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 rounded-lg hover:bg-zinc-800/50 transition-colors">
                                            <div>
                                                <p className="font-medium text-white text-sm">{item.label}</p>
                                                <p className="text-sm text-zinc-500">{item.description}</p>
                                            </div>
                                            <Switch
                                                checked={notifications[item.key]}
                                                onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default Settings;
