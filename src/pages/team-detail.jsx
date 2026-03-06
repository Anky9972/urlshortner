import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UrlState } from '@/context';
import { getToken } from '@/api/token';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    Users, Link2, FolderOpen, Settings, ArrowLeft, Crown, Shield, Eye, UserPlus,
    MoreVertical, Trash2, UserMinus, Loader2, ExternalLink, Copy, Check,
    RefreshCw, TreePine, LogOut, AlertTriangle, Pencil
} from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';
import { useToast } from "@/components/ui/use-toast";
import { SEOMetadata } from '@/components/seo-metadata';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

const TeamDetailPage = () => {
    const { teamId } = useParams();
    const { user } = UrlState();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [team, setTeam] = useState(null);
    const [teamUrls, setTeamUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const fetchTeam = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/teams/${teamId}`, {
                credentials: 'include',
                headers: authHeaders()
            });
            if (!res.ok) {
                if (res.status === 403) {
                    toast({ title: "Access denied", description: "You are not a member of this team", variant: "destructive" });
                    navigate('/teams');
                    return;
                }
                throw new Error('Failed to fetch team');
            }
            setTeam(await res.json());
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load team", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [teamId, navigate, toast]);

    const fetchTeamUrls = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/teams/${teamId}/urls`, {
                credentials: 'include',
                headers: authHeaders()
            });
            if (res.ok) setTeamUrls(await res.json());
        } catch (error) {
            console.error(error);
        }
    }, [teamId]);

    useEffect(() => {
        if (user) {
            fetchTeam();
            fetchTeamUrls();
        }
    }, [user, fetchTeam, fetchTeamUrls]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-[hsl(230,15%,5%)] flex flex-col items-center justify-center gap-4">
                <p className="text-slate-400">Team not found</p>
                <Button variant="ghost" onClick={() => navigate('/teams')} className="text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
                </Button>
            </div>
        );
    }

    const isOwner = team.currentUserRole === 'owner';
    const isAdmin = ['owner', 'admin'].includes(team.currentUserRole);
    const initials = team.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <>
        <SEOMetadata
            title={`${team.name} | Teams | TrimLink`}
            description={`Manage ${team.name} team on TrimLink`}
            noIndex={true}
        />
        <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Back + Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button variant="ghost" onClick={() => navigate('/teams')} className="text-slate-400 hover:text-white mb-4 -ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Teams
                    </Button>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Avatar className="h-14 w-14">
                            {team.avatarUrl && <AvatarImage src={team.avatarUrl} />}
                            <AvatarFallback className="bg-violet-500/20 text-violet-300 text-lg">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                                <RoleBadge role={team.currentUserRole} />
                            </div>
                            <p className="text-slate-500 text-sm">@{team.slug}</p>
                        </div>
                        {!isOwner && (
                            <LeaveTeamButton teamId={teamId} onLeft={() => navigate('/teams')} toast={toast} />
                        )}
                    </div>
                </motion.div>

                {/* Stats Row */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MiniStat icon={<Users className="w-4 h-4" />} label="Members" value={team._count?.members || 0} color="violet" />
                    <MiniStat icon={<Link2 className="w-4 h-4" />} label="Links" value={team._count?.urls || 0} color="blue" />
                    <MiniStat icon={<FolderOpen className="w-4 h-4" />} label="Folders" value={team._count?.folders || 0} color="emerald" />
                    <MiniStat icon={<TreePine className="w-4 h-4" />} label="LinkTrees" value={team._count?.linkTrees || 0} color="amber" />
                </motion.div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-[hsl(230,10%,10%)] border border-[hsl(230,10%,18%)] w-full sm:w-auto">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-[hsl(230,10%,18%)] data-[state=active]:text-white text-slate-400">Overview</TabsTrigger>
                        <TabsTrigger value="members" className="data-[state=active]:bg-[hsl(230,10%,18%)] data-[state=active]:text-white text-slate-400">Members</TabsTrigger>
                        <TabsTrigger value="links" className="data-[state=active]:bg-[hsl(230,10%,18%)] data-[state=active]:text-white text-slate-400">Links</TabsTrigger>
                        {isAdmin && <TabsTrigger value="settings" className="data-[state=active]:bg-[hsl(230,10%,18%)] data-[state=active]:text-white text-slate-400">Settings</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="overview">
                        <OverviewTab team={team} teamUrls={teamUrls} />
                    </TabsContent>
                    <TabsContent value="members">
                        <MembersTab team={team} isAdmin={isAdmin} isOwner={isOwner} onRefresh={fetchTeam} toast={toast} />
                    </TabsContent>
                    <TabsContent value="links">
                        <LinksTab teamUrls={teamUrls} onRefresh={fetchTeamUrls} />
                    </TabsContent>
                    {isAdmin && (
                        <TabsContent value="settings">
                            <SettingsTab team={team} isOwner={isOwner} onRefresh={fetchTeam} onDeleted={() => navigate('/teams')} toast={toast} />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
        </>
    );
};

// --- Role Badge ---
const RoleBadge = ({ role }) => {
    const config = {
        owner: { icon: Crown, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        admin: { icon: Shield, className: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
        member: { icon: Users, className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        viewer: { icon: Eye, className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    };
    const { icon: Icon, className } = config[role] || config.member;
    return (
        <Badge className={`text-xs ${className} gap-1`}>
            <Icon className="w-3 h-3" /> {role}
        </Badge>
    );
};

// --- Mini Stat ---
const MiniStat = ({ icon, label, value, color }) => {
    const colors = {
        violet: 'text-violet-400 bg-violet-500/10 border-violet-500/15',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/15',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/15',
    };
    return (
        <div className={`rounded-xl border p-3 ${colors[color]}`}>
            <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-slate-500">{label}</span></div>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    );
};

// --- Leave Team ---
const LeaveTeamButton = ({ teamId, onLeft, toast }) => {
    const [leaving, setLeaving] = useState(false);
    const [open, setOpen] = useState(false);

    const handleLeave = async () => {
        setLeaving(true);
        try {
            const res = await fetch(`${API_URL}/api/teams/${teamId}/leave`, {
                method: 'POST', credentials: 'include', headers: authHeaders()
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to leave');
            }
            toast({ title: "Left team", description: "You have left this team" });
            onLeft();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLeaving(false);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <LogOut className="w-4 h-4 mr-2" /> Leave Team
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Leave Team?</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        You will lose access to this team's links, folders, and analytics. You'll need to be re-invited to rejoin.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-[hsl(230,10%,20%)] text-white hover:bg-[hsl(230,10%,14%)]">Cancel</Button>
                    <Button onClick={handleLeave} disabled={leaving} className="bg-red-600 hover:bg-red-700 text-white">
                        {leaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
                        Leave Team
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ==================== OVERVIEW TAB ====================
const OverviewTab = ({ team, teamUrls }) => {
    const recentUrls = teamUrls.slice(0, 5);
    const recentMembers = team.members?.slice(0, 6) || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Members */}
            <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-violet-400" /> Team Members</CardTitle>
                    <CardDescription className="text-slate-500">{team._count?.members || 0} members</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {recentMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[hsl(230,10%,12%)]">
                            <Avatar className="h-8 w-8">
                                {m.user?.avatarUrl && <AvatarImage src={m.user.avatarUrl} />}
                                <AvatarFallback className="text-xs bg-[hsl(230,10%,18%)]">
                                    {(m.user?.name || m.user?.email || '?').charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{m.user?.name || m.user?.email}</p>
                                <p className="text-xs text-slate-500 truncate">{m.user?.email}</p>
                            </div>
                            <RoleBadge role={m.role} />
                        </div>
                    ))}
                    {recentMembers.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No members yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Recent Links */}
            <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Link2 className="w-4 h-4 text-blue-400" /> Recent Links</CardTitle>
                    <CardDescription className="text-slate-500">{team._count?.urls || 0} total links</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {recentUrls.map(url => (
                        <div key={url.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[hsl(230,10%,12%)]">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Link2 className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{url.title || url.short_url}</p>
                                <p className="text-xs text-slate-500 truncate">{url.original_url}</p>
                            </div>
                            <span className="text-xs text-slate-400">{url._count?.clicks || 0} clicks</span>
                        </div>
                    ))}
                    {recentUrls.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No links yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Team Info */}
            <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white lg:col-span-2">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Team Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500">Owner</span>
                            <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                    {team.owner?.avatarUrl && <AvatarImage src={team.owner.avatarUrl} />}
                                    <AvatarFallback className="text-[10px] bg-[hsl(230,10%,18%)]">
                                        {(team.owner?.name || '?').charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-white">{team.owner?.name || team.owner?.email}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-slate-500">Created</span>
                            <p className="text-white mt-1">{new Date(team.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div>
                            <span className="text-slate-500">Slug</span>
                            <p className="text-white mt-1">@{team.slug}</p>
                        </div>
                        <div>
                            <span className="text-slate-500">Your Role</span>
                            <div className="mt-1"><RoleBadge role={team.currentUserRole} /></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ==================== MEMBERS TAB ====================
const MembersTab = ({ team, isAdmin, isOwner, onRefresh, toast }) => {
    return (
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Members ({team.members?.length || 0})</CardTitle>
                        <CardDescription className="text-slate-500">Manage who has access to this team</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onRefresh} className="text-slate-400 hover:text-white">
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                        {isAdmin && <AddMemberDialog teamId={team.id} onAdded={onRefresh} toast={toast} />}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {(team.members || []).map(member => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            teamId={team.id}
                            isAdmin={isAdmin}
                            isOwner={isOwner}
                            currentUserId={team.ownerId}
                            onRefresh={onRefresh}
                            toast={toast}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const MemberRow = ({ member, teamId, isAdmin, isOwner, onRefresh, toast }) => {
    const [updating, setUpdating] = useState(false);
    const canManage = isAdmin && member.role !== 'owner';
    const canChangeRole = isOwner && member.role !== 'owner';

    const updateRole = async (newRole) => {
        setUpdating(true);
        try {
            const res = await fetch(`${API_URL}/api/teams/${teamId}/members/${member.id}`, {
                method: 'PATCH', credentials: 'include', headers: authHeaders(),
                body: JSON.stringify({ role: newRole })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update role');
            }
            toast({ title: "Role updated", description: `${member.user?.name || member.user?.email} is now ${newRole}` });
            onRefresh();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUpdating(false);
        }
    };

    const removeMember = async () => {
        setUpdating(true);
        try {
            const res = await fetch(`${API_URL}/api/teams/${teamId}/members/${member.id}`, {
                method: 'DELETE', credentials: 'include', headers: authHeaders()
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to remove member');
            }
            toast({ title: "Member removed", description: `${member.user?.name || member.user?.email} has been removed` });
            onRefresh();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(230,10%,12%)] group">
            <Avatar className="h-9 w-9">
                {member.user?.avatarUrl && <AvatarImage src={member.user.avatarUrl} />}
                <AvatarFallback className="text-sm bg-[hsl(230,10%,18%)]">
                    {(member.user?.name || member.user?.email || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.user?.name || 'Unknown'}</p>
                <p className="text-xs text-slate-500 truncate">{member.user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
                <RoleBadge role={member.role} />
                <span className="text-[10px] text-slate-600 hidden sm:block">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                </span>
                {canManage && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" disabled={updating}>
                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[hsl(230,12%,12%)] border-[hsl(230,10%,20%)] text-white">
                            {canChangeRole && (
                                <>
                                    <DropdownMenuItem className="text-xs text-slate-400 focus:bg-transparent cursor-default" disabled>Change Role</DropdownMenuItem>
                                    {member.role !== 'admin' && (
                                        <DropdownMenuItem onClick={() => updateRole('admin')} className="focus:bg-[hsl(230,10%,18%)]">
                                            <Shield className="w-3.5 h-3.5 mr-2 text-violet-400" /> Admin
                                        </DropdownMenuItem>
                                    )}
                                    {member.role !== 'member' && (
                                        <DropdownMenuItem onClick={() => updateRole('member')} className="focus:bg-[hsl(230,10%,18%)]">
                                            <Users className="w-3.5 h-3.5 mr-2 text-blue-400" /> Member
                                        </DropdownMenuItem>
                                    )}
                                    {member.role !== 'viewer' && (
                                        <DropdownMenuItem onClick={() => updateRole('viewer')} className="focus:bg-[hsl(230,10%,18%)]">
                                            <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" /> Viewer
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="bg-[hsl(230,10%,20%)]" />
                                </>
                            )}
                            <DropdownMenuItem onClick={removeMember} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
                                <UserMinus className="w-3.5 h-3.5 mr-2" /> Remove Member
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};

// --- Add Member Dialog ---
const AddMemberDialog = ({ teamId, onAdded, toast }) => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/teams/${teamId}/members`, {
                method: 'POST', credentials: 'include', headers: authHeaders(),
                body: JSON.stringify({ email: email.trim(), role })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add member');
            toast({ title: "Member added", description: `${email} added as ${role}` });
            setEmail('');
            setRole('member');
            setOpen(false);
            onAdded();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="w-4 h-4 mr-2" /> Add Member
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Enter the email of a registered user to add them to this team.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="member-email">Email Address</Label>
                        <Input
                            id="member-email"
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[hsl(230,12%,12%)] border-[hsl(230,10%,20%)] text-white">
                                <SelectItem value="admin">Admin - Can manage members & settings</SelectItem>
                                <SelectItem value="member">Member - Can create & manage links</SelectItem>
                                <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-[hsl(230,10%,20%)] text-white hover:bg-[hsl(230,10%,14%)]">Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                            Add Member
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ==================== LINKS TAB ====================
const LinksTab = ({ teamUrls, onRefresh }) => {
    const [copied, setCopied] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Team Links ({teamUrls.length})</CardTitle>
                        <CardDescription className="text-slate-500">Links created under this team</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onRefresh} className="text-slate-400 hover:text-white">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {teamUrls.length === 0 ? (
                    <div className="text-center py-8">
                        <Link2 className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No links yet. Create links from the dashboard and assign them to this team.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {teamUrls.map(url => (
                            <div key={url.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(230,10%,12%)] group">
                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <Link2 className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{url.title || url.short_url}</p>
                                    <p className="text-xs text-slate-500 truncate">{url.original_url}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400 whitespace-nowrap">{url._count?.clicks || 0} clicks</span>
                                    {url.user && (
                                        <Avatar className="h-6 w-6 hidden sm:flex" title={url.user.name || url.user.email}>
                                            {url.user.avatarUrl && <AvatarImage src={url.user.avatarUrl} />}
                                            <AvatarFallback className="text-[10px] bg-[hsl(230,10%,18%)]">
                                                {(url.user.name || url.user.email || '?').charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <Button
                                        variant="ghost" size="sm"
                                        className="h-7 w-7 p-0 text-slate-500 hover:text-white"
                                        onClick={() => copyToClipboard(url.short_url, url.id)}
                                    >
                                        {copied === url.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </Button>
                                    <a href={url.original_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// ==================== SETTINGS TAB ====================
const SettingsTab = ({ team, isOwner, onRefresh, onDeleted, toast }) => {
    const [name, setName] = useState(team.name);
    const [slug, setSlug] = useState(team.slug);
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [transferOpen, setTransferOpen] = useState(false);
    const [transferTarget, setTransferTarget] = useState('');
    const [transferring, setTransferring] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/teams/${team.id}`, {
                method: 'PATCH', credentials: 'include', headers: authHeaders(),
                body: JSON.stringify({ name, slug })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update');
            }
            toast({ title: "Team updated", description: "Team settings saved successfully" });
            onRefresh();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${API_URL}/api/teams/${team.id}`, {
                method: 'DELETE', credentials: 'include', headers: authHeaders()
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }
            toast({ title: "Team deleted", description: "Team has been permanently deleted" });
            onDeleted();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setDeleting(false);
            setDeleteOpen(false);
        }
    };

    const handleTransfer = async () => {
        if (!transferTarget) return;
        setTransferring(true);
        try {
            const res = await fetch(`${API_URL}/api/teams/${team.id}/transfer`, {
                method: 'POST', credentials: 'include', headers: authHeaders(),
                body: JSON.stringify({ newOwnerId: transferTarget })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to transfer');
            }
            toast({ title: "Ownership transferred", description: "You are now an admin of this team" });
            setTransferOpen(false);
            onRefresh();
        } catch (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setTransferring(false);
        }
    };

    const nonOwnerMembers = (team.members || []).filter(m => m.role !== 'owner');

    return (
        <div className="space-y-4">
            {/* Edit Team */}
            <Card className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Pencil className="w-4 h-4 text-blue-400" /> Team Details</CardTitle>
                    <CardDescription className="text-slate-500">Update your team's name and URL slug</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="team-name">Team Name</Label>
                                <Input
                                    id="team-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="team-slug">Team Slug</Label>
                                <Input
                                    id="team-slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="bg-[hsl(230,10%,14%)] border-[hsl(230,10%,20%)] text-white"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Transfer Ownership - Owner Only */}
            {isOwner && nonOwnerMembers.length > 0 && (
                <Card className="bg-[hsl(230,12%,9%)] border-amber-500/20 text-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400" /> Transfer Ownership</CardTitle>
                        <CardDescription className="text-slate-500">Transfer this team to another member. You'll become an admin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                                    <Crown className="w-4 h-4 mr-2" /> Transfer Ownership
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Transfer Ownership</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        Choose a team member to become the new owner. You'll be demoted to admin.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3">
                                    {nonOwnerMembers.map(m => (
                                        <div
                                            key={m.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                                transferTarget === m.userId
                                                    ? 'border-amber-500/40 bg-amber-500/10'
                                                    : 'border-[hsl(230,10%,18%)] hover:border-[hsl(230,10%,25%)]'
                                            }`}
                                            onClick={() => setTransferTarget(m.userId)}
                                        >
                                            <Avatar className="h-8 w-8">
                                                {m.user?.avatarUrl && <AvatarImage src={m.user.avatarUrl} />}
                                                <AvatarFallback className="text-xs bg-[hsl(230,10%,18%)]">
                                                    {(m.user?.name || '?').charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{m.user?.name || m.user?.email}</p>
                                                <p className="text-xs text-slate-500">{m.role}</p>
                                            </div>
                                            {transferTarget === m.userId && <Check className="w-4 h-4 text-amber-400" />}
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setTransferOpen(false)} className="border-[hsl(230,10%,20%)] text-white hover:bg-[hsl(230,10%,14%)]">Cancel</Button>
                                    <Button
                                        onClick={handleTransfer}
                                        disabled={!transferTarget || transferring}
                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        {transferring ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
                                        Transfer
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            )}

            {/* Danger Zone - Owner Only */}
            {isOwner && (
                <Card className="bg-[hsl(230,12%,9%)] border-red-500/20 text-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4" /> Danger Zone</CardTitle>
                        <CardDescription className="text-slate-500">Permanently delete this team and all associated data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Team
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)] text-white sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-red-400">Delete Team</DialogTitle>
                                    <DialogDescription className="text-slate-400">
                                        This will permanently delete <strong className="text-white">{team.name}</strong> and all its data including links, folders, and member access. This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <Label>Type <strong className="text-red-400">{team.slug}</strong> to confirm</Label>
                                    <Input
                                        value={deleteConfirm}
                                        onChange={(e) => setDeleteConfirm(e.target.value)}
                                        placeholder={team.slug}
                                        className="bg-[hsl(230,10%,14%)] border-red-500/20 text-white"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }} className="border-[hsl(230,10%,20%)] text-white hover:bg-[hsl(230,10%,14%)]">Cancel</Button>
                                    <Button
                                        onClick={handleDelete}
                                        disabled={deleteConfirm !== team.slug || deleting}
                                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                                    >
                                        {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                        Delete Permanently
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TeamDetailPage;
