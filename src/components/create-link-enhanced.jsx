import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link2,
    Sparkles,
    Calendar,
    Lock,
    Eye,
    EyeOff,
    Target,
    Hash,
    Folder,
    ChevronDown,
    ChevronUp,
    Plus,
    X,
    Zap,
    Clock,
    MousePointerClick,
    Tag,
    EyeOff as Cloak,
    Check,
    Code2,
    AlertCircle,
    ArrowRight,
} from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import Modal from './modal';
import UTMBuilder from './utm-builder';
import { BeatLoader } from 'react-spinners';
import { UrlState } from '../context';
import PropTypes from 'prop-types';

/* ── Reusable input ── */
const FormInput = ({ icon: Icon, iconColor = "text-blue-400", label, error, className = "", ...props }) => (
    <div className="space-y-1.5">
        {label && (
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor}`} />}
                {label}
            </label>
        )}
        <input
            {...props}
            className={`w-full h-10 px-3 rounded-xl bg-[hsl(230,10%,10%)] border text-white placeholder:text-slate-600 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 ${error ? "border-red-500/40" : "border-[hsl(230,10%,18%)] hover:border-[hsl(230,10%,25%)]"} ${className}`}
        />
        {error && <p className="text-xs text-red-400 pl-1">{error}</p>}
    </div>
);

/* ── Toggle switch ── */
const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${checked ? "bg-blue-600" : "bg-[hsl(230,10%,18%)]"}`}
        style={{ minWidth: 40, height: 22 }}
    >
        <span
            className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-[18px]" : ""}`}
        />
    </button>
);

