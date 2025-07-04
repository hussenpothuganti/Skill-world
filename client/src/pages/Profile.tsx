import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useData } from "../contexts/DataContext";
import PostCard from "../components/feed/PostCard";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

// Define types
interface SkillCategory {
  id: string;
  name: string;
  icon: string;
}

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

// Define country options
const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "India",
  "Brazil",
  "South Africa",
  "Other"
];

const Profile: React.FC = () => {
  const { user, updateUserProfile, isLoading } = useAuth();
  const { posts, skillCategories } = useData();
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    skillType: user?.skillType || "",
    country: user?.country || "",
    personalGoal: user?.personalGoal || "",
    website: user?.website || ""
  });

  // Filter posts by current user
  const userPosts = posts.filter((post: Post) => post.userId === user?.id);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={user?.profilePicture} alt={user?.fullName} />
                <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{user?.fullName}</CardTitle>
              <CardDescription className="text-sm">{user?.skillType || "No skill type set"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Followers</span>
                <span className="font-medium">{user?.followers || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Following</span>
                <span className="font-medium">{user?.following || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Skill Points</span>
                <span className="font-medium">{user?.points || 0}</span>
              </div>
              {!isEditing && (
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skillType">Primary Skill</Label>
                    <Select 
                      value={formData.skillType} 
                      onChange={(e) => handleSelectChange("skillType", e.target.value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="skillType" aria-label="Select primary skill">
                        <SelectValue placeholder="Select your primary skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map((skill: SkillCategory) => (
                          <SelectItem key={String(skill.id)} value={String(skill.name)}>
                            {String(skill.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={formData.country} 
                      onChange={(e) => handleSelectChange("country", e.target.value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="country" aria-label="Select country">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={String(country)} value={String(country)}>
                            {String(country)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalGoal">Personal Goal</Label>
                    <Textarea
                      id="personalGoal"
                      name="personalGoal"
                      value={formData.personalGoal}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="https://example.com"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="challenges">Challenges</TabsTrigger>
                  <TabsTrigger value="battles">Battles</TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
                  {userPosts.length > 0 ? (
                    <div role="feed" aria-label="User posts">
                      {userPosts.map((post: Post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">You haven't created any posts yet.</p>
                        <Button className="mt-4">Create Your First Post</Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                <TabsContent value="challenges" className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Your Challenges</h2>
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">You haven't participated in any challenges yet.</p>
                      <Button className="mt-4">Explore Challenges</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="battles" className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Your Battles</h2>
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">You haven't participated in any battles yet.</p>
                      <Button className="mt-4">Find Battles</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
