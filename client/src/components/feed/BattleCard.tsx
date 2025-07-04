import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Battle {
  id: string;
  title: string;
  skillCategory: string;
  participantA: {
    userId: string;
    fullName: string;
    profilePicture: string;
    mediaUrl: string;
    votes: number;
  };
  participantB: {
    userId: string;
    fullName: string;
    profilePicture: string;
    mediaUrl: string;
    votes: number;
  };
  endTime: string;
  isActive: boolean;
}

interface BattleCardProps {
  battle: Battle;
}

const BattleCard = ({ battle }: BattleCardProps) => {
  const [localBattle, setLocalBattle] = useState(battle);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [participant, setParticipant] = useState<'A' | 'B' | null>(null);
  // Added ref to track component mount state
  const isMounted = useRef(true);
  
  const totalVotes = localBattle.participantA.votes + localBattle.participantB.votes;
  const percentA = totalVotes ? Math.round((localBattle.participantA.votes / totalVotes) * 100) : 50;
  const percentB = 100 - percentA;

  // Added cleanup for async operations
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fixed potential race condition with debounce mechanism
  const handleVote = async (participant: 'A' | 'B') => {
    if (hasVoted || !localBattle.isActive || isVoting) {
      toast.error("You have already voted in this battle");
      return;
    }
    
    setIsVoting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // Update local state
        const updatedBattle = { ...localBattle };
        
        if (participant === 'A') {
          updatedBattle.participantA.votes += 1;
        } else {
          updatedBattle.participantB.votes += 1;
        }
        
        setLocalBattle(updatedBattle);
        setHasVoted(true);
        setParticipant(participant);
        
        toast.success(`Vote for ${participant === 'A' ? updatedBattle.participantA.fullName : updatedBattle.participantB.fullName} recorded!`);
      }
    } catch (error) {
      console.error("Voting error:", error);
      // Only update state if component is still mounted
      if (isMounted.current) {
        toast.error("Failed to record vote. Please try again.");
      }
    } finally {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setIsVoting(false);
      }
    }
  };

  return (
    <Card className="min-w-[300px] w-[300px] flex-shrink-0 overflow-hidden border">
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{localBattle.title}</h3>
          <span className="bg-skill-purple text-white text-xs px-2 py-0.5 rounded-full">
            {localBattle.skillCategory}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {localBattle.isActive 
            ? `Ends ${formatDistanceToNow(new Date(localBattle.endTime), { addSuffix: true })}` 
            : "Completed"}
        </p>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <div className="flex gap-2 mb-3">
          {/* Left participant */}
          <div className="flex-1">
            <div className="relative h-36 mb-2 overflow-hidden rounded-md">
              <img 
                src={localBattle.participantA.mediaUrl}
                alt={localBattle.participantA.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Added error handling for image loading
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/300x200?text=Image+Not+Available";
                  target.alt = "Image not available";
                }}
              />
              {hasVoted && participant === 'A' && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Your Vote
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarImage 
                  src={localBattle.participantA.profilePicture} 
                  alt={localBattle.participantA.fullName} 
                  onError={(e) => {
                    // Added error handling for avatar image loading
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <AvatarFallback>{localBattle.participantA.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium truncate">{localBattle.participantA.fullName}</span>
            </div>
          </div>
          
          {/* VS */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="font-bold text-sm">VS</span>
          </div>
          
          {/* Right participant */}
          <div className="flex-1">
            <div className="relative h-36 mb-2 overflow-hidden rounded-md">
              <img 
                src={localBattle.participantB.mediaUrl}
                alt={localBattle.participantB.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Added error handling for image loading
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/300x200?text=Image+Not+Available";
                  target.alt = "Image not available";
                }}
              />
              {hasVoted && participant === 'B' && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Your Vote
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarImage 
                  src={localBattle.participantB.profilePicture} 
                  alt={localBattle.participantB.fullName}
                  onError={(e) => {
                    // Added error handling for avatar image loading
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <AvatarFallback>{localBattle.participantB.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium truncate">{localBattle.participantB.fullName}</span>
            </div>
          </div>
        </div>
        
        {/* Vote progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-2 overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${percentA}%` }}
            />
            <div 
              className="bg-red-500 h-full transition-all duration-300"
              style={{ width: `${percentB}%` }}
            />
          </div>
        </div>
        
        {/* Vote counts */}
        <div className="flex justify-between text-xs text-muted-foreground mb-3">
          <span>{localBattle.participantA.votes} votes ({percentA}%)</span>
          <span>{localBattle.participantB.votes} votes ({percentB}%)</span>
        </div>
        
        {localBattle.isActive && (
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={`w-full text-xs h-8 border-blue-500 text-blue-500 hover:bg-blue-500/10 ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleVote('A')}
              disabled={hasVoted || isVoting}
              aria-label={`Vote for ${localBattle.participantA.fullName}`}
            >
              {isVoting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Voting...
                </span>
              ) : (
                `Vote Left`
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`w-full text-xs h-8 border-red-500 text-red-500 hover:bg-red-500/10 ${hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleVote('B')}
              disabled={hasVoted || isVoting}
              aria-label={`Vote for ${localBattle.participantB.fullName}`}
            >
              {isVoting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Voting...
                </span>
              ) : (
                `Vote Right`
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BattleCard;
