import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Link as LinkIcon, TreeDeciduous, ExternalLink,
    MousePointerClick, BarChart2, X, Loader2
} from 'lucide-react';
import { SEOMetadata } from '@/components/seo-metadata';
import { UrlState } from '@/context';
import { getToken } from '@/api/token';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function searchAll(query) {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
}

const SearchPage = () => {
    const { user } = UrlState();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQ = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQ);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    // Debounce
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        if (!debouncedQuery.trim() || debouncedQuery.trim().length < 2) {
            setResults(null);
            return;
        }
        setSearchParams({ q: debouncedQuery }, { replace: true });
        setLoading(true);
        searchAll(debouncedQuery)
            .then(setResults)
            .catch(() => setResults({ urls: [], linktrees: [] }))
            .finally(() => setLoading(false));
    }, [debouncedQuery]);

    // Autofocus
    useEffect(() => { inputRef.current?.focus(); }, []);

    const totalResults = (results?.urls?.length || 0) + (results?.linktrees?.length || 0);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400">Please log in to search.</p>
            </div>
        );
    }

    return (
        <>
            <SEOMetadata
                title="Search | TrimLink"
                description="Search across all your shortened URLs and LinkTree pages"
            />
            <div className="min-h-screen pt-24 pb-16 px-4">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-1"
                    >
                        <h1 className="text-2xl font-bold text-white">Global Search</h1>
                        <p className="text-sm text-slate-400">Search across all your links and LinkTree pages</p>
                    </motion.div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search links, titles, slugs..."
                            className="w-full pl-10 pr-10 py-3 rounded-xl bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] text-white placeholder:text-slate-500 focus:border-blue-600/50 focus:outline-none text-sm transition-colors"
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(''); setResults(null); }}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        </div>
                    )}

                    {/* Results */}
                    <AnimatePresence mode="wait">
                        {!loading && results && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="space-y-5"
                            >
                                {totalResults === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                        <p>No results found for "{debouncedQuery}"</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">{totalResults} result{totalResults !== 1 ? 's' : ''} for "{debouncedQuery}"</p>
                                )}

                                {/* URLs */}
                                {results.urls?.length > 0 && (
                                    <div className="space-y-2">
                                        <h2 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <LinkIcon className="w-3.5 h-3.5" /> Short Links ({results.urls.length})
                                        </h2>
                                        {results.urls.map(url => (
                                            <motion.div
                                                key={url.id}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-start gap-3 p-3.5 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] hover:border-blue-600/30 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <LinkIcon className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={`/link/${url.id}`}
                                                            className="font-medium text-white text-sm hover:text-blue-400 transition-colors truncate"
                                                        >
                                                            {url.title || url.shortUrl}
                                                        </Link>
                                                        <a
                                                            href={url.originalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{url.originalUrl}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-xs text-slate-600 font-mono">/{url.customUrl || url.shortUrl}</span>
                                                        <span className="text-xs text-slate-600 flex items-center gap-1">
                                                            <MousePointerClick className="w-3 h-3" />
                                                            {url._count?.clicks || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* LinkTrees */}
                                {results.linktrees?.length > 0 && (
                                    <div className="space-y-2">
                                        <h2 className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <TreeDeciduous className="w-3.5 h-3.5" /> LinkTrees ({results.linktrees.length})
                                        </h2>
                                        {results.linktrees.map(tree => (
                                            <motion.div
                                                key={tree.id}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-start gap-3 p-3.5 rounded-xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] hover:border-violet-600/30 transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <TreeDeciduous className="w-4 h-4 text-violet-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            to={`/edit/${tree.id}`}
                                                            className="font-medium text-white text-sm hover:text-violet-400 transition-colors truncate"
                                                        >
                                                            {tree.title}
                                                        </Link>
                                                        <a
                                                            href={`/share/${tree.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{tree.description || 'No description'}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-xs text-slate-600 font-mono">/{tree.slug}</span>
                                                        <span className="text-xs text-slate-600 flex items-center gap-1">
                                                            <BarChart2 className="w-3 h-3" />
                                                            {tree.viewCount || 0} views
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {!loading && !results && query.trim().length < 2 && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 text-slate-600"
                            >
                                <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Type at least 2 characters to search</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default SearchPage;
