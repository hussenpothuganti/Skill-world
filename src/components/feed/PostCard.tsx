import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/card';

// Define the PostCard props interface
interface PostCardProps {
  post: {
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
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-center mb-3">
          <img 
            src={post.userProfilePicture || 'https://via.placeholder.com/40'} 
            alt={post.userName} 
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <h3 className="font-medium">{post.userName}</h3>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)} • {post.skillCategory}</p>
          </div>
        </div>
        
        {/* Post Content */}
        <p className="mb-3">{post.content}</p>
        
        {/* Post Media */}
        {post.mediaUrl && (
          <div className="mb-3 rounded-md overflow-hidden">
            <img 
              src={post.mediaUrl} 
              alt="Post media" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        {/* Post Actions */}
        <div className="flex items-center text-sm text-gray-500">
          <button className="flex items-center mr-4 hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {post.likes}
          </button>
          <button className="flex items-center hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.comments}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
