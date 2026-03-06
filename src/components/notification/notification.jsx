import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Bell,
  Clock,
  Users,
  MessageSquare,
  AlertCircle,
  Check,
  Trash2,
  UserPlus,
  UserMinus,
  Shield,
  Crown,
  Link2,
  Trash,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notification-methods';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    const data = await fetchNotifications();
    if (data) setNotifications(data);
  }, []);

  useEffect(() => {
    loadNotifications().then(() => setIsLoading(false));

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationRead(notification.id);
      setNotifications(prev => prev.filter(n => n.id !== notification.id));

      const data = notification.data || notification.content || {};
      const type = notification.type || data.type;

      if (type === 'room_invitation' || type === 'room_invite') {
        navigate(`/invitation/${data.roomId}`);
      } else if (['team_added', 'team_role_changed', 'team_ownership_transfer'].includes(type) && data.teamId) {
        navigate(`/teams/${data.teamId}`);
      } else if (['team_removed', 'team_deleted'].includes(type)) {
        navigate('/teams');
      } else if (type === 'link_created' && data.shortCode) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications([]);
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return diffInHours === 0
        ? 'Just now'
        : `${diffInHours}h ago`;
    }
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'room_invitation':
      case 'room_invite':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'team_added':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'team_removed':
        return <UserMinus className="w-4 h-4 text-red-400" />;
      case 'team_role_changed':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'team_ownership_transfer':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'team_deleted':
        return <Trash className="w-4 h-4 text-red-400" />;
      case 'link_created':
        return <Link2 className="w-4 h-4 text-blue-400" />;
      case 'click_milestone':
        return <Bell className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNotificationBadge = (type) => {
    const badges = {
      'room_invitation': { label: 'Invitation', class: 'bg-blue-600/10 text-blue-400 border-blue-600/20' },
      'room_invite': { label: 'Invitation', class: 'bg-blue-600/10 text-blue-400 border-blue-600/20' },
      'message': { label: 'Message', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      'alert': { label: 'Alert', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
      'team_added': { label: 'Team', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      'team_removed': { label: 'Team', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
      'team_role_changed': { label: 'Team', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      'team_ownership_transfer': { label: 'Team', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
      'team_deleted': { label: 'Team', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
      'link_created': { label: 'Link', class: 'bg-blue-600/10 text-blue-400 border-blue-600/20' },
      'click_milestone': { label: 'Milestone', class: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    };
    return badges[type] || { label: 'Notification', class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  };

  const filteredNotifications = notifications.filter(notification => {
    const type = notification.type || notification.content?.type;
    if (filter === 'all') return true;
    if (filter === 'team') return type?.startsWith('team_');
    return type === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(230,15%,5%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(230,15%,5%)] p-4 md:p-6">
      <Card className="w-full max-w-2xl mx-auto bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
        <CardHeader className="border-b border-[hsl(230,10%,15%)]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5 text-blue-400" />
              Notifications
              {notifications.length > 0 && (
                <Badge className="ml-2 bg-blue-600/10 text-blue-400 border-blue-600/20">
                  {notifications.length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)]">
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
                  <DropdownMenuItem onClick={() => setFilter('all')} className="text-slate-300 focus:bg-[hsl(230,10%,14%)]">
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('room_invitation')} className="text-slate-300 focus:bg-[hsl(230,10%,14%)]">
                    Invitations
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('team')} className="text-slate-300 focus:bg-[hsl(230,10%,14%)]">
                    Teams
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('message')} className="text-slate-300 focus:bg-[hsl(230,10%,14%)]">
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('alert')} className="text-slate-300 focus:bg-[hsl(230,10%,14%)]">
                    Alerts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="border-[hsl(230,10%,20%)] text-slate-300 hover:bg-[hsl(230,10%,14%)]"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-1">Stay updated with your latest notifications</p>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400 font-medium">No new notifications</p>
              <p className="text-sm text-slate-600 mt-1">We&apos;ll notify you when something new arrives</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex items-start gap-3 p-4 hover:bg-[hsl(230,10%,14%)]/50 transition-colors cursor-pointer group"
                >
                  <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-[hsl(230,10%,14%)]">
                    {getNotificationIcon(notification.type || notification.content?.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={getNotificationBadge(notification.type || notification.content?.type).class}
                      >
                        {getNotificationBadge(notification.type || notification.content?.type).label}
                      </Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(notification.createdAt || notification.created_at)}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-white">
                      {notification.title || notification.content?.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                      {notification.message || notification.content?.message}
                    </p>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteNotification(e, notification.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationManager;