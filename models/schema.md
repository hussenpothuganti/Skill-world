# SkillWorld Backend Database Schema

## Overview
This document outlines the MongoDB schema design for the SkillWorld application. The schema is designed to support all frontend features including user authentication, posts, challenges, battles, skill rooms, messaging, and notifications.

## Collections

### Users
```javascript
{
  _id: ObjectId,
  email: String,          // Unique, required
  password: String,       // Hashed, required
  fullName: String,       // Required
  username: String,       // Unique, required
  profilePicture: String, // URL to image
  bio: String,
  skillType: String,      // Primary skill category
  country: String,
  personalGoal: String,
  website: String,
  followers: [ObjectId],  // References to User IDs
  following: [ObjectId],  // References to User IDs
  points: Number,         // Default: 0
  isOnboarded: Boolean,   // Default: false
  refreshToken: String,   // For JWT refresh
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts
```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // Reference to User
  skillCategory: String,  // Required
  title: String,          // Required
  description: String,    // Required
  mediaUrl: String,       // Required, URL to image/video
  isVideo: Boolean,       // Default: false
  likes: [ObjectId],      // Array of User IDs who liked
  comments: Number,       // Count of comments
  views: Number,          // Default: 0
  createdAt: Date,
  updatedAt: Date
}
```

### Comments
```javascript
{
  _id: ObjectId,
  postId: ObjectId,       // Reference to Post
  userId: ObjectId,       // Reference to User
  text: String,           // Required
  likes: [ObjectId],      // Array of User IDs who liked
  createdAt: Date,
  updatedAt: Date
}
```

### Challenges
```javascript
{
  _id: ObjectId,
  title: String,          // Required
  description: String,    // Required
  skillCategory: String,  // Required
  thumbnail: String,      // URL to image
  points: Number,         // Reward points
  deadline: Date,         // Required
  participants: [ObjectId], // References to User IDs
  submissions: [ObjectId],  // References to Submission IDs
  createdAt: Date,
  updatedAt: Date
}
```

### Submissions
```javascript
{
  _id: ObjectId,
  challengeId: ObjectId,  // Reference to Challenge
  userId: ObjectId,       // Reference to User
  mediaUrl: String,       // URL to submission media
  description: String,
  votes: [ObjectId],      // Array of User IDs who voted
  createdAt: Date
}
```

### Battles
```javascript
{
  _id: ObjectId,
  title: String,          // Required
  skillCategory: String,  // Required
  participantA: {
    userId: ObjectId,     // Reference to User
    mediaUrl: String,     // URL to media
    votes: [ObjectId]     // Array of User IDs who voted
  },
  participantB: {
    userId: ObjectId,     // Reference to User
    mediaUrl: String,     // URL to media
    votes: [ObjectId]     // Array of User IDs who voted
  },
  endTime: Date,          // Required
  isActive: Boolean,      // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

### SkillRooms
```javascript
{
  _id: ObjectId,
  title: String,          // Required
  hostId: ObjectId,       // Reference to User
  skillCategory: String,  // Required
  participants: [ObjectId], // References to User IDs
  isLive: Boolean,        // Default: false
  thumbnail: String,      // URL to image
  roomUrl: String,        // URL for joining room
  scheduledFor: Date,     // Optional, for scheduled rooms
  createdAt: Date,
  updatedAt: Date
}
```

### Conversations
```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // References to User IDs (exactly 2)
  lastMessage: String,
  lastMessageTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId, // Reference to Conversation
  senderId: ObjectId,       // Reference to User
  text: String,             // Required
  isRead: Boolean,          // Default: false
  createdAt: Date
}
```

### Notifications
```javascript
{
  _id: ObjectId,
  recipientId: ObjectId,    // Reference to User
  senderId: ObjectId,       // Reference to User (optional)
  type: String,             // "like", "comment", "follow", "challenge", "battle_invite"
  contentId: ObjectId,      // Reference to related content
  contentType: String,      // "post", "comment", "challenge", "battle"
  text: String,             // Notification text
  isRead: Boolean,          // Default: false
  createdAt: Date
}
```

## Relationships

1. **Users to Posts**: One-to-Many
   - A user can create multiple posts
   - Each post belongs to one user

2. **Users to Comments**: One-to-Many
   - A user can create multiple comments
   - Each comment belongs to one user

3. **Posts to Comments**: One-to-Many
   - A post can have multiple comments
   - Each comment belongs to one post

4. **Users to Challenges**: Many-to-Many
   - A user can participate in multiple challenges
   - A challenge can have multiple participants

5. **Challenges to Submissions**: One-to-Many
   - A challenge can have multiple submissions
   - Each submission belongs to one challenge

6. **Users to Battles**: Many-to-Many
   - A user can participate in multiple battles
   - A battle has exactly two participants

7. **Users to SkillRooms**: Many-to-Many
   - A user can host or join multiple skill rooms
   - A skill room can have multiple participants

8. **Users to Conversations**: Many-to-Many
   - A user can have multiple conversations
   - Each conversation has exactly two participants

9. **Conversations to Messages**: One-to-Many
   - A conversation can have multiple messages
   - Each message belongs to one conversation

10. **Users to Notifications**: One-to-Many
    - A user can receive multiple notifications
    - Each notification is for one recipient

## Indexes

1. **Users Collection**:
   - `email`: Unique index
   - `username`: Unique index

2. **Posts Collection**:
   - `userId`: For quick lookup of user's posts
   - `skillCategory`: For filtering by category

3. **Comments Collection**:
   - `postId`: For quick lookup of post's comments
   - `userId`: For quick lookup of user's comments

4. **Challenges Collection**:
   - `skillCategory`: For filtering by category
   - `deadline`: For finding active challenges

5. **Battles Collection**:
   - `skillCategory`: For filtering by category
   - `endTime`: For finding active battles

6. **Conversations Collection**:
   - `participants`: For finding conversations between users

7. **Messages Collection**:
   - `conversationId`: For quick lookup of conversation messages
   - `isRead`: For finding unread messages

8. **Notifications Collection**:
   - `recipientId`: For quick lookup of user's notifications
   - `isRead`: For finding unread notifications
