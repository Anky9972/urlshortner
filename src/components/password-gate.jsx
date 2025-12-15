import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PasswordGate = ({ linkTitle, onSubmit, error }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password.trim()) return;

        setIsLoading(true);
        try {
            await onSubmit(password);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="text-center space-y-4 pb-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
                        >
                            <Shield className="w-8 h-8 text-amber-400" />
                        </motion.div>

                        <div>
                            <CardTitle className="text-2xl font-bold text-white">
                                Protected Link
                            </CardTitle>
                            <p className="text-zinc-400 mt-2">
                                This link is password protected
                            </p>
                        </div>

                        {linkTitle && (
                            <div className="px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700">
                                <p className="text-xs text-zinc-500">Accessing:</p>
                                <p className="text-zinc-200 font-medium truncate">{linkTitle}</p>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 h-12 bg-zinc-800/50 border-zinc-700 focus:border-amber-500/50 text-white placeholder:text-zinc-500"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
                                >
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                disabled={!password.trim() || isLoading}
                                className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-medium"
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full"
                                    />
                                ) : (
                                    'Unlock Link'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-zinc-500">
                                Don't have the password?{' '}
                                <button className="text-amber-400 hover:text-amber-300 transition-colors">
                                    Contact the link owner
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-4 text-sm text-zinc-500"
                >
                    Powered by{' '}
                    <a href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        TrimLink
                    </a>
                </motion.p>
            </motion.div>
        </div>
    );
};

export default PasswordGate;
