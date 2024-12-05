import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import supabase from '@/db/supabase';
import { 
  Bell, 
  Clock, 
  ChevronRight, 
  Users, 
  MessageSquare, 
  AlertCircle,
  Check,
  Trash2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    // const fetchNotifications = async () => {
    //   setIsLoading(true);
    //   const { data } = await supabase
    //     .from('notifications')
    //     .select('*')
    //     .eq('is_read', false)
    //     .order('created_at', { ascending: false });

    //   if (data) setNotifications(data);
    //   setIsLoading(false);
    // };
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
    switch(content.type) {
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
    switch(type) {
      case 'room_invitation':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationBadge = (type) => {
    const badges = {
      'room_invitation': { label: 'Invitation', class: 'bg-blue-100 text-blue-800' },
      'message': { label: 'Message', class: 'bg-green-100 text-green-800' },
      'alert': { label: 'Alert', class: 'bg-red-100 text-red-800' },
    };
    return badges[type] || { label: 'Notification', class: 'bg-gray-100 text-gray-800' };
  };

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.content.type === filter
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {notifications.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('room_invitation')}>
                  Invitations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('message')}>
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('alert')}>
                  Alerts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAllRead}
              >
                <Check className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Stay updated with your latest notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No new notifications</p>
            <p className="text-sm mt-1">We&apos;ll notify you when something new arrives</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map(notification => (
              <TooltipProvider key={notification.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleNotificationClick(notification)}
                      className="flex items-start gap-4 p-4 hover:bg-gray-900 transition-colors cursor-pointer relative group"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.content.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`${getNotificationBadge(notification.content.type).class}`}
                          >
                            {getNotificationBadge(notification.content.type).label}
                          </Badge>
                          <p className="text-xs text-gray-400">
                            {formatTimestamp(notification.created_at)}
                          </p>
                        </div>
                        <p className="font-medium text-sm mt-1 text-gray-900">
                          {notification.content.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.content.message}
                        </p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to view details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationManager;