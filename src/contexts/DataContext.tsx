import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";

// Define types for data context
interface Post {
  id: string;
  userId: string;
  userName: string;
  userProfilePicture: string;
  content: string;
  mediaUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  skillCategory: string;
}

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

interface BattleParticipant {
  userId: string;
  fullName: string;
  profilePicture: string;
  mediaUrl: string;
  votes: number;
}

interface Battle {
  id: string;
  title: string;
  skillCategory: string;
  participantA: BattleParticipant;
  participantB: BattleParticipant;
  endTime: string;
  isActive: boolean;
}

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

interface SkillCategory {
  id: string;
  name: string;
  icon: string;
}

interface DataContextType {
  posts: Post[];
  challenges: Challenge[];
  battles: Battle[];
  skillRooms: SkillRoom[];
  skillCategories: SkillCategory[];
  fetchPosts?: () => Promise<void>;
  fetchChallenges?: () => Promise<void>;
  fetchBattles?: () => Promise<void>;
  fetchSkillRooms?: () => Promise<void>;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data for fallback when API is not available
const mockSkillCategories: SkillCategory[] = [
  { id: "cat1", name: "Music", icon: "🎸" },
  { id: "cat2", name: "Art", icon: "🎨" },
  { id: "cat3", name: "Technology", icon: "💻" },
  { id: "cat4", name: "Photography", icon: "📷" },
  { id: "cat5", name: "Dance", icon: "💃" },
  { id: "cat6", name: "Writing", icon: "✍️" },
  { id: "cat7", name: "Cooking", icon: "🍳" },
  { id: "cat8", name: "Sports", icon: "⚽" }
];

const mockPosts: Post[] = [
  {
    id: "post1",
    userId: "user1",
    userName: "Alex Johnson",
    userProfilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: "Just finished recording my latest guitar cover! What do you think?",
    mediaUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    likes: 42,
    comments: 7,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    skillCategory: "Music"
  },
  {
    id: "post2",
    userId: "user2",
    userName: "Maya Rodriguez",
    userProfilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: "My latest dance choreography inspired by traditional Latin moves with a modern twist.",
    mediaUrl: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    likes: 78,
    comments: 15,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    skillCategory: "Dance"
  },
  {
    id: "post3",
    userId: "user3",
    userName: "Tomas Chen",
    userProfilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: "Just deployed my first full-stack application! Built with React, Node.js, and MongoDB. It's a platform for developers to share and get feedback on their projects.",
    likes: 104,
    comments: 23,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    skillCategory: "Technology"
  }
];

const mockChallenges: Challenge[] = [
  {
    id: "challenge1",
    title: "Storytelling Through Music",
    description: "Create a 60-second musical piece that tells a story without words.",
    skillCategory: "Music",
    participants: 128,
    daysLeft: 5,
    reward: "Featured on homepage + 500 points",
    coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "challenge2",
    title: "Everyday Object Photography",
    description: "Transform ordinary household items into extraordinary photographic art.",
    skillCategory: "Photography",
    participants: 94,
    daysLeft: 3,
    reward: "Pro account upgrade + 300 points",
    coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: "challenge3",
    title: "30-Day Coding Streak",
    description: "Code something new every day for 30 days and document your progress.",
    skillCategory: "Technology",
    participants: 215,
    daysLeft: 12,
    reward: "Developer mentorship session + 750 points",
    coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
];

const mockBattles: Battle[] = [
  {
    id: "battle1",
    title: "Guitar Duel",
    skillCategory: "Music",
    participantA: {
      userId: "user1",
      fullName: "Alex Johnson",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      mediaUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      votes: 42
    },
    participantB: {
      userId: "user5",
      fullName: "Marcus Lee",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      mediaUrl: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      votes: 38
    },
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: "battle2",
    title: "Street Dance Showdown",
    skillCategory: "Dance",
    participantA: {
      userId: "user2",
      fullName: "Maya Rodriguez",
      profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      mediaUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      votes: 67
    },
    participantB: {
      userId: "user4",
      fullName: "Zoe Williams",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      mediaUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      votes: 72
    },
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  }
];

const mockSkillRooms: SkillRoom[] = [
  {
    id: "room1",
    title: "Guitar Basics Workshop",
    skillCategory: "Music",
    hostName: "Alex Johnson",
    hostProfilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    participants: 12,
    maxParticipants: 20,
    status: "live",
    startTime: new Date().toISOString()
  },
  {
    id: "room2",
    title: "Advanced Photography Techniques",
    skillCategory: "Photography",
    hostName: "Zoe Williams",
    hostProfilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    participants: 8,
    maxParticipants: 15,
    status: "scheduled",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "room3",
    title: "Web Development Q&A",
    skillCategory: "Technology",
    hostName: "Tomas Chen",
    hostProfilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    participants: 25,
    maxParticipants: 30,
    status: "live",
    startTime: new Date().toISOString()
  }
];

// Create the provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [battles, setBattles] = useState<Battle[]>(mockBattles);
  const [skillRooms, setSkillRooms] = useState<SkillRoom[]>(mockSkillRooms);
  const [skillCategories] = useState<SkillCategory[]>(mockSkillCategories);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Attempt to fetch real data when component mounts
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchPosts(),
          fetchChallenges(),
          fetchBattles(),
          fetchSkillRooms()
        ]);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        // Using mock data as fallback
        toast.error("Could not connect to server. Using demo data instead.");
      }
    };

    fetchInitialData();

    return () => {
      setIsMounted(false);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      if (isMounted && response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Keep using mock data
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/challenges');
      if (isMounted && response.data.success) {
        setChallenges(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
      // Keep using mock data
    }
  };

  const fetchBattles = async () => {
    try {
      const response = await api.get('/battles');
      if (isMounted && response.data.success) {
        setBattles(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching battles:", error);
      // Keep using mock data
    }
  };

  const fetchSkillRooms = async () => {
    try {
      const response = await api.get('/skillrooms');
      if (isMounted && response.data.success) {
        setSkillRooms(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching skill rooms:", error);
      // Keep using mock data
    }
  };

  return (
    <DataContext.Provider value={{ 
      posts, 
      challenges, 
      battles, 
      skillRooms, 
      skillCategories,
      fetchPosts,
      fetchChallenges,
      fetchBattles,
      fetchSkillRooms
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Create a hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
