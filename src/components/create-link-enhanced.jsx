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
    Code2
} from 'lucide-react';
import { QRCode } from 'react-qrcode-logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import Modal from './modal';
import UTMBuilder from './utm-builder';
import { BeatLoader } from 'react-spinners';
import { UrlState } from '../context';
import PropTypes from 'prop-types';

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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
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
        try {
            new URL(formData.longUrl);
        } catch {
            newErrors.longUrl = 'Invalid URL format';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            // Generate QR code blob
            const canvas = qrRef.current?.querySelector('canvas');
            const blob = await new Promise(resolve => canvas?.toBlob(resolve));

            // Import create function dynamically to support both old and new API
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

            // Add selected tags to the created URL
            if (formData.selectedTags.length > 0 && createdUrls?.[0]?.id) {
                const { addTagToUrl } = await import('../api/folders');
                for (const tagId of formData.selectedTags) {
                    await addTagToUrl(createdUrls[0].id, tagId);
                }
            }

            // Reset form
            setFormData({
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
                selectedPixels: []
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

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium transition-colors"
            >
                <Plus className="w-4 h-4 mr-2" />
                Create Link
            </Button>

            <Modal isOpen={isOpen}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    Create New Link
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-blue-400" />
                                            Title
                                        </label>
                                        <Input
                                            name="title"
                                            placeholder="My awesome link"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className={`bg-gray-800/50 border-gray-700 focus:border-blue-500 ${errors.title ? 'border-red-500' : ''
                                                }`}
                                        />
                                        {errors.title && (
                                            <p className="text-xs text-red-400">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <Link2 className="w-4 h-4 text-blue-400" />
                                            Custom Slug (optional)
                                        </label>
                                        <div className="flex items-center">
                                            <span className="text-xs text-gray-500 mr-2">trimlynk.com/</span>
                                            <Input
                                                name="customUrl"
                                                placeholder="my-brand"
                                                value={formData.customUrl}
                                                onChange={handleChange}
                                                className="bg-gray-800/50 border-gray-700 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Link2 className="w-4 h-4 text-purple-400" />
                                        Destination URL
                                    </label>
                                    <Input
                                        name="longUrl"
                                        type="url"
                                        placeholder="https://example.com/very-long-url-here"
                                        value={formData.longUrl}
                                        onChange={handleChange}
                                        className={`bg-gray-800/50 border-gray-700 focus:border-purple-500 ${errors.longUrl ? 'border-red-500' : ''
                                            }`}
                                    />
                                    {errors.longUrl && (
                                        <p className="text-xs text-red-400">{errors.longUrl}</p>
                                    )}
                                </div>

                                {/* QR Preview */}
                                {formData.longUrl && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex justify-center"
                                    >
                                        <div ref={qrRef} className="p-4 bg-white rounded-lg">
                                            <QRCode
                                                value={formData.longUrl}
                                                size={120}
                                                quietZone={10}
                                                ecLevel="H"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Advanced Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                                >
                                    <Zap className="w-4 h-4" />
                                    Advanced Options
                                    {showAdvanced ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                {/* Advanced Options */}
                                <AnimatePresence>
                                    {showAdvanced && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-5 border-t border-gray-700/50 pt-5"
                                        >
                                            {/* Password Protection */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-amber-400" />
                                                    Password Protection (optional)
                                                </label>
                                                <div className="relative">
                                                    <Input
                                                        name="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Enter password to protect link"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className="bg-gray-800/50 border-gray-700 focus:border-amber-500 pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Scheduling */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-emerald-400" />
                                                        Activates At
                                                    </label>
                                                    <Input
                                                        name="activatesAt"
                                                        type="datetime-local"
                                                        value={formData.activatesAt}
                                                        onChange={handleChange}
                                                        className="bg-gray-800/50 border-gray-700 focus:border-emerald-500"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-rose-400" />
                                                        Deactivates At
                                                    </label>
                                                    <Input
                                                        name="deactivatesAt"
                                                        type="datetime-local"
                                                        value={formData.deactivatesAt}
                                                        onChange={handleChange}
                                                        className="bg-gray-800/50 border-gray-700 focus:border-rose-500"
                                                    />
                                                </div>
                                            </div>

                                            {/* Click Limit & Expiration */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <MousePointerClick className="w-4 h-4 text-cyan-400" />
                                                        Click Limit
                                                    </label>
                                                    <Input
                                                        name="clickLimit"
                                                        type="number"
                                                        placeholder="Unlimited"
                                                        value={formData.clickLimit}
                                                        onChange={handleChange}
                                                        className="bg-gray-800/50 border-gray-700 focus:border-cyan-500"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-pink-400" />
                                                        Expiration Date
                                                    </label>
                                                    <Input
                                                        name="expirationDate"
                                                        type="datetime-local"
                                                        value={formData.expirationDate}
                                                        onChange={handleChange}
                                                        className="bg-gray-800/50 border-gray-700 focus:border-pink-500"
                                                    />
                                                </div>
                                            </div>

                                            {/* Folder Selection */}
                                            {folders.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <Folder className="w-4 h-4 text-blue-400" />
                                                        Folder
                                                    </label>
                                                    <select
                                                        name="folderId"
                                                        value={formData.folderId}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-blue-500 focus:outline-none"
                                                    >
                                                        <option value="">No folder</option>
                                                        {folders.map(folder => (
                                                            <option key={folder.id} value={folder.id}>
                                                                {folder.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Tag Selection */}
                                            {tags.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-amber-400" />
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
                                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${isSelected
                                                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                                                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
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

                                            {/* Pixel Selection */}
                                            {pixels.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <Code2 className="w-4 h-4 text-pink-400" />
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
                                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${isSelected
                                                                        ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                                                                        : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
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

                                            {/* URL Cloaking */}
                                            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <Cloak className="w-5 h-5 text-violet-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-200">URL Cloaking</p>
                                                        <p className="text-xs text-gray-500">Hide destination URL from browser address bar</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={formData.isCloaked}
                                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCloaked: checked }))}
                                                />
                                            </div>

                                            {/* Rotator Link Configuration */}
                                            <div className="space-y-4 pt-4 border-t border-gray-800">
                                                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700">
                                                    <div className="flex items-center gap-3">
                                                        <Target className="w-5 h-5 text-orange-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-200">Rotator Link</p>
                                                            <p className="text-xs text-gray-500">Rotate between multiple destinations (Split Testing / Round Robin)</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.isRotator}
                                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRotator: checked }))}
                                                    />
                                                </div>

                                                {formData.isRotator && (
                                                    <div className="space-y-3 pl-4 border-l-2 border-orange-500/20">
                                                        <p className="text-sm text-gray-400">Destinations (First URL is default)</p>
                                                        {formData.rotatorDestinations?.map((dest, index) => (
                                                            <div key={index} className="flex gap-2">
                                                                <Input
                                                                    placeholder="https://example.com/variant"
                                                                    value={dest.url}
                                                                    onChange={(e) => {
                                                                        const newDests = [...formData.rotatorDestinations];
                                                                        newDests[index].url = e.target.value;
                                                                        setFormData(prev => ({ ...prev, rotatorDestinations: newDests }));
                                                                    }}
                                                                    className="bg-gray-800 border-gray-700"
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Weight"
                                                                    value={dest.weight}
                                                                    onChange={(e) => {
                                                                        const newDests = [...formData.rotatorDestinations];
                                                                        newDests[index].weight = parseInt(e.target.value) || 0;
                                                                        setFormData(prev => ({ ...prev, rotatorDestinations: newDests }));
                                                                    }}
                                                                    className="w-24 bg-gray-800 border-gray-700"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        const newDests = formData.rotatorDestinations.filter((_, i) => i !== index);
                                                                        setFormData(prev => ({ ...prev, rotatorDestinations: newDests }));
                                                                    }}
                                                                >
                                                                    <X className="h-4 w-4 text-red-400" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full border-dashed border-gray-700 text-gray-400 hover:text-white"
                                                            onClick={() => setFormData(prev => ({
                                                                ...prev,
                                                                rotatorDestinations: [...(prev.rotatorDestinations || []), { url: '', weight: 1 }]
                                                            }))}
                                                        >
                                                            <Plus className="mr-2 h-3 w-3" /> Add Destination
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* UTM Builder */}
                                            <div className="pt-2">
                                                <UTMBuilder
                                                    url={formData.longUrl}
                                                    onChange={handleUTMChange}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                        {errors.submit}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-medium transition-colors"
                                >
                                    {isLoading ? (
                                        <BeatLoader size={10} color="#09090b" />
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5 mr-2" />
                                            Create Link
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
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
