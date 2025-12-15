import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Key,
    Plus,
    Copy,
    Check,
    Trash2,
    Eye,
    EyeOff,
    Shield,
    Clock,
    AlertTriangle,
    ToggleLeft,
    ToggleRight
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

const ApiKeysManager = ({
    apiKeys = [],
    onCreateKey,
    onDeleteKey,
    onToggleKey
}) => {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newKeyData, setNewKeyData] = useState({ name: '', description: '' });
    const [createdKey, setCreatedKey] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        if (!newKeyData.name.trim()) return;

        setCreating(true);
        try {
            const result = await onCreateKey?.(newKeyData);
            setCreatedKey(result);
            setNewKeyData({ name: '', description: '' });
        } catch (error) {
            console.error('Error creating key:', error);
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
        setCreatedKey(null);
        setNewKeyData({ name: '', description: '' });
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-violet-400" />
                        API Keys
                    </CardTitle>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="bg-violet-500 hover:bg-violet-400 text-white"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Create Key
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-white">
                                    {createdKey ? 'API Key Created!' : 'Create New API Key'}
                                </DialogTitle>
                                {!createdKey && (
                                    <DialogDescription className="text-gray-400">
                                        API keys allow you to access the TrimLink API programmatically.
                                    </DialogDescription>
                                )}
                            </DialogHeader>

                            {createdKey ? (
                                <div className="space-y-4 mt-4">
                                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                            <Shield className="w-5 h-5" />
                                            <span className="font-medium">Save this key now!</span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-3">
                                            This is the only time you'll see this key. Store it securely.
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 p-3 bg-gray-800 rounded-lg text-sm text-emerald-300 font-mono break-all">
                                                {createdKey.keyFull}
                                            </code>
                                            <Button
                                                size="sm"
                                                onClick={() => handleCopy(createdKey.keyFull, 'new')}
                                                className="bg-gray-700 hover:bg-gray-600"
                                            >
                                                {copiedId === 'new' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <Button onClick={closeDialog} className="w-full">
                                        Done
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Key Name</label>
                                        <Input
                                            placeholder="Production API Key"
                                            value={newKeyData.name}
                                            onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Description (optional)</label>
                                        <Input
                                            placeholder="Used for main website integration"
                                            value={newKeyData.description}
                                            onChange={(e) => setNewKeyData({ ...newKeyData, description: e.target.value })}
                                            className="bg-gray-800 border-gray-700"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleCreate}
                                        disabled={!newKeyData.name.trim() || creating}
                                        className="w-full bg-purple-500 hover:bg-purple-600"
                                    >
                                        {creating ? 'Creating...' : 'Create API Key'}
                                    </Button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                    Manage API keys for programmatic access to your links
                </p>
            </CardHeader>

            <CardContent>
                {apiKeys.length === 0 ? (
                    <div className="text-center py-8">
                        <Key className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500">No API keys yet</p>
                        <p className="text-sm text-gray-600">Create your first API key to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {apiKeys.map((key, index) => (
                            <motion.div
                                key={key.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-4 rounded-lg border transition-all ${key.isActive
                                    ? 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                                    : 'bg-gray-900/50 border-gray-800 opacity-60'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-white truncate">{key.name}</h4>
                                            {!key.isActive && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                                                    Disabled
                                                </span>
                                            )}
                                        </div>
                                        {key.description && (
                                            <p className="text-sm text-gray-500 mb-2">{key.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <code className="font-mono bg-gray-800 px-2 py-1 rounded">
                                                {key.keyMasked}
                                            </code>
                                            {key.lastUsedAt && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onToggleKey?.(key.id, !key.isActive)}
                                            className={key.isActive ? 'text-emerald-400' : 'text-gray-500'}
                                        >
                                            {key.isActive ? (
                                                <ToggleRight className="w-5 h-5" />
                                            ) : (
                                                <ToggleLeft className="w-5 h-5" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeleteKey?.(key.id)}
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

                {/* API Documentation Link */}
                <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <h4 className="font-medium text-purple-300 mb-2">Quick Start</h4>
                    <code className="block p-3 bg-gray-900 rounded-lg text-sm text-gray-300 overflow-x-auto">
                        {`curl -X GET "https://api.trimlynk.com/v1/urls" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                    </code>
                </div>
            </CardContent>
        </Card>
    );
};

export default ApiKeysManager;
