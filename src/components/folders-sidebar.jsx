import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Folder,
    FolderPlus,
    FolderOpen,
    ChevronRight,
    MoreHorizontal,
    Pencil,
    Trash2,
    Plus,
    X,
    Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

const FOLDER_COLORS = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#EF4444', '#6366F1'
];

const FoldersSidebar = ({
    folders = [],
    selectedFolder,
    onSelectFolder,
    onCreateFolder,
    onUpdateFolder,
    onDeleteFolder,
    isCollapsed = false
}) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);

    const handleCreate = () => {
        if (newFolderName.trim()) {
            onCreateFolder({ name: newFolderName.trim(), color: newFolderColor });
            setNewFolderName('');
            setNewFolderColor(FOLDER_COLORS[0]);
            setShowCreateForm(false);
        }
    };

    const handleUpdate = (id, name) => {
        if (name.trim()) {
            onUpdateFolder(id, { name: name.trim() });
            setEditingId(null);
        }
    };

    if (isCollapsed) {
        return (
            <div className="w-16 bg-[hsl(230,12%,9%)]/50 border-r border-[hsl(230,10%,15%)] p-2 space-y-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectFolder(null)}
                    className={`w-full p-2 ${!selectedFolder ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400'}`}
                >
                    <Folder className="w-5 h-5" />
                </Button>
                {folders.map((folder) => (
                    <Button
                        key={folder.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectFolder(folder.id)}
                        className={`w-full p-2 ${selectedFolder === folder.id ? 'bg-blue-600/20' : ''}`}
                    >
                        <Folder className="w-5 h-5" style={{ color: folder.color }} />
                    </Button>
                ))}
            </div>
        );
    }

    return (
        <div className="w-64 bg-[hsl(230,12%,9%)]/50 backdrop-blur-sm border-r border-[hsl(230,10%,15%)] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[hsl(230,10%,15%)]">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Folders</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="text-slate-400 hover:text-blue-400"
                    >
                        <FolderPlus className="w-4 h-4" />
                    </Button>
                </div>

                {/* Create Folder Form */}
                <AnimatePresence>
                    {showCreateForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-3"
                        >
                            <Input
                                placeholder="Folder name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-sm"
                                autoFocus
                            />
                            <div className="flex gap-1 flex-wrap">
                                {FOLDER_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewFolderColor(color)}
                                        className={`w-6 h-6 rounded-full transition-transform ${newFolderColor === color ? 'ring-2 ring-white scale-110' : ''
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleCreate}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                                >
                                    <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Folders List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {/* All Links */}
                <motion.button
                    onClick={() => onSelectFolder(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${!selectedFolder
                        ? 'bg-blue-600/10 border border-blue-600/30 text-white'
                        : 'text-slate-400 hover:bg-[hsl(230,10%,14%)]/50 hover:text-white'
                        }`}
                >
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                    <span className="flex-1 text-left text-sm font-medium">All Links</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${!selectedFolder ? 'rotate-90' : ''}`} />
                </motion.button>

                {/* User Folders */}
                {folders.map((folder) => (
                    <motion.div
                        key={folder.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group"
                    >
                        {editingId === folder.id ? (
                            <div className="flex items-center gap-2 px-2">
                                <Input
                                    defaultValue={folder.name}
                                    className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-sm h-8"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdate(folder.id, e.target.value);
                                        if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    onBlur={(e) => handleUpdate(folder.id, e.target.value)}
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => onSelectFolder(folder.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${selectedFolder === folder.id
                                    ? 'bg-blue-600/10 border border-blue-600/30 text-white'
                                    : 'text-slate-400 hover:bg-[hsl(230,10%,20%)]/30 hover:text-slate-200'
                                    }`}
                            >
                                <Folder className="w-5 h-5" style={{ color: folder.color }} />
                                <span className="flex-1 text-left text-sm font-medium truncate">
                                    {folder.name}
                                </span>
                                <span className="text-xs text-slate-500 mr-1">
                                    {folder._count?.urls || 0}
                                </span>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div
                                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[hsl(230,10%,20%)]/50 transition-all"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)]">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingId(folder.id);
                                            }}
                                            className="text-slate-300 hover:text-white"
                                        >
                                            <Pencil className="w-4 h-4 mr-2" />
                                            Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteFolder(folder.id);
                                            }}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default FoldersSidebar;
