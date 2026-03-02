import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Copy, Check, ChevronDown, ChevronUp, Key, Globe, Zap, Shield } from 'lucide-react';
import { SEOMetadata } from '@/components/seo-metadata';

const BASE_URL = 'https://urlshortner-onhm.onrender.com';

const BADGE_COLORS = {
    GET: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
    POST: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    PUT: 'bg-amber-600/20 text-amber-400 border-amber-600/30',
    PATCH: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
    DELETE: 'bg-red-600/20 text-red-400 border-red-600/30',
};

const endpoints = [
    {
        section: 'Authentication',
        icon: Shield,
        color: 'text-blue-400',
        items: [
            {
                method: 'POST', path: '/api/auth/register',
                description: 'Create a new account',
                body: { name: 'Alice', email: 'alice@example.com', password: 'secret123' },
                response: { token: 'jwt...', user: { id: '...', email: 'alice@example.com' } }
            },
            {
                method: 'POST', path: '/api/auth/login',
                description: 'Login with email and password',
                body: { email: 'alice@example.com', password: 'secret123' },
                response: { token: 'jwt...', user: { id: '...', email: 'alice@example.com' } }
            },
            {
                method: 'GET', path: '/api/auth/me',
                description: 'Get current authenticated user',
                auth: true,
                response: { id: '...', email: 'alice@example.com', name: 'Alice' }
            },
        ]
    },
    {
        section: 'Short Links',
        icon: Globe,
        color: 'text-emerald-400',
        items: [
            {
                method: 'GET', path: '/api/urls',
                description: 'List all your short links',
                auth: true,
                response: [{ id: '...', title: 'My Link', shortUrl: 'abc123', originalUrl: 'https://...', currentClicks: 42 }]
            },
            {
                method: 'POST', path: '/api/urls',
                description: 'Create a new short link',
                auth: true,
                body: { title: 'My Link', originalUrl: 'https://example.com', customUrl: 'my-link' },
                response: { id: '...', shortUrl: 'my-link', originalUrl: 'https://example.com' }
            },
            {
                method: 'PUT', path: '/api/urls/:id',
                description: 'Update a short link',
                auth: true,
                body: { title: 'Updated Title', isActive: false },
                response: { id: '...', title: 'Updated Title' }
            },
            {
                method: 'DELETE', path: '/api/urls/:id',
                description: 'Delete a short link',
                auth: true,
                response: { message: 'URL deleted' }
            },
        ]
    },
    {
        section: 'Analytics',
        icon: Zap,
        color: 'text-violet-400',
        items: [
            {
                method: 'GET', path: '/api/clicks',
                description: 'Get click analytics for your links',
                auth: true,
                response: [{ id: '...', country: 'US', device: 'desktop', browser: 'Chrome', createdAt: '...' }]
            },
        ]
    },
    {
        section: 'API Keys',
        icon: Key,
        color: 'text-amber-400',
        items: [
            {
                method: 'GET', path: '/api/keys',
                description: 'List your API keys',
                auth: true,
                response: [{ id: '...', name: 'My Key', key: 'tl_live_...', permissions: ['read', 'write'] }]
            },
            {
                method: 'POST', path: '/api/keys',
                description: 'Create a new API key',
                auth: true,
                body: { name: 'My Key', permissions: ['read'] },
                response: { id: '...', key: 'tl_live_...' }
            },
            {
                method: 'DELETE', path: '/api/keys/:id',
                description: 'Revoke an API key',
                auth: true,
                response: { message: 'API key deleted' }
            },
        ]
    },
];

