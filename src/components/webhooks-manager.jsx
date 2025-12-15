import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Webhook,
    Plus,
    Trash2,
    Copy,
    Check,
    ToggleLeft,
    ToggleRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';

const WEBHOOK_EVENTS = [
    { value: 'click', label: 'Link Click', description: 'When a short link is clicked' },
    { value: 'link_created', label: 'Link Created', description: 'When a new link is created' },
    { value: 'link_updated', label: 'Link Updated', description: 'When a link is modified' },
    { value: 'link_deleted', label: 'Link Deleted', description: 'When a link is deleted' },
    { value: 'link_expired', label: 'Link Expired', description: 'When a link expires' },
    { value: 'click_limit_reached', label: 'Click Limit Reached', description: 'When a link hits its click limit' }
];

const WebhooksManager = ({
    webhooks = [],
    onCreateWebhook,
    onDeleteWebhook,
    onToggleWebhook
}) => {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newWebhook, setNewWebhook] = useState({
        name: '',
        url: '',
        events: ['click']
    });
    const [createdWebhook, setCreatedWebhook] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [creating, setCreating] = useState(false);

    const handleEventToggle = (event) => {
        setNewWebhook(prev => ({
            ...prev,
            events: prev.events.includes(event)
                ? prev.events.filter(e => e !== event)
                : [...prev.events, event]
        }));
    };

    const handleCreate = async () => {
        if (!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0) return;

        setCreating(true);
        try {
            const result = await onCreateWebhook?.(newWebhook);
            setCreatedWebhook(result);
            setNewWebhook({ name: '', url: '', events: ['click'] });
        } catch (error) {
            console.error('Error creating webhook:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleCopy = async (text, id) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const closeDialog = () => {
        setShowCreateDialog(false);
        setCreatedWebhook(null);
        setNewWebhook({ name: '', url: '', events: ['click'] });
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                        <Webhook className="w-4 h-4 text-cyan-400" />
                        Webhooks
                    </CardTitle>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Webhook
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-white">
                                    {createdWebhook ? 'Webhook Created!' : 'Create New Webhook'}
                                </DialogTitle>
                                {!createdWebhook && (
                                    <DialogDescription className="text-gray-400">
                                        Receive real-time notifications when events happen on your links.
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            {createdWebhook ? (
                                <div className="space-y-4 mt-4">
                                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-medium">Webhook created successfully!</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-3">
                                            Save your signing secret - you'll need it to verify webhook signatures.
                                        </p>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500">Signing Secret</label>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 p-3 bg-gray-800 rounded-lg text-sm text-cyan-300 font-mono break-all">
                                                    {createdWebhook.secretFull}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCopy(createdWebhook.secretFull, 'new')}
                                                    className="bg-gray-700 hover:bg-gray-600"
                                                >
                                                    {copiedId === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={closeDialog} className="w-full">
                                        Done
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Webhook Name</label>
                                        <Input
                                            placeholder="My Webhook"
                                            value={newWebhook.name}
                                            onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Endpoint URL</label>
                                        <Input
                                            type="url"
                                            placeholder="https://your-server.com/webhook"
                                            value={newWebhook.url}
                                            onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Events to subscribe</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {WEBHOOK_EVENTS.map((event) => (
                                                <button
                                                    key={event.value}
                                                    onClick={() => handleEventToggle(event.value)}
                                                    className={`p-3 rounded-lg border text-left transition-all ${newWebhook.events.includes(event.value)
                                                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300'
                                                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                                        }`}
                                                >
                                                    <p className="text-sm font-medium">{event.label}</p>
                                                    <p className="text-xs opacity-70">{event.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleCreate}
                                        disabled={!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0 || creating}
                                        className="w-full bg-cyan-500 hover:bg-cyan-600"
                                    >
                                        {creating ? 'Creating...' : 'Create Webhook'}
                                    </Button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                    Get notified instantly when events happen on your links
                </p>
            </CardHeader>

            <CardContent>
                {webhooks.length === 0 ? (
                    <div className="text-center py-8">
                        <Webhook className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500">No webhooks configured</p>
                        <p className="text-sm text-gray-600">Add a webhook to receive real-time events</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {webhooks.map((webhook, index) => (
                            <motion.div
                                key={webhook.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 rounded-lg border transition-all ${webhook.isActive
                                    ? 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                                    : 'bg-gray-900/50 border-gray-800 opacity-60'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-white truncate">{webhook.name}</h4>
                                            {webhook.failureCount > 0 && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {webhook.failureCount} failures
                                                </span>
                                            )}
                                            {!webhook.isActive && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                                                    Disabled
                                                </span>
                                            )}
                                        </div>

                                        <a
                                            href={webhook.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-500 hover:text-gray-400 flex items-center gap-1 truncate"
                                        >
                                            {webhook.url}
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        </a>

                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {webhook.events?.map((event) => (
                                                <span
                                                    key={event}
                                                    className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400"
                                                >
                                                    {event}
                                                </span>
                                            ))}
                                        </div>

                                        {webhook.lastTriggeredAt && (
                                            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Last triggered: {new Date(webhook.lastTriggeredAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onToggleWebhook?.(webhook.id, !webhook.isActive)}
                                            className={webhook.isActive ? 'text-emerald-400' : 'text-gray-500'}
                                        >
                                            {webhook.isActive ? (
                                                <ToggleRight className="w-5 h-5" />
                                            ) : (
                                                <ToggleLeft className="w-5 h-5" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeleteWebhook?.(webhook.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Webhook Payload Example */}
                <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <h4 className="font-medium text-cyan-300 mb-2">Example Payload</h4>
                    <pre className="p-3 bg-gray-900 rounded-lg text-xs text-gray-300 overflow-x-auto">
                        {`{
  "event": "click",
  "timestamp": "2024-12-14T18:30:00Z",
  "data": {
    "urlId": "clx...",
    "shortUrl": "abc123",
    "country": "US",
    "device": "mobile",
    "browser": "chrome"
  }
}`}
                    </pre>
                </div>
            </CardContent>
        </Card>
    );
};

export default WebhooksManager;
