import { useEffect, useState } from 'react';
import { UrlState } from '@/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, ArrowRight } from "lucide-react";
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
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Teams</h1>
                    <p className="text-zinc-400">Manage your organizations and collaborate.</p>
                </div>
                <CreateTeamModal onTeamCreated={handleTeamCreated} />
            </div>

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
                <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                    <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No teams yet</h3>
                    <p className="text-zinc-500 mb-6">Create a team to start collaborating with others.</p>
                    <CreateTeamModal onTeamCreated={handleTeamCreated} />
                </div>
            )}
        </div>
    );
};

const TeamCard = ({ team, isOwner }) => {
    const navigate = useNavigate();

    return (
        <Card className="bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700 transition-colors">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{team.name}</CardTitle>
                    {isOwner && <span className="bg-blue-600/10 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-600/20">Owner</span>}
                </div>
                <CardDescription className="text-zinc-500">@{team.slug}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 text-sm text-zinc-400">
                    <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {team._count?.members || 1} Members
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button
                    variant="ghost"
                    className="w-full justify-between hover:bg-zinc-800 text-white group"
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