function CodeBlock({ code }) {
    const [copied, setCopied] = useState(false);
    const formatted = typeof code === 'object' ? JSON.stringify(code, null, 2) : code;
    return (
        <div className="relative group">
            <pre className="bg-[hsl(230,15%,7%)] rounded-xl p-3.5 text-xs text-slate-300 font-mono overflow-x-auto border border-[hsl(230,10%,13%)]">
                {formatted}
            </pre>
            <button
                onClick={() => { navigator.clipboard.writeText(formatted); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-[hsl(230,10%,16%)] border border-[hsl(230,10%,22%)] opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            </button>
        </div>
    );
}

function EndpointCard({ item }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-[hsl(230,10%,15%)] rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-4 hover:bg-[hsl(230,10%,10%)] transition-colors text-left"
            >
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border font-mono ${BADGE_COLORS[item.method]}`}>
                    {item.method}
                </span>
                <code className="text-sm text-white font-mono">{item.path}</code>
                <span className="text-sm text-slate-500 ml-2 hidden sm:block">{item.description}</span>
                {item.auth && <span className="ml-auto text-xs text-amber-400/70 flex items-center gap-1 shrink-0"><Key className="w-3 h-3" /> Auth</span>}
                {open ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-2" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />}
            </button>
            {open && (
                <div className="border-t border-[hsl(230,10%,15%)] p-4 space-y-3 bg-[hsl(230,12%,8%)]">
                    <p className="text-sm text-slate-400">{item.description}</p>
                    {item.auth && (
                        <div className="text-xs text-amber-400/80 flex items-center gap-1.5 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
                            <Shield className="w-3.5 h-3.5" />
                            Requires <code className="font-mono">Authorization: Bearer &lt;token&gt;</code> header or session cookie
                        </div>
                    )}
                    {item.body && (
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Request Body</p>
                            <CodeBlock code={item.body} />
                        </div>
                    )}
                    {item.response && (
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Response</p>
                            <CodeBlock code={item.response} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const ApiDocsPage = () => {
    const [copied, setCopied] = useState(false);

    return (
        <>
            <SEOMetadata
                title="API Documentation | TrimLink"
                description="Public REST API reference for TrimLink — shorten URLs, manage links, and access analytics programmatically."
            />
            <div className="min-h-screen pt-24 pb-20 px-4">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Hero */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                                <Code2 className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">API Reference</h1>
                                <p className="text-sm text-slate-500">REST API — all responses are JSON</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Base URL */}
                    <div className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4 space-y-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Base URL</p>
                        <div className="flex items-center gap-2">
                            <code className="text-sm text-blue-400 font-mono bg-blue-600/10 px-3 py-1.5 rounded-lg border border-blue-600/20 flex-1 truncate">
                                {BASE_URL}
                            </code>
                            <button
                                onClick={() => { navigator.clipboard.writeText(BASE_URL); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                className="p-2 rounded-lg bg-[hsl(230,10%,14%)] border border-[hsl(230,10%,20%)] hover:border-blue-600/30 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                            </button>
                        </div>
                    </div>

                    {/* Auth guide */}
                    <div className="rounded-xl border border-amber-600/20 bg-amber-600/5 p-4 space-y-2">
                        <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2"><Key className="w-4 h-4" /> Authentication</h3>
                        <p className="text-xs text-slate-400">
                            Most endpoints require a JWT token. Get one by calling <code className="font-mono text-white bg-white/10 px-1 rounded">POST /api/auth/login</code>, then pass it as:
                        </p>
                        <CodeBlock code={'Authorization: Bearer <your_token>'} />
                        <p className="text-xs text-slate-500">Or use API keys (for server-to-server): go to <strong className="text-slate-300">Settings → API Keys</strong> to generate one.</p>
                    </div>

                    {/* Endpoints */}
                    {endpoints.map(({ section, icon: Icon, color, items }) => (
                        <motion.div
                            key={section}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <h2 className={`text-sm font-semibold flex items-center gap-2 ${color}`}>
                                <Icon className="w-4 h-4" /> {section}
                            </h2>
                            <div className="space-y-2">
                                {items.map((item, i) => <EndpointCard key={i} item={item} />)}
                            </div>
                        </motion.div>
                    ))}

                    {/* Rate limiting note */}
                    <div className="rounded-xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] p-4">
                        <h3 className="text-sm font-semibold text-white mb-1">Rate Limiting</h3>
                        <p className="text-xs text-slate-400">
                            The API is rate-limited to <strong className="text-slate-300">100 requests / 15 minutes</strong> per IP address.
                            API keys have configurable limits (up to 1000 req/hour). Exceeding limits returns <code className="font-mono text-amber-400">429 Too Many Requests</code>.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ApiDocsPage;