const CreateLinkEnhanced = ({ onSuccess, folders = [], tags = [], pixels = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        longUrl: '',
        customUrl: '',
        expirationDate: '',
        password: '',
        clickLimit: '',
        activatesAt: '',
        deactivatesAt: '',
        folderId: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        utmTerm: '',
        utmContent: '',
        isCloaked: false,
        selectedTags: [],
        selectedPixels: [],
        isRotator: false,
        rotatorDestinations: []
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const qrRef = useRef(null);

    const { user } = UrlState();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleUTMChange = (utmData) => {
        setFormData(prev => ({
            ...prev,
            utmSource: utmData.utmSource,
            utmMedium: utmData.utmMedium,
            utmCampaign: utmData.utmCampaign,
            utmTerm: utmData.utmTerm,
            utmContent: utmData.utmContent
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.longUrl.trim()) newErrors.longUrl = 'URL is required';
        try { new URL(formData.longUrl); } catch { newErrors.longUrl = 'Invalid URL format'; }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const canvas = qrRef.current?.querySelector('canvas');
            const blob = await new Promise(resolve => canvas?.toBlob(resolve));

            const { createUrl } = await import('../api/urls');

            const createdUrls = await createUrl({
                title: formData.title,
                longUrl: formData.longUrl,
                customUrl: formData.customUrl || null,
                userId: user.id,
                expirationDate: formData.expirationDate || null,
                password: formData.password || null,
                clickLimit: formData.clickLimit ? parseInt(formData.clickLimit) : null,
                activatesAt: formData.activatesAt || null,
                deactivatesAt: formData.deactivatesAt || null,
                folderId: formData.folderId || null,
                utmSource: formData.utmSource || null,
                utmMedium: formData.utmMedium || null,
                utmCampaign: formData.utmCampaign || null,
                utmTerm: formData.utmTerm || null,
                utmContent: formData.utmContent || null,
                isCloaked: formData.isCloaked,
                pixels: formData.selectedPixels,
                isRotator: formData.isRotator,
                rotatorConfig: formData.isRotator && formData.rotatorDestinations?.length > 0 ? {
                    destinations: formData.rotatorDestinations.map(d => ({ targetUrl: d.url, weight: d.weight, name: 'Variant' }))
                } : null
            }, blob);

            if (formData.selectedTags.length > 0 && createdUrls?.[0]?.id) {
                const { addTagToUrl } = await import('../api/folders');
                for (const tagId of formData.selectedTags) {
                    await addTagToUrl(createdUrls[0].id, tagId);
                }
            }

            setFormData({
                title: '', longUrl: '', customUrl: '', expirationDate: '', password: '',
                clickLimit: '', activatesAt: '', deactivatesAt: '', folderId: '',
                utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '',
                isCloaked: false, selectedTags: [], selectedPixels: [], isRotator: false, rotatorDestinations: []
            });
            setIsOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error creating link:', error);
            setErrors({ submit: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => setIsOpen(false);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all hover:shadow-[0_4px_20px_-4px_hsl(220,90%,56%,0.4)]"
            >
                <Plus className="w-4 h-4" />
                Create Link
            </button>

            {/* Modal */}
            <Modal isOpen={isOpen} onClose={closeModal}>
                <div className="max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto rounded-2xl bg-[hsl(230,12%,9%)] border border-[hsl(230,10%,15%)] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)] custom-scrollbar">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[hsl(230,10%,14%)] bg-[hsl(230,12%,9%)]/95 backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Create New Link</h2>
                                <p className="text-xs text-slate-500">Shorten, brand, and track your URL</p>
                            </div>
                        </div>
                        <button
                            onClick={closeModal}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* ─── Basic Info ─── */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    icon={Hash}
                                    iconColor="text-blue-400"
                                    label="Title"
                                    name="title"
                                    placeholder="My awesome link"
                                    value={formData.title}
                                    onChange={handleChange}
                                    error={errors.title}
                                />
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <Link2 className="w-3.5 h-3.5 text-blue-400" />
                                        Custom Slug
                                        <span className="text-slate-600 text-xs font-normal">(optional)</span>
                                    </label>
                                    <div className="flex items-center h-10 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] hover:border-[hsl(230,10%,25%)] transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20">
                                        <span className="pl-3 text-xs text-slate-500 font-mono shrink-0 select-none">
                                            {import.meta.env.VITE_APP_DOMAIN || 'trimlynk.com'}/
                                        </span>
                                        <input
                                            name="customUrl"
                                            placeholder="my-brand"
                                            value={formData.customUrl}
                                            onChange={handleChange}
                                            className="flex-1 h-full px-1 bg-transparent text-white placeholder:text-slate-600 text-sm focus:outline-none font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <FormInput
                                icon={Link2}
                                iconColor="text-violet-400"
                                label="Destination URL"
                                name="longUrl"
                                type="url"
                                placeholder="https://example.com/very-long-url-here"
                                value={formData.longUrl}
                                onChange={handleChange}
                                error={errors.longUrl}
                            />
                        </div>

                        {/* QR Preview */}
                        <AnimatePresence>
                            {formData.longUrl && !errors.longUrl && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex justify-center"
                                >
                                    <div ref={qrRef} className="p-3 bg-white rounded-xl shadow-lg">
                                        <QRCode value={formData.longUrl} size={100} quietZone={8} ecLevel="H" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── Advanced Toggle ─── */}
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.04] border border-[hsl(230,10%,14%)] hover:border-[hsl(230,10%,22%)] transition-all"
                        >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            Advanced Options
                            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* ─── Advanced Options ─── */}
                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-5 overflow-hidden"
                                >
                                    <div className="h-px bg-gradient-to-r from-transparent via-[hsl(230,10%,18%)] to-transparent" />

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                                            Password Protection
                                            <span className="text-slate-600 text-xs font-normal">(optional)</span>
                                        </label>
                                        <div className="flex items-center h-10 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] hover:border-[hsl(230,10%,25%)] transition-all focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20">
                                            <Lock className="w-3.5 h-3.5 ml-3 text-slate-500 shrink-0" />
                                            <input
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter password to protect link"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="flex-1 h-full px-2.5 bg-transparent text-white placeholder:text-slate-600 text-sm focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="px-3 text-slate-500 hover:text-slate-300 transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scheduling */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput
                                            icon={Clock}
                                            iconColor="text-emerald-400"
                                            label="Activates At"
                                            name="activatesAt"
                                            type="datetime-local"
                                            value={formData.activatesAt}
                                            onChange={handleChange}
                                            className="custom-datetime-input"
                                        />
                                        <FormInput
                                            icon={Clock}
                                            iconColor="text-rose-400"
                                            label="Deactivates At"
                                            name="deactivatesAt"
                                            type="datetime-local"
                                            value={formData.deactivatesAt}
                                            onChange={handleChange}
                                            className="custom-datetime-input"
                                        />
                                    </div>

                                    {/* Click limit & Expiration */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormInput
                                            icon={MousePointerClick}
                                            iconColor="text-blue-400"
                                            label="Click Limit"
                                            name="clickLimit"
                                            type="number"
                                            placeholder="Unlimited"
                                            value={formData.clickLimit}
                                            onChange={handleChange}
                                        />
                                        <FormInput
                                            icon={Calendar}
                                            iconColor="text-pink-400"
                                            label="Expiration Date"
                                            name="expirationDate"
                                            type="datetime-local"
                                            value={formData.expirationDate}
                                            onChange={handleChange}
                                            className="custom-datetime-input"
                                        />
                                    </div>

                                    {/* Folder */}
                                    {folders.length > 0 && (
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                <Folder className="w-3.5 h-3.5 text-blue-400" />
                                                Folder
                                            </label>
                                            <select
                                                name="folderId"
                                                value={formData.folderId}
                                                onChange={handleChange}
                                                className="w-full h-10 px-3 rounded-xl bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-slate-200 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-[hsl(230,10%,25%)] appearance-none cursor-pointer"
                                            >
                                                <option value="">No folder</option>
                                                {folders.map(folder => (
                                                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {tags.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                <Tag className="w-3.5 h-3.5 text-amber-400" />
                                                Tags
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map(tag => {
                                                    const isSelected = formData.selectedTags.includes(tag.id);
                                                    return (
                                                        <button
                                                            key={tag.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    selectedTags: isSelected
                                                                        ? prev.selectedTags.filter(id => id !== tag.id)
                                                                        : [...prev.selectedTags, tag.id]
                                                                }));
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${isSelected
                                                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                                : 'bg-white/[0.03] text-slate-400 border border-[hsl(230,10%,18%)] hover:border-[hsl(230,10%,25%)] hover:text-slate-300'
                                                                }`}
                                                        >
                                                            {isSelected && <Check className="w-3 h-3" />}
                                                            {tag.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pixels */}
                                    {pixels.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                <Code2 className="w-3.5 h-3.5 text-pink-400" />
                                                Retargeting Pixels
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {pixels.filter(p => p.isActive).map(pixel => {
                                                    const isSelected = formData.selectedPixels.includes(pixel.id);
                                                    return (
                                                        <button
                                                            key={pixel.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    selectedPixels: isSelected
                                                                        ? prev.selectedPixels.filter(id => id !== pixel.id)
                                                                        : [...prev.selectedPixels, pixel.id]
                                                                }));
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${isSelected
                                                                ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                                                                : 'bg-white/[0.03] text-slate-400 border border-[hsl(230,10%,18%)] hover:border-[hsl(230,10%,25%)] hover:text-slate-300'
                                                                }`}
                                                        >
                                                            {isSelected && <Check className="w-3 h-3" />}
                                                            {pixel.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Cloaking */}
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-[hsl(230,10%,15%)]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                                <Cloak className="w-4 h-4 text-violet-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-200">URL Cloaking</p>
                                                <p className="text-[11px] text-slate-500">Hide destination URL from address bar</p>
                                            </div>
                                        </div>
                                        <Toggle
                                            checked={formData.isCloaked}
                                            onChange={(checked) => setFormData(prev => ({ ...prev, isCloaked: checked }))}
                                        />
                                    </div>

                                    {/* Rotator */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-[hsl(230,10%,15%)]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                                    <Target className="w-4 h-4 text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">Rotator Link</p>
                                                    <p className="text-[11px] text-slate-500">Split test between multiple destinations</p>
                                                </div>
                                            </div>
                                            <Toggle
                                                checked={formData.isRotator}
                                                onChange={(checked) => setFormData(prev => ({ ...prev, isRotator: checked }))}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {formData.isRotator && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-2.5 pl-4 border-l-2 border-orange-500/20 overflow-hidden"
                                                >
                                                    <p className="text-xs text-slate-500">Destinations (first URL is default)</p>
                                                    {formData.rotatorDestinations?.map((dest, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <input
                                                                placeholder="https://example.com/variant"
                                                                value={dest.url}
                                                                onChange={(e) => {
                                                                    const newDests = [...formData.rotatorDestinations];
                                                                    newDests[index].url = e.target.value;
                                                                    setFormData(prev => ({ ...prev, rotatorDestinations: newDests }));
                                                                }}
                                                                className="flex-1 h-9 px-3 rounded-lg bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-white placeholder:text-slate-600 text-sm focus:outline-none focus:border-orange-500/50"
                                                            />
                                                            <input
                                                                type="number"
                                                                placeholder="Wt"
                                                                value={dest.weight}
                                                                onChange={(e) => {
                                                                    const newDests = [...formData.rotatorDestinations];
                                                                    newDests[index].weight = parseInt(e.target.value) || 0;
                                                                    setFormData(prev => ({ ...prev, rotatorDestinations: newDests }));
                                                                }}
                                                                className="w-16 h-9 px-2 rounded-lg bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] text-white text-sm text-center focus:outline-none focus:border-orange-500/50"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newDests = formData.rotatorDestinations.filter((_, i) => i !== index);
                                                                    setFormData(prev => ({ ...prev, rotatorDestinations: newDests }));
                                                                }}
                                                                className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            rotatorDestinations: [...(prev.rotatorDestinations || []), { url: '', weight: 1 }]
                                                        }))}
                                                        className="w-full h-9 rounded-lg border border-dashed border-[hsl(230,10%,20%)] text-slate-500 hover:text-slate-300 hover:border-[hsl(230,10%,28%)] text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                                                    >
                                                        <Plus className="w-3 h-3" /> Add Destination
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* UTM Builder */}
                                    <div className="pt-1">
                                        <UTMBuilder url={formData.longUrl} onChange={handleUTMChange} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Error */}
                        <AnimatePresence>
                            {errors.submit && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                    <p className="text-sm text-red-300">{errors.submit}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ─── Footer ─── */}
                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 h-11 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-[hsl(230,10%,15%)] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] h-11 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_4px_20px_-4px_hsl(220,90%,56%,0.4)] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <BeatLoader size={8} color="#ffffff" />
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Create Link
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

CreateLinkEnhanced.propTypes = {
    onSuccess: PropTypes.func,
    folders: PropTypes.array,
    tags: PropTypes.array,
    pixels: PropTypes.array
};

export default CreateLinkEnhanced;
