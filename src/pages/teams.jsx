import { useEffect, useState } from 'react';
import { UrlState } from '@/context';
import { getToken } from '@/api/token';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, ArrowRight, Link2, FolderOpen, Search, TreePine, Crown, Loader2, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import CreateTeamModal from '@/components/teams/create-team-modal';
import { useNavigate } from 'react-router-dom';
import { SEOMetadata } from '@/components/seo-metadata';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TeamsPage = () => {
    const { user } = UrlState();
    const [teams, setTeams] = useState({ owned: [], member: [] });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const navigate = useNavigate();

    const fetchTeams = async () => {
        try {
            const response = await fetch(`${API_URL}/api/teams`, {
                credentials: 'include',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTeams(data);
            }
        } catch (error) {
            console.error('Failed to fetch teams', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchTeams();
    }, [user]);

    const handleTeamCreated = (newTeam) => {
        setTeams(prev => ({ ...prev, owned: [...prev.owned, newTeam] }));
    };

    const allTeams = [
        ...teams.owned.map(t => ({ ...t, _isOwner: true })),
        ...teams.member.filter(t => !teams.owned.some(o => o.id === t.id)).map(t => ({ ...t, _isOwner: false }))
    ];

    const filteredOwned = teams.owned.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredMember = teams.member
        .filter(t => !teams.owned.some(o => o.id === t.id))
        .filter(t =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const totalLinks = allTeams.reduce((acc, t) => acc + (t._count?.urls || 0), 0);
    const totalMembers = allTeams.reduce((acc, t) => acc + (t._count?.members || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
        );
    }

    return (
        <>
        <SEOMetadata
            title="Teams | TrimLink"
            description="Create and manage teams on TrimLink. Collaborate with your team on shortened links, analytics, and link management."
            canonical="https://trimlynk.com/teams"
            noIndex={true}
        />
        <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">My Teams</h1>
                            <p className="text-slate-500 text-sm">Manage your organizations and collaborate</p>
                        </div>
                    </div>
                    <CreateTeamModal onTeamCreated={handleTeamCreated} />
                </motion.div>

                {/* Stats Overview */}
                {allTeams.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                    >
                        <StatCard icon={<Users className="w-4 h-4" />} label="Total Teams" value={allTeams.length} color="violet" />
                        <StatCard icon={<Crown className="w-4 h-4" />} label="Owned" value={teams.owned.length} color="amber" />
                        <StatCard icon={<Link2 className="w-4 h-4" />} label="Team Links" value={totalLinks} color="blue" />
                        <StatCard icon={<Users className="w-4 h-4" />} label="Total Members" value={totalMembers} color="emerald" />
                    </motion.div>
                )}

                {/* Search & Filter Bar */}
                {allTeams.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="flex items-center gap-3"
                    >
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-[hsl(230,10%,10%)] border-[hsl(230,10%,18%)] text-white placeholder:text-slate-600"
                            />
                        </div>
                        <div className="flex gap-1 bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] rounded-lg p-1">
                            <Button
                                variant="ghost" size="sm"
                                className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-[hsl(230,10%,18%)] text-white' : 'text-slate-500 hover:text-white'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost" size="sm"
                                className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-[hsl(230,10%,18%)] text-white' : 'text-slate-500 hover:text-white'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Owned Teams */}
                {filteredOwned.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-400" /> Teams You Own
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">{filteredOwned.length}</Badge>
                        </h2>
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            : "flex flex-col gap-3"
                        }>
                            <AnimatePresence>
                                {filteredOwned.map((team, i) => (
                                    <motion.div
                                        key={team.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <TeamCard team={team} isOwner={true} viewMode={viewMode} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* Member Teams */}
                {filteredMember.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" /> Teams You Joined
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">{filteredMember.length}</Badge>
                        </h2>
                        <div className={viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            : "flex flex-col gap-3"
                        }>
                            <AnimatePresence>
                                {filteredMember.map((team, i) => (
                                    <motion.div
                                        key={team.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <TeamCard team={team} isOwner={false} viewMode={viewMode} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {allTeams.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] border-dashed"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[hsl(230,10%,14%)] flex items-center justify-center">
                            <Users className="h-8 w-8 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No teams yet</h3>
                        <p className="text-slate-500 mb-6 text-sm max-w-xs mx-auto">Create a team to start collaborating with others on link management.</p>
                        <CreateTeamModal onTeamCreated={handleTeamCreated} />
                    </motion.div>
                )}

                {/* Search empty state */}
                {allTeams.length > 0 && filteredOwned.length === 0 && filteredMember.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                        <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500">No teams match "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        violet: 'text-violet-400 bg-violet-500/10 border-violet-500/15',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/15',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/15',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
    };
    return (
        <div className={`rounded-xl border p-3 ${colors[color]}`}>
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    );
};

const TeamCard = ({ team, isOwner, viewMode }) => {
    const navigate = useNavigate();
    const roleColors = {
        owner: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        admin: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        member: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        viewer: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    const role = isOwner ? 'owner' : (team.role || 'member');
    const initials = team.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    if (viewMode === 'list') {
        return (
            <Card
                className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white hover:border-[hsl(230,10%,22%)] transition-all rounded-xl cursor-pointer"
                onClick={() => navigate(`/teams/${team.id}`)}
            >
                <div className="flex items-center gap-4 p-4">
                    <Avatar className="h-10 w-10">
                        {team.avatarUrl && <AvatarImage src={team.avatarUrl} />}
                        <AvatarFallback className="bg-violet-500/20 text-violet-300 text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">{team.name}</span>
                            <Badge className={`text-[10px] ${roleColors[role]}`}>{role}</Badge>
                        </div>
                        <span className="text-xs text-slate-500">@{team.slug}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {team._count?.members || 1}</span>
                        <span className="flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> {team._count?.urls || 0}</span>
                        <span className="flex items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5" /> {team._count?.folders || 0}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white hover:border-[hsl(230,10%,22%)] transition-all rounded-2xl overflow-hidden group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            {team.avatarUrl && <AvatarImage src={team.avatarUrl} />}
                            <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base font-bold">{team.name}</CardTitle>
                            <CardDescription className="text-slate-500 text-xs">@{team.slug}</CardDescription>
                        </div>
                    </div>
                    <Badge className={`text-[10px] ${roleColors[role]}`}>{role}</Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-[hsl(230,10%,12%)] p-2">
                        <p className="text-sm font-semibold text-white">{team._count?.members || 1}</p>
                        <p className="text-[10px] text-slate-500">Members</p>
                    </div>
                    <div className="rounded-lg bg-[hsl(230,10%,12%)] p-2">
                        <p className="text-sm font-semibold text-white">{team._count?.urls || 0}</p>
                        <p className="text-[10px] text-slate-500">Links</p>
                    </div>
                    <div className="rounded-lg bg-[hsl(230,10%,12%)] p-2">
                        <p className="text-sm font-semibold text-white">{team._count?.folders || 0}</p>
                        <p className="text-[10px] text-slate-500">Folders</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button
                    variant="ghost"
                    className="w-full justify-between hover:bg-[hsl(230,10%,14%)] text-white group"
                    onClick={() => navigate(`/teams/${team.id}`)}
                >
                    View Team
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default TeamsPage;
