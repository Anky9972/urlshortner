import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';

const ThemeToggle = () => {
    const [theme, setTheme] = useState('system');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'system';
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (newTheme) => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (newTheme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(newTheme);
        }
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    const themes = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor }
    ];

    const currentIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-9 h-9 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50"
                >
                    <motion.div
                        key={theme}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                        {theme === 'light' && <Sun className="h-4 w-4 text-amber-400" />}
                        {theme === 'dark' && <Moon className="h-4 w-4 text-blue-400" />}
                        {theme === 'system' && <Monitor className="h-4 w-4 text-gray-400" />}
                    </motion.div>
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-gray-800/95 backdrop-blur-xl border-gray-700 min-w-[140px]"
            >
                {themes.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuItem
                        key={value}
                        onClick={() => handleThemeChange(value)}
                        className={`flex items-center gap-2 cursor-pointer ${theme === value
                                ? 'text-blue-400 bg-blue-500/10'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                        {theme === value && (
                            <motion.div
                                layoutId="theme-indicator"
                                className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                            />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ThemeToggle;
