import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import supabase from '@/db/supabase';
import {
  Bell,
  Clock,
  Users,
  MessageSquare,
  AlertCircle,
  Check,
  Trash2,
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
import { fetchNotifications } from './notification-methods';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications().then(data => {
      if (data) setNotifications(data);
      setIsLoading(false);
    });

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          const content = payload.new.content;
          toast(content.title, {
            description: content.message,
            action: {
              label: 'View',
              onClick: () => handleNotificationClick(payload.new)
            }
          });
        }
      )
      .subscribe();

    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id);

    const content = notification.content;
    switch (content.type) {
      case 'room_invitation':
        navigateToInvitation(content.roomId);
        break;
    }
  };

  const handleMarkAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', notifications.map(n => n.id));
    setNotifications([]);
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const navigateToInvitation = (roomId) => {
    navigate(`/invitation/${roomId}`);
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
        return <Users className="w-4 h-4 text-cyan-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getNotificationBadge = (type) => {
    const badges = {
      'room_invitation': { label: 'Invitation', class: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
      'message': { label: 'Message', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      'alert': { label: 'Alert', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
    };
    return badges[type] || { label: 'Notification', class: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  };

  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || notification.content.type === filter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-6">
      <Card className="w-full max-w-2xl mx-auto bg-zinc-900 border-zinc-800">
        <CardHeader className="border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5 text-cyan-400" />
              Notifications
              {notifications.length > 0 && (
                <Badge className="ml-2 bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                  {notifications.length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem onClick={() => setFilter('all')} className="text-zinc-300 focus:bg-zinc-800">
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('room_invitation')} className="text-zinc-300 focus:bg-zinc-800">
                    Invitations
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('message')} className="text-zinc-300 focus:bg-zinc-800">
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('alert')} className="text-zinc-300 focus:bg-zinc-800">
                    Alerts
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-zinc-500 mt-1">Stay updated with your latest notifications</p>
        </CardHeader>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-400 font-medium">No new notifications</p>
              <p className="text-sm text-zinc-600 mt-1">We&apos;ll notify you when something new arrives</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex items-start gap-3 p-4 hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                >
                  <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-zinc-800">
                    {getNotificationIcon(notification.content.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={getNotificationBadge(notification.content.type).class}
                      >
                        {getNotificationBadge(notification.content.type).label}
                      </Badge>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(notification.created_at)}
                      </span>
                    </div>
                    <p className="font-medium text-sm text-white">
                      {notification.content.title}
                    </p>
                    <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">
                      {notification.content.message}
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