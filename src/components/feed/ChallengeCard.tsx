import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Trophy, Users } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  skillCategory: string;
  participants: number;
  daysLeft: number;
  reward: string;
  coverImage: string;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  return (
    <Card className="min-w-[250px] w-[250px] flex-shrink-0 overflow-hidden">
      <div className="relative h-32">
        <img 
          src={challenge.coverImage} 
          alt={challenge.title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://placehold.co/400x200?text=Challenge+Image";
            target.alt = "Challenge image not available";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge className="absolute top-2 left-2 bg-skill-purple border-0">
          {challenge.skillCategory}
        </Badge>
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <h3 className="font-bold text-sm line-clamp-1">{challenge.title}</h3>
        </div>
      </div>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {challenge.description}
        </p>
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            <span>{challenge.participants} joined</span>
          </div>
          <div className="text-amber-500 font-medium">
            {challenge.daysLeft} days left
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Trophy className="h-3 w-3 text-amber-500" aria-hidden="true" />
          <span>{challenge.reward}</span>
        </div>
        <Button 
          className="w-full text-xs h-8 skill-gradient hover:opacity-90 transition-opacity"
          aria-label={`Join ${challenge.title} challenge`}
        >
          Join Challenge
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
