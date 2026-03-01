import { useEffect, useState } from 'react';
import { UrlState } from '@/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';
import CreateTeamModal from '@/components/teams/create-team-modal';
import { useNavigate } from 'react-router-dom';

const TeamsPage = () => {
    const { user } = UrlState();
    const [teams, setTeams] = useState({ owned: [], member: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTeams = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/teams`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
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
        if (user) {
            fetchTeams();
        }
    }, [user]);

    const handleTeamCreated = (newTeam) => {
        setTeams(prev => ({
            ...prev,
            owned: [...prev.owned, newTeam]
        }));
    };

    if (loading) {
        return <div className="p-8 text-white">Loading teams...</div>;
    }

    return (
        <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center"
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

            {/* Owned Teams */}
            {teams.owned.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Teams You Own</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.owned.map(team => (
                            <TeamCard key={team.id} team={team} isOwner={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* Member Teams */}
            {teams.member.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Teams You Joined</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.member.map(team => (
                            <TeamCard key={team.id} team={team} isOwner={false} />
                        ))}
                    </div>
                </div>
            )}

            {teams.owned.length === 0 && teams.member.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 rounded-2xl border border-[hsl(230,10%,15%)] bg-[hsl(230,12%,9%)] border-dashed"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[hsl(230,10%,14%)] flex items-center justify-center">
                        <Users className="h-8 w-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No teams yet</h3>
                    <p className="text-slate-500 mb-6 text-sm max-w-xs mx-auto">Create a team to start collaborating with others.</p>
                    <CreateTeamModal onTeamCreated={handleTeamCreated} />
                </motion.div>
            )}
            </div>
        </div>
    );
};

const TeamCard = ({ team, isOwner }) => {
    const navigate = useNavigate();

    return (
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white hover:border-[hsl(230,10%,22%)] transition-all rounded-2xl overflow-hidden group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
                    {isOwner && <span className="bg-blue-600/10 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-600/20">Owner</span>}
                </div>
                <CardDescription className="text-slate-500">@{team.slug}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 text-sm text-slate-400">
                    <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {team._count?.members || 1} Members
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
