import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Download,
    Trash2,
    FolderInput,
    Tag,
    CheckSquare,
    Square,
    X,
    FileSpreadsheet,
    AlertTriangle,
    Check,
    Loader2
} from 'lucide-react';
import { Button } from './ui/button';
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

const BulkOperations = ({
    urls = [],
    selectedIds = [],
    onSelectAll,
    onDeselectAll,
    onBulkDelete,
    onBulkMove,
    onBulkTag,
    onExport,
    onImport,
    folders = [],
    tags = []
}) => {
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showMoveDialog, setShowMoveDialog] = useState(false);
    const [showTagDialog, setShowTagDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [importData, setImportData] = useState([]);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    const hasSelection = selectedIds.length > 0;
    const allSelected = urls.length > 0 && selectedIds.length === urls.length;

    // Export to CSV
    const handleExport = () => {
        const headers = ['Title', 'Short URL', 'Original URL', 'Clicks', 'Created At', 'Expires At', 'Custom URL'];
        const csvContent = [
            headers.join(','),
            ...urls.map(url => [
                `"${url.title || ''}"`,
                `"https://trimlynk.com/${url.short_url || url.shortUrl}"`,
                `"${url.original_url || url.originalUrl}"`,
                url._count?.clicks || url.currentClicks || 0,
                url.created_at || url.createdAt,
                url.expiration_date || url.expiresAt || '',
                url.custom_url || url.customUrl || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `trimlink-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        onExport?.();
    };

    // Handle file selection for import
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            const lines = text.split('\n').filter(line => line.trim());

            // Skip header row
            const dataRows = lines.slice(1);
            const parsed = dataRows.map(line => {
                // Simple CSV parsing (handles quoted fields)
                const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const values = matches.map(v => v.replace(/^"|"$/g, ''));

                return {
                    title: values[0] || '',
                    originalUrl: values[1] || values[2] || '',
                    customUrl: values[3] || ''
                };
            }).filter(row => row.originalUrl);

            setImportData(parsed);
        };
        reader.readAsText(file);
    };

    // Process import
    const handleImport = async () => {
        if (importData.length === 0) return;

        setImporting(true);
        try {
            await onImport?.(importData);
            setImportResult({ success: true, count: importData.length });
        } catch (error) {
            setImportResult({ success: false, error: error.message });
        } finally {
            setImporting(false);
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        await onBulkDelete?.(selectedIds);
        setShowDeleteConfirm(false);
    };

    // Bulk move to folder
    const handleBulkMove = async () => {
        if (selectedFolder) {
            await onBulkMove?.(selectedIds, selectedFolder);
            setShowMoveDialog(false);
            setSelectedFolder('');
        }
    };

    // Bulk add tag
    const handleBulkTag = async () => {
        if (selectedTag) {
            await onBulkTag?.(selectedIds, selectedTag);
            setShowTagDialog(false);
            setSelectedTag('');
        }
    };

    return (
        <div className="space-y-4">
            {/* Selection Bar */}
            <Card className="glass-card">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Select All / Deselect */}
                        <button
                            onClick={() => allSelected ? onDeselectAll?.() : onSelectAll?.()}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {allSelected ? (
                                <CheckSquare className="w-5 h-5 text-blue-400" />
                            ) : (
                                <Square className="w-5 h-5" />
                            )}
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </button>

                        {hasSelection && (
                            <span className="text-sm text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                                {selectedIds.length} selected
                            </span>
                        )}

                        <div className="flex-1" />

                        {/* Bulk Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Export */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExport}
                                className="border-gray-700 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:text-emerald-400"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </Button>

                            {/* Import */}
                            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-gray-700 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Import CSV
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-gray-900 border-gray-700">
                                    <DialogHeader>
                                        <DialogTitle className="gradient-text">Import Links from CSV</DialogTitle>
                                        <DialogDescription className="text-gray-400">
                                            Upload a CSV file with columns: Title, Original URL, Custom URL (optional)
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 mt-4">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                                        >
                                            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                                            <p className="text-gray-400">Click to select CSV file</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </div>

                                        {importData.length > 0 && (
                                            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                                                <p className="text-sm text-gray-300">
                                                    <Check className="w-4 h-4 inline mr-2 text-emerald-400" />
                                                    {importData.length} links ready to import
                                                </p>
                                            </div>
                                        )}

                                        {importResult && (
                                            <div className={`p-4 rounded-lg ${importResult.success
                                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                                }`}>
                                                {importResult.success
                                                    ? `Successfully imported ${importResult.count} links!`
                                                    : `Error: ${importResult.error}`}
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleImport}
                                            disabled={importData.length === 0 || importing}
                                            className="w-full bg-blue-500 hover:bg-blue-600"
                                        >
                                            {importing ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4 mr-2" />
                                            )}
                                            Import {importData.length} Links
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Bulk Move - Only show when items selected */}
                            {hasSelection && (
                                <>
                                    <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-700 hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-400"
                                            >
                                                <FolderInput className="w-4 h-4 mr-2" />
                                                Move to Folder
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-900 border-gray-700">
                                            <DialogHeader>
                                                <DialogTitle>Move {selectedIds.length} Links to Folder</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 mt-4">
                                                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                                                    <SelectTrigger className="bg-gray-800 border-gray-700">
                                                        <SelectValue placeholder="Select folder" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">No Folder</SelectItem>
                                                        {folders.map(folder => (
                                                            <SelectItem key={folder.id} value={folder.id}>
                                                                {folder.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button onClick={handleBulkMove} className="w-full bg-purple-500 hover:bg-purple-600">
                                                    Move Links
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-700 hover:bg-amber-500/10 hover:border-amber-500/50 hover:text-amber-400"
                                            >
                                                <Tag className="w-4 h-4 mr-2" />
                                                Add Tag
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-900 border-gray-700">
                                            <DialogHeader>
                                                <DialogTitle>Add Tag to {selectedIds.length} Links</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 mt-4">
                                                <Select value={selectedTag} onValueChange={setSelectedTag}>
                                                    <SelectTrigger className="bg-gray-800 border-gray-700">
                                                        <SelectValue placeholder="Select tag" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {tags.map(tag => (
                                                            <SelectItem key={tag.id} value={tag.id}>
                                                                {tag.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button onClick={handleBulkTag} className="w-full bg-amber-500 hover:bg-amber-600">
                                                    Add Tag
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Bulk Delete */}
                                    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-700 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-900 border-gray-700">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2 text-red-400">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    Delete {selectedIds.length} Links?
                                                </DialogTitle>
                                                <DialogDescription className="text-gray-400">
                                                    This action cannot be undone. All selected links and their analytics data will be permanently deleted.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex gap-3 mt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowDeleteConfirm(false)}
                                                    className="flex-1 border-gray-700"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleBulkDelete}
                                                    className="flex-1 bg-red-500 hover:bg-red-600"
                                                >
                                                    Delete Links
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BulkOperations;
