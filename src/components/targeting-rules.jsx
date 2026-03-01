import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Globe, Smartphone, Monitor, Laptop, Chrome, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const RULE_TYPES = [
    { value: 'geo', label: 'Country/Region', icon: Globe },
    { value: 'device', label: 'Device Type', icon: Smartphone },
    { value: 'browser', label: 'Browser', icon: Chrome },
    { value: 'os', label: 'Operating System', icon: Laptop }
];

const COUNTRIES = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' }
];

const DEVICES = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'tablet', label: 'Tablet' }
];

const BROWSERS = [
    { value: 'chrome', label: 'Chrome' },
    { value: 'firefox', label: 'Firefox' },
    { value: 'safari', label: 'Safari' },
    { value: 'edge', label: 'Edge' },
    { value: 'opera', label: 'Opera' }
];

const OPERATING_SYSTEMS = [
    { value: 'windows', label: 'Windows' },
    { value: 'macos', label: 'macOS' },
    { value: 'linux', label: 'Linux' },
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' }
];

const TargetingRules = ({ rules = [], onAdd, onRemove, onUpdate }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRule, setNewRule] = useState({
        type: 'geo',
        condition: '',
        targetUrl: '',
        priority: 0
    });

    const getConditionOptions = (type) => {
        switch (type) {
            case 'geo': return COUNTRIES.map(c => ({ value: `country:${c.code}`, label: c.name }));
            case 'device': return DEVICES.map(d => ({ value: `device:${d.value}`, label: d.label }));
            case 'browser': return BROWSERS.map(b => ({ value: `browser:${b.value}`, label: b.label }));
            case 'os': return OPERATING_SYSTEMS.map(o => ({ value: `os:${o.value}`, label: o.label }));
            default: return [];
        }
    };

    const handleAddRule = () => {
        if (newRule.condition && newRule.targetUrl) {
            onAdd(newRule);
            setNewRule({ type: 'geo', condition: '', targetUrl: '', priority: rules.length });
            setShowAddForm(false);
        }
    };

    const getIcon = (type) => {
        const ruleType = RULE_TYPES.find(r => r.value === type);
        return ruleType ? ruleType.icon : Globe;
    };

    return (
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                    <span className="text-white">Smart Targeting Rules</span>
                    <Button
                        size="sm"
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Rule
                    </Button>
                </CardTitle>
                <p className="text-sm text-slate-500">
                    Redirect visitors based on their location, device, or browser
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 rounded-lg bg-[hsl(230,12%,9%)]/50 border border-[hsl(230,10%,20%)] space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Rule Type</label>
                                    <Select
                                        value={newRule.type}
                                        onValueChange={(value) => setNewRule({ ...newRule, type: value, condition: '' })}
                                    >
                                        <SelectTrigger className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)]">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RULE_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <span className="flex items-center gap-2">
                                                        <type.icon className="w-4 h-4" />
                                                        {type.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Condition</label>
                                    <Select
                                        value={newRule.condition}
                                        onValueChange={(value) => setNewRule({ ...newRule, condition: value })}
                                    >
                                        <SelectTrigger className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)]">
                                            <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getConditionOptions(newRule.type).map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Redirect URL</label>
                                <Input
                                    type="url"
                                    placeholder="https://example.com/specific-page"
                                    value={newRule.targetUrl}
                                    onChange={(e) => setNewRule({ ...newRule, targetUrl: e.target.value })}
                                    className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] focus:border-blue-600"
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddRule} className="bg-blue-600 hover:bg-blue-500">
                                    Add Rule
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Existing Rules */}
                <div className="space-y-2">
                    {rules.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No targeting rules configured</p>
                            <p className="text-sm">Add rules to redirect visitors based on their attributes</p>
                        </div>
                    ) : (
                        rules.map((rule, index) => {
                            const Icon = getIcon(rule.type);
                            return (
                                <motion.div
                                    key={rule.id || index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(230,12%,9%)]/30 border border-[hsl(230,10%,20%)]/50 group hover:border-[hsl(230,10%,25%)] transition-colors"
                                >
                                    <GripVertical className="w-4 h-4 text-slate-600 cursor-grab" />

                                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <Icon className="w-4 h-4 text-emerald-400" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-200">
                                                {rule.condition.split(':')[1]?.toUpperCase() || rule.condition}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(230,10%,20%)] text-slate-400">
                                                {rule.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{rule.targetUrl}</p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemove(rule.id || index)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TargetingRules;
