import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2,
    Plus,
    Trash2,
    Edit2,
    Power,
    PowerOff,
    Facebook,
    Chrome,
    Linkedin,
    Twitter,
    Loader2,
    X,
    Check,
    AlertCircle
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { getPixels, createPixel, updatePixel, deletePixel, PIXEL_TYPES } from '../api/pixels';
import { UrlState } from '../context';

const getPixelIcon = (type) => {
    switch (type) {
        case 'facebook': return <Facebook className="w-4 h-4" />;
        case 'google': return <Chrome className="w-4 h-4" />;
        case 'linkedin': return <Linkedin className="w-4 h-4" />;
        case 'twitter': return <Twitter className="w-4 h-4" />;
        default: return <Code2 className="w-4 h-4" />;
    }
};

const getPixelColor = (type) => {
    switch (type) {
        case 'facebook': return 'text-blue-500';
        case 'google': return 'text-red-500';
        case 'tiktok': return 'text-pink-500';
        case 'linkedin': return 'text-blue-600';
        case 'twitter': return 'text-sky-500';
        default: return 'text-slate-400';
    }
};

const RetargetingPixelsManager = () => {
    const [pixels, setPixels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingPixel, setEditingPixel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'facebook',
        pixelId: ''
    });
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const { user } = UrlState();

    useEffect(() => {
        if (user?.id) {
            fetchPixels();
        }
    }, [user?.id]);

    const fetchPixels = async () => {
        try {
            setIsLoading(true);
            const data = await getPixels(user.id);
            setPixels(data);
        } catch (error) {
            console.error('Error fetching pixels:', error);
            setError('Failed to load pixels');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            if (editingPixel) {
                await updatePixel(editingPixel.id, formData);
            } else {
                await createPixel({ ...formData, userId: user.id });
            }
            await fetchPixels();
            setShowCreateDialog(false);
            setEditingPixel(null);
            setFormData({ name: '', type: 'facebook', pixelId: '' });
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (pixel) => {
        setEditingPixel(pixel);
        setFormData({
            name: pixel.name,
            type: pixel.type,
            pixelId: pixel.pixelId
        });
        setShowCreateDialog(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this pixel?')) return;
        try {
            await deletePixel(id);
            await fetchPixels();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleToggleActive = async (pixel) => {
        try {
            await updatePixel(pixel.id, { isActive: !pixel.isActive });
            await fetchPixels();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCloseDialog = () => {
        setShowCreateDialog(false);
        setEditingPixel(null);
        setFormData({ name: '', type: 'facebook', pixelId: '' });
        setError(null);
    };

    if (isLoading) {
        return (
            <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-violet-400" />
                    Retargeting Pixels
                </CardTitle>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Pixel
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                {editingPixel ? 'Edit Pixel' : 'Add Retargeting Pixel'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Add tracking pixels to collect audience data for retargeting campaigns.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Facebook Main"
                                    className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)]"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Pixel Type</label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PIXEL_TYPES.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center gap-2">
                                                    {getPixelIcon(type.value)}
                                                    {type.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Pixel ID</label>
                                <Input
                                    value={formData.pixelId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, pixelId: e.target.value }))}
                                    placeholder="Enter your pixel/tag ID"
                                    className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)]"
                                    required
                                />
                                <p className="text-xs text-slate-500">
                                    Find this in your advertising platform's settings
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseDialog}
                                    className="flex-1 border-[hsl(230,10%,20%)]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : editingPixel ? (
                                        <>
                                            <Check className="w-4 h-4 mr-1" />
                                            Update
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-1" />
                                            Create
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent>
                {pixels.length === 0 ? (
                    <div className="text-center py-8">
                        <Code2 className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400">No retargeting pixels yet</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Add Facebook, Google, or TikTok pixels to build audiences
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {pixels.map((pixel) => (
                                <motion.div
                                    key={pixel.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`flex items-center justify-between p-4 rounded-lg border ${pixel.isActive
                                            ? 'bg-[hsl(230,10%,14%)]/50 border-[hsl(230,10%,20%)]'
                                            : 'bg-[hsl(230,10%,14%)]/20 border-[hsl(230,10%,15%)] opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-[hsl(230,10%,14%)] ${getPixelColor(pixel.type)}`}>
                                            {getPixelIcon(pixel.type)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{pixel.name}</p>
                                            <p className="text-sm text-slate-500">
                                                {PIXEL_TYPES.find(t => t.value === pixel.type)?.label} • {pixel.pixelId}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 mr-2">
                                            {pixel._count?.urls || 0} links
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleActive(pixel)}
                                            className={pixel.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-400'}
                                        >
                                            {pixel.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(pixel)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(pixel.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RetargetingPixelsManager;
