import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useData } from "../contexts/DataContext";
import { Upload, Image, Video } from "lucide-react";
import { toast } from "sonner";

// Define SkillCategory type
type SkillCategory = string;

const Create = () => {
  const { skillCategories } = useData();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SkillCategory | "">("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [isLoading, setIsLoading] = useState(false);
  // Added ref to track component mount state
  const isMounted = useRef(true);
  
  // Added cleanup for async operations
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        // In a real app, this would upload the media and create a post
        toast.success("Post created successfully!");
        
        // Reset form
        setTitle("");
        setDescription("");
        setCategory("");
        setMediaType("image");
      }
    } catch (error) {
      console.error("Post creation error:", error);
      // Only update state if component is still mounted
      if (isMounted.current) {
        toast.error("Failed to create post. Please try again.");
      }
    } finally {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Content</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Share Your Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your post a title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                aria-label="Post title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your content..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                aria-label="Post description"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Skill Category</Label>
              <Select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                disabled={isLoading}
              >
                <SelectTrigger id="category" aria-label="Select a category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((cat) => (
                    <SelectItem key={String(cat)} value={String(cat)}>
                      {String(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Media Type</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={mediaType === "image" ? "default" : "outline"}
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => setMediaType("image")}
                  disabled={isLoading}
                  aria-label="Select image media type"
                  aria-pressed={mediaType === "image"}
                >
                  <Image className="h-4 w-4" aria-hidden="true" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant={mediaType === "video" ? "default" : "outline"}
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => setMediaType("video")}
                  disabled={isLoading}
                  aria-label="Select video media type"
                  aria-pressed={mediaType === "video"}
                >
                  <Video className="h-4 w-4" aria-hidden="true" />
                  Video
                </Button>
              </div>
            </div>
            
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <Upload className="h-8 w-8 mb-2 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium mb-1">
                Drag & drop your {mediaType} here
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supports: {mediaType === "image" ? "JPG, PNG, GIF (max 10MB)" : "MP4, MOV (max 100MB)"}
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                disabled={isLoading}
                aria-label={`Select ${mediaType} file`}
              >
                Select {mediaType}
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full skill-gradient hover:opacity-90 transition-opacity"
              disabled={isLoading}
              aria-label="Create post"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Post...
                </span>
              ) : (
                "Create Post"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Create;
