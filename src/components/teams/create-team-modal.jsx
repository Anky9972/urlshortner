import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus } from "lucide-react";
import { UrlState } from "@/context";

const CreateTeamModal = ({ onTeamCreated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = UrlState();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teams`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}` // Assuming token is stored in user object or similar
                },
                body: JSON.stringify({ name, slug })
            });

            if (!response.ok) throw new Error('Failed to create team');

            const data = await response.json();
            onTeamCreated(data);
            setIsOpen(false);
            setName('');
            setSlug('');
        } catch (error) {
            console.error(error);
            // Show error toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Create Team
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input
                            id="name"
                            placeholder="Acme Corp"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                // Auto-generate slug
                                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                            }}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Team Slug (URL)</Label>
                        <Input
                            id="slug"
                            placeholder="acme-corp"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                            required
                        />
                        <p className="text-xs text-zinc-400">
                            Your team will be accessible at trimlink.com/teams/{slug}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="border-zinc-700 hover:bg-zinc-800 text-white">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isLoading ? 'Creating...' : 'Create Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTeamModal;
