import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, Send, Phone, Video, Info } from "lucide-react";

// Mock conversation data
const mockConversations = [
  {
    id: "conv1",
    userId: "user2",
    userFullName: "Maya Rodriguez",
    userProfilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    lastMessage: "That sounds great! Looking forward to it.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unread: 2
  },
  {
    id: "conv2",
    userId: "user3",
    userFullName: "Tomas Chen",
    userProfilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    lastMessage: "Can you share more details about your AI project?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread: 0
  },
  {
    id: "conv3",
    userId: "user4",
    userFullName: "Zoe Williams",
    userProfilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    lastMessage: "I loved your photography tips! Would you be interested in a collaboration?",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    unread: 0
  },
  {
    id: "conv4",
    userId: "user5",
    userFullName: "Marcus Lee",
    userProfilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    lastMessage: "Let me know when you're free for the battle!",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unread: 0
  }
];

// Mock messages for a conversation
const mockMessages = [
  {
    id: "msg1",
    senderId: "user2",
    text: "Hey! I saw your latest guitar solo post. It was amazing!",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg2",
    senderId: "currentUser",
    text: "Thanks! I've been practicing that piece for weeks.",
    timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg3",
    senderId: "user2",
    text: "It really shows. How long have you been playing?",
    timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg4",
    senderId: "currentUser",
    text: "About 5 years now. Started in college and got hooked!",
    timestamp: new Date(Date.now() - 1.7 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg5",
    senderId: "user2",
    text: "That's awesome. I'm a dancer but I've always wanted to learn an instrument.",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg6",
    senderId: "currentUser",
    text: "It's never too late to start! Guitar is pretty beginner-friendly.",
    timestamp: new Date(Date.now() - 1.4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg7",
    senderId: "user2",
    text: "Would you be interested in doing a skill exchange? I could teach you some dance moves, and you could show me guitar basics?",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "msg8",
    senderId: "currentUser",
    text: "That sounds like a great idea! We could do it in a skill room.",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: "msg9",
    senderId: "user2",
    text: "Perfect! How about this weekend?",
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  },
  {
    id: "msg10",
    senderId: "user2",
    text: "That sounds great! Looking forward to it.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface ConversationItemProps {
  conversation: any;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem = ({ 
  conversation, 
  isActive, 
  onClick 
}: ConversationItemProps) => {
  return (
    <div 
      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${isActive ? 'bg-muted' : ''}`}
      onClick={onClick}
      role="button"
      aria-selected={isActive}
      tabIndex={0}
      aria-label={`Conversation with ${conversation.userFullName}`}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={conversation.userProfilePicture} 
            alt={conversation.userFullName}
            onError={(e) => {
              // Added error handling for avatar image loading
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <AvatarFallback>{conversation.userFullName.charAt(0)}</AvatarFallback>
        </Avatar>
        {conversation.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-label={`${conversation.unread} unread messages`}>
            {conversation.unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm truncate">{conversation.userFullName}</h3>
          <span className="text-xs text-muted-foreground">
            {new Date(conversation.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: any;
  user: any;
}

const MessageBubble = ({ message, user }: MessageBubbleProps) => {
  const isCurrentUser = message.senderId === "currentUser";
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="flex items-end gap-2">
        {!isCurrentUser && (
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user.userProfilePicture} 
              alt={user.userFullName}
              onError={(e) => {
                // Added error handling for avatar image loading
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <AvatarFallback>{user.userFullName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
        <div 
          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground rounded-br-none' 
              : 'bg-muted rounded-bl-none'
          }`}
          role="article"
          aria-label={`Message from ${isCurrentUser ? 'you' : user.userFullName}`}
        >
          <p className="text-sm">{message.text}</p>
          <span className="text-xs opacity-70 block text-right mt-1">
            {formatMessageTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversation, setActiveConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // Added ref to track component mount state
  const isMounted = useRef(true);
  
  // Added cleanup for async operations
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const filteredConversations = conversations.filter(conv => 
    conv.userFullName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const newMsg = {
      id: `msg${messages.length + 1}`,
      senderId: "currentUser",
      text: newMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMsg]);
    
    // Update last message in conversation list
    setConversations(conversations.map(conv => 
      conv.id === activeConversation.id 
        ? { ...conv, lastMessage: newMessage.trim(), timestamp: new Date().toISOString(), unread: 0 }
        : conv
    ));
    
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations sidebar */}
      <div className="w-full sm:w-80 border-r flex flex-col">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
            <Input
              placeholder="Search messages..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search messages"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto" role="list" aria-label="Conversations">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conversation => (
              <ConversationItem 
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversation?.id === conversation.id}
                onClick={() => {
                  setActiveConversation(conversation);
                  // Mark as read when clicked
                  setConversations(conversations.map(conv => 
                    conv.id === conversation.id 
                      ? { ...conv, unread: 0 }
                      : conv
                  ));
                }}
              />
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No conversations found
            </div>
          )}
        </div>
      </div>
      
      {/* Chat area */}
      <div className="hidden sm:flex flex-col flex-1">
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={activeConversation.userProfilePicture} 
                    alt={activeConversation.userFullName}
                    onError={(e) => {
                      // Added error handling for avatar image loading
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <AvatarFallback>{activeConversation.userFullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{activeConversation.userFullName}</h2>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Voice call">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Video call">
                  <Video className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Conversation info">
                  <Info className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4" role="log" aria-label="Message history">
              {messages.map(message => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  user={activeConversation}
                />
              ))}
            </div>
            
            {/* Message input */}
            <div className="p-3 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  aria-label="Message text"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!newMessage.trim()}
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" aria-hidden="true" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile: Select a conversation message */}
      <div className="flex sm:hidden flex-1 items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground">Select a conversation to view messages</p>
        </div>
      </div>
    </div>
  );
};

export default Messages;
