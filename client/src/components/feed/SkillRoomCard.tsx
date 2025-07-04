import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Users, Video } from "lucide-react";

interface SkillRoom {
  id: string;
  title: string;
  skillCategory: string;
  hostName: string;
  hostProfilePicture: string;
  participants: number;
  maxParticipants: number;
  status: "live" | "scheduled" | "ended";
  startTime: string;
}

interface SkillRoomCardProps {
  room: SkillRoom;
}

const SkillRoomCard: React.FC<SkillRoomCardProps> = ({ room }) => {
  return (
    <Card className="min-w-[250px] w-[250px] flex-shrink-0 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-skill-purple border-0">
            {room.skillCategory}
          </Badge>
          {room.status === "live" ? (
            <Badge className="bg-red-500 border-0 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
              Live
            </Badge>
          ) : room.status === "scheduled" ? (
            <Badge className="bg-muted-foreground border-0">
              Scheduled
            </Badge>
          ) : (
            <Badge className="bg-gray-500 border-0">
              Ended
            </Badge>
          )}
        </div>
        
        <h3 className="font-bold text-sm mb-3">{room.title}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage 
              src={room.hostProfilePicture} 
              alt={room.hostName}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <AvatarFallback>{room.hostName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-xs">
            <p className="font-medium">Hosted by {room.hostName}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            <span>{room.participants}/{room.maxParticipants}</span>
          </div>
        </div>
        
        <Button 
          className="w-full text-xs h-8 flex items-center justify-center gap-1"
          variant={room.status === "live" ? "default" : "outline"}
          aria-label={room.status === "live" ? "Join live room" : room.status === "scheduled" ? "Set reminder" : "View recording"}
        >
          {room.status === "live" ? (
            <>
              <Video className="h-3 w-3" aria-hidden="true" />
              Join Now
            </>
          ) : room.status === "scheduled" ? (
            "Set Reminder"
          ) : (
            "View Recording"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SkillRoomCard;
