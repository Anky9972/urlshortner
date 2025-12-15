import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, Check, HelpCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './ui/tooltip';

const UTM_PARAMS = [
    {
        key: 'source',
        label: 'Source',
        placeholder: 'google, facebook, newsletter',
        description: 'Where the traffic is coming from (e.g., google, facebook, twitter)',
        suggestions: ['google', 'facebook', 'twitter', 'linkedin', 'instagram', 'email', 'newsletter']
    },
    {
        key: 'medium',
        label: 'Medium',
        placeholder: 'cpc, email, social',
        description: 'The marketing medium (e.g., cpc, email, social, banner)',
        suggestions: ['cpc', 'cpm', 'email', 'social', 'banner', 'affiliate', 'organic']
    },
    {
        key: 'campaign',
        label: 'Campaign',
        placeholder: 'summer_sale, product_launch',
        description: 'The specific campaign name (e.g., summer_sale, black_friday)',
        suggestions: ['summer_sale', 'winter_promo', 'product_launch', 'brand_awareness']
    },
    {
        key: 'term',
        label: 'Term (Optional)',
        placeholder: 'running+shoes',
        description: 'Paid search keywords',
        suggestions: []
    },
    {
        key: 'content',
        label: 'Content (Optional)',
        placeholder: 'logolink, textlink',
        description: 'Differentiate ads/links pointing to the same URL',
        suggestions: ['header_link', 'footer_link', 'sidebar_banner', 'cta_button']
    }
];

const UTMBuilder = ({ url, onChange }) => {
    const [utmParams, setUtmParams] = useState({
        source: '',
        medium: '',
        campaign: '',
        term: '',
        content: ''
    });
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        buildUrl();
    }, [utmParams, url]);

    const buildUrl = () => {
        if (!url) {
            setGeneratedUrl('');
            return;
        }

        try {
            const baseUrl = new URL(url);

            Object.entries(utmParams).forEach(([key, value]) => {
                if (value.trim()) {
                    baseUrl.searchParams.set(`utm_${key}`, value.trim());
                }
            });

            const finalUrl = baseUrl.toString();
            setGeneratedUrl(finalUrl);

            if (onChange) {
                onChange({
                    utmSource: utmParams.source,
                    utmMedium: utmParams.medium,
                    utmCampaign: utmParams.campaign,
                    utmTerm: utmParams.term,
                    utmContent: utmParams.content,
                    finalUrl
                });
            }
        } catch (error) {
            setGeneratedUrl(url);
        }
    };

    const handleChange = (key, value) => {
        setUtmParams(prev => ({ ...prev, [key]: value }));
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(generatedUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSuggestionClick = (key, suggestion) => {
        handleChange(key, suggestion);
    };

    return (
        <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    UTM Campaign Builder
                </CardTitle>
                <p className="text-sm text-zinc-500">
                    Add tracking parameters to measure campaign performance
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                <TooltipProvider>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {UTM_PARAMS.map((param, index) => (
                            <motion.div
                                key={param.key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-300">
                                        {param.label}
                                    </label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                            <p>{param.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>

                                <Input
                                    placeholder={param.placeholder}
                                    value={utmParams[param.key]}
                                    onChange={(e) => handleChange(param.key, e.target.value)}
                                    className="bg-gray-900/50 border-gray-700 focus:border-amber-500/50 transition-colors"
                                />

                                {param.suggestions.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {param.suggestions.slice(0, 4).map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                type="button"
                                                onClick={() => handleSuggestionClick(param.key, suggestion)}
                                                className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </TooltipProvider>

                {/* Generated URL Preview */}
                {generatedUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-amber-300 flex items-center gap-2">
                                <Link2 className="w-4 h-4" />
                                Generated URL
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCopy}
                                className="text-amber-300 hover:text-amber-200 hover:bg-amber-500/20"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-sm text-gray-300 break-all font-mono bg-gray-900/50 p-2 rounded">
                            {generatedUrl}
                        </p>
                    </motion.div>
                )}

                {/* UTM Parameters Preview */}
                {Object.values(utmParams).some(v => v) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {Object.entries(utmParams)
                            .filter(([_, value]) => value)
                            .map(([key, value]) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-300"
                                >
                                    <span className="text-amber-400">utm_{key}:</span>
                                    {value}
                                </span>
                            ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UTMBuilder;
