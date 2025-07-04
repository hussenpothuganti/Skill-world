import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Bell, MessageCircle, Heart, User, Clock, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

// Mock notification data
const mockNotifications = [
  {
    id: "notif1",
    type: "like",
    userId: "user2",
    userFullName: "Maya Rodriguez",
    userProfilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    contentId: "post1",
    contentType: "post",
    contentPreview: "My latest guitar solo",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: "notif2",
    type: "comment",
    userId: "user3",
    userFullName: "Tomas Chen",
    userProfilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    contentId: "post1",
    contentType: "post",
    contentPreview: "My latest guitar solo",
    commentText: "Amazing skills! How long have you been playing?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: "notif3",
    type: "follow",
    userId: "user4",
    userFullName: "Zoe Williams",
    userProfilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: "notif4",
    type: "challenge",
    challengeId: "challenge1",
    challengeTitle: "One-Minute Musical Story",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true
  },
  {
    id: "notif5",
    type: "battle_invite",
    userId: "user5",
    userFullName: "Marcus Lee",
    userProfilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    battleTitle: "Guitar Duel",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true
  }
];

interface NotificationItemProps {
  notification: any;
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" aria-hidden="true" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" aria-hidden="true" />;
      case "follow":
        return <User className="h-5 w-5 text-green-500" aria-hidden="true" />;
      case "challenge":
        return <Award className="h-5 w-5 text-purple-500" aria-hidden="true" />;
      case "battle_invite":
        return <Bell className="h-5 w-5 text-orange-500" aria-hidden="true" />;
      default:
        return <Bell className="h-5 w-5" aria-hidden="true" />;
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case "like":
        return (
          <p className="text-sm">
            <span className="font-medium">{notification.userFullName}</span> liked your post "{notification.contentPreview}"
          </p>
        );
      case "comment":
        return (
          <>
            <p className="text-sm">
              <span className="font-medium">{notification.userFullName}</span> commented on your post "{notification.contentPreview}"
            </p>
            <p className="text-xs text-muted-foreground mt-1">"{notification.commentText}"</p>
          </>
        );
      case "follow":
        return (
          <p className="text-sm">
            <span className="font-medium">{notification.userFullName}</span> started following you
          </p>
        );
      case "challenge":
        return (
          <p className="text-sm">
            New challenge available: <span className="font-medium">{notification.challengeTitle}</span>
          </p>
        );
      case "battle_invite":
        return (
          <p className="text-sm">
            <span className="font-medium">{notification.userFullName}</span> invited you to a battle: "{notification.battleTitle}"
          </p>
        );
      default:
        return <p className="text-sm">New notification</p>;
    }
  };

  return (
    <Card className={`mb-3 ${!notification.read ? "border-l-4 border-l-primary" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {notification.userProfilePicture ? (
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={notification.userProfilePicture} 
                  alt={notification.userFullName || ""} 
                  onError={(e) => {
                    // Added error handling for avatar image loading
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <AvatarFallback>{notification.userFullName?.charAt(0) || "N"}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {getIcon()}
              </div>
            )}
          </div>
          <div className="flex-1">
            {getMessage()}
            <div className="flex items-center mt-2">
              <Clock className="h-3 w-3 text-muted-foreground mr-1" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const allNotifications = notifications;
  const unreadNotifications = notifications.filter(notif => !notif.read);
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={markAllAsRead}
          disabled={unreadNotifications.length === 0}
          aria-label="Mark all notifications as read"
        >
          Mark all as read
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="all" className="flex-1">
            All
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {allNotifications.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex-1">
            Unread
            <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {unreadNotifications.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {allNotifications.length > 0 ? (
            <div role="feed" aria-label="All notifications">
              {allNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <p className="text-muted-foreground">No notifications yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="unread">
          {unreadNotifications.length > 0 ? (
            <div role="feed" aria-label="Unread notifications">
              {unreadNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
                <p className="text-muted-foreground">No unread notifications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
