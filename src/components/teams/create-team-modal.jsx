import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Loader2, Check, AlertCircle } from "lucide-react";
import { getToken } from "@/api/token";
import { useToast } from "@/components/ui/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CreateTeamModal = ({ onTeamCreated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { toast } = useToast();

    const handleNameChange = (value) => {
        setName(value);
        setSlug(value.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/teams`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ name, slug })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create team');

            onTeamCreated(data);
            toast({ title: "Team created", description: `"${name}" is ready to go!` });
            setIsOpen(false);
            setName('');
            setSlug('');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const slugValid = /^[a-z0-9-]+$/.test(slug) && slug.length > 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setError(''); }}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Create Team
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-400" /> Create New Team
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Teams let you collaborate with others on link management, analytics, and more.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            placeholder="Acme Corp"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Team Slug (URL)</Label>
                        <div className="relative">
                            <Input
                                id="slug"
                                placeholder="acme-corp"
                                value={slug}
                                onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setError(''); }}
                                className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white pr-8"
                                required
                            />
                            {slug && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {slugValid ? <Check className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            Only lowercase letters, numbers, and hyphens
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-[hsl(230,10%,20%)] hover:bg-[hsl(230,10%,14%)] text-white">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !slugValid} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            {isLoading ? 'Creating...' : 'Create Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTeamModal;
