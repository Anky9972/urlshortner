import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitBranch,
    Plus,
    Trash2,
    Edit2,
    BarChart3,
    Loader2,
    AlertCircle,
    Check,
    X,
    Percent,
    MousePointerClick,
    ChevronDown,
    ChevronUp
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
import { getSplits, createSplit, updateSplit, deleteSplit, getSplitStats } from '../api/splits';

const ABTestingPanel = ({ urlId, urlTitle }) => {
    const [splits, setSplits] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingSplit, setEditingSplit] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        targetUrl: '',
        weight: 50
    });
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (urlId) {
            fetchSplits();
        }
    }, [urlId]);

    const fetchSplits = async () => {
        try {
            setIsLoading(true);
            const [splitsData, statsData] = await Promise.all([
                getSplits(urlId),
                getSplitStats(urlId)
            ]);
            setSplits(splitsData);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching splits:', error);
            setError('Failed to load A/B test data');
        } finally {
            setIsLoading(false);
        }
    };

    const totalWeight = splits.reduce((sum, s) => sum + (s.isActive ? s.weight : 0), 0);
    const remainingWeight = 100 - totalWeight + (editingSplit?.weight || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            if (editingSplit) {
                await updateSplit(editingSplit.id, formData);
            } else {
                await createSplit({ ...formData, urlId });
            }
            await fetchSplits();
            handleCloseDialog();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (split) => {
        setEditingSplit(split);
        setFormData({
            name: split.name || '',
            targetUrl: split.targetUrl,
            weight: split.weight
        });
        setShowCreateDialog(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this variant?')) return;
        try {
            await deleteSplit(id);
            await fetchSplits();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCloseDialog = () => {
        setShowCreateDialog(false);
        setEditingSplit(null);
        setFormData({ name: '', targetUrl: '', weight: 50 });
        setError(null);
    };

    if (isLoading) {
        return (
            <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
            <CardHeader
                className="flex flex-row items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-amber-400" />
                    <div>
                        <CardTitle className="text-lg font-semibold text-white">
                            A/B Split Testing
                        </CardTitle>
                        {splits.length > 0 && (
                            <p className="text-sm text-slate-500">
                                {splits.length} variant{splits.length > 1 ? 's' : ''} • {stats?.totalClicks || 0} total clicks
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {splits.length > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${totalWeight === 100
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            {totalWeight}% allocated
                        </span>
                    )}
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                </div>
            </CardHeader>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <CardContent className="pt-0">
                            {splits.length === 0 ? (
                                <div className="text-center py-6">
                                    <GitBranch className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                                    <p className="text-slate-400">No A/B test configured</p>
                                    <p className="text-sm text-slate-500 mt-1 mb-4">
                                        Split traffic between multiple destinations
                                    </p>
                                    <Button
                                        onClick={() => setShowCreateDialog(true)}
                                        className="bg-amber-500 hover:bg-amber-400 text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Variant
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Weight distribution bar */}
                                    <div className="h-3 rounded-full bg-[hsl(230,10%,14%)] overflow-hidden flex">
                                        {splits.filter(s => s.isActive).map((split, index) => (
                                            <div
                                                key={split.id}
                                                className={`h-full transition-all ${index % 2 === 0 ? 'bg-blue-600' : 'bg-amber-500'
                                                    }`}
                                                style={{ width: `${split.weight}%` }}
                                                title={`${split.name || `Variant ${index + 1}`}: ${split.weight}%`}
                                            />
                                        ))}
                                        {totalWeight < 100 && (
                                            <div
                                                className="h-full bg-[hsl(230,10%,20%)]"
                                                style={{ width: `${100 - totalWeight}%` }}
                                            />
                                        )}
                                    </div>

                                    {/* Variants list */}
                                    <div className="space-y-2">
                                        {splits.map((split, index) => (
                                            <div
                                                key={split.id}
                                                className={`flex items-center justify-between p-3 rounded-lg border ${split.isActive
                                                        ? 'bg-[hsl(230,10%,14%)]/50 border-[hsl(230,10%,20%)]'
                                                        : 'bg-[hsl(230,10%,14%)]/20 border-[hsl(230,10%,15%)] opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${index % 2 === 0 ? 'bg-blue-600' : 'bg-amber-500'
                                                        }`} />
                                                    <div>
                                                        <p className="font-medium text-white text-sm">
                                                            {split.name || `Variant ${index + 1}`}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                                            {split.targetUrl}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Percent className="w-3 h-3 text-slate-500" />
                                                        <span className="text-slate-300">{split.weight}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MousePointerClick className="w-3 h-3 text-slate-500" />
                                                        <span className="text-slate-300">{split.clicks}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(split)}
                                                            className="text-slate-400 hover:text-white h-7 w-7 p-0"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(split.id)}
                                                            className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add variant button */}
                                    {totalWeight < 100 && (
                                        <Button
                                            onClick={() => setShowCreateDialog(true)}
                                            variant="outline"
                                            className="w-full border-dashed border-[hsl(230,10%,20%)] text-slate-400 hover:text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Variant ({remainingWeight}% remaining)
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Create/Edit Dialog */}
                            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                                <DialogContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
                                    <DialogHeader>
                                        <DialogTitle className="text-white">
                                            {editingSplit ? 'Edit Variant' : 'Add A/B Variant'}
                                        </DialogTitle>
                                        <DialogDescription className="text-slate-400">
                                            Configure a destination and traffic weight for this variant.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Variant Name (optional)</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="e.g., Landing Page A"
                                                className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)]"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">Destination URL</label>
                                            <Input
                                                value={formData.targetUrl}
                                                onChange={(e) => setFormData(prev => ({ ...prev, targetUrl: e.target.value }))}
                                                placeholder="https://example.com/landing-page-a"
                                                className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)]"
                                                required
                                                type="url"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300">
                                                Traffic Weight: {formData.weight}%
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max={remainingWeight}
                                                value={formData.weight}
                                                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                                                className="w-full accent-blue-600"
                                            />
                                            <p className="text-xs text-slate-500">
                                                {remainingWeight}% of traffic remaining to allocate
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
                                                ) : editingSplit ? (
                                                    <>
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Update
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Add Variant
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default ABTestingPanel;
