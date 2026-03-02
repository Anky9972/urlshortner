import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Link as LinkIcon, TreeDeciduous, QrCode, BarChart2, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ONBOARDING_KEY = 'trimlink_onboarding_done';

const STEPS = [
    {
        icon: Zap,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10 border-yellow-400/20',
        title: 'Welcome to TrimLink! 🎉',
        description: 'TrimLink is your all-in-one link management platform. Shorten links, build pages, generate QR codes, and track clicks — all in one place.',
        action: null
    },
    {
        icon: LinkIcon,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10 border-blue-400/20',
        title: 'Shorten Any URL',
        description: 'Transform any long URL into a clean, shareable short link. Customize the slug, set expiry dates, add password protection, and more.',
        action: { label: 'Create your first link →', to: '/dashboard' }
    },
    {
        icon: TreeDeciduous,
        color: 'text-emerald-400',
        bg: 'bg-emerald-400/10 border-emerald-400/20',
        title: 'Build a LinkTree Page',
        description: 'Create a beautiful bio link page with all your important links in one place. Customize themes, add social icons, and share a single link.',
        action: { label: 'Build your LinkTree →', to: '/link-tree?create' }
    },
    {
        icon: QrCode,
        color: 'text-violet-400',
        bg: 'bg-violet-400/10 border-violet-400/20',
        title: 'Generate QR Codes',
        description: 'Create custom QR codes for any URL, vCard, Wi-Fi network, or text. Download as PNG, SVG, or PDF — with gradient colors and frames.',
        action: { label: 'Generate a QR code →', to: '/qr-code-generator' }
    },
    {
        icon: BarChart2,
        color: 'text-rose-400',
        bg: 'bg-rose-400/10 border-rose-400/20',
        title: 'Track Everything',
        description: 'See real-time analytics for every link: clicks by country, device, browser, and referrer. Your data, beautifully visualized.',
        action: { label: 'View analytics →', to: '/analytics' }
    },
];

export default function OnboardingTour() {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const done = localStorage.getItem(ONBOARDING_KEY);
        if (!done) {
            // Small delay to let the page settle
            const t = setTimeout(() => setVisible(true), 1200);
            return () => clearTimeout(t);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem(ONBOARDING_KEY, '1');
        setVisible(false);
    };

    const next = () => {
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else dismiss();
    };

    const current = STEPS[step];
    const Icon = current.icon;

    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
                        onClick={dismiss}
                    />
                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', bounce: 0.35, duration: 0.4 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-full max-w-md px-4"
                    >
                        <div className="rounded-2xl border border-[hsl(230,10%,18%)] bg-[hsl(230,15%,8%)] shadow-2xl overflow-hidden">
                            {/* Close */}
                            <div className="flex justify-between items-center px-5 pt-4">
                                <div className="flex gap-1">
                                    {STEPS.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setStep(i)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                                i === step ? 'w-6 bg-blue-500' : 'w-1.5 bg-[hsl(230,10%,22%)]'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={dismiss}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Icon */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-3"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${current.bg}`}>
                                            <Icon className={`w-6 h-6 ${current.color}`} />
                                        </div>
                                        <h2 className="text-lg font-bold text-white">{current.title}</h2>
                                        <p className="text-sm text-slate-400 leading-relaxed">{current.description}</p>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-1">
                                    {current.action && (
                                        <Link
                                            to={current.action.to}
                                            onClick={dismiss}
                                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                        >
                                            {current.action.label}
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    )}
                                    <div className="flex-1" />
                                    <button
                                        onClick={dismiss}
                                        className="text-xs text-slate-600 hover:text-slate-400 transition-colors px-2 py-1"
                                    >
                                        Skip tour
                                    </button>
                                    <button
                                        onClick={next}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                                    >
                                        {step === STEPS.length - 1 ? 'Get Started' : 'Next'}
                                        {step < STEPS.length - 1 ? <ChevronRight className="w-4 h-4" /> : null}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
