
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  Notification 
} from "@/utils/notifications";
import { toast } from "sonner";
import { format } from "date-fns";

const NotificationsMenu = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useTranslation();

  // Load notifications on mount and periodically
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userNotifications = await getUserNotifications();
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Load notifications immediately
    fetchNotifications();
    
    // Set up interval to check for new notifications (every 30 seconds)
    const intervalId = setInterval(fetchNotifications, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error(t("common.error"));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
      toast.success(t("notifications.markAllAsRead"));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error(t("common.error"));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-teal-deep text-xs"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">{t("notifications.notifications")}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[300px] max-h-[400px] overflow-auto">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>{t("notifications.notifications")}</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs h-7"
            >
              {t("notifications.markAllAsRead")}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          {notifications.length === 0 ? (
            <DropdownMenuItem disabled>
              {t("notifications.noNotifications")}
            </DropdownMenuItem>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem key={notification.id} className="cursor-pointer flex flex-col items-start">
                <div className="flex w-full justify-between">
                  <span className="font-medium">{notification.title}</span>
                  {!notification.read && (
                    <Badge className="bg-teal-deep ml-2">{t("notifications.new")}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <div className="flex w-full justify-between text-xs text-muted-foreground mt-2">
                  <span>{format(new Date(notification.created_at), 'PP')}</span>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs h-6 p-1"
                    >
                      {t("notifications.markAsRead")}
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsMenu;
