import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useData } from "../contexts/DataContext";
import CategoryList from "../components/feed/CategoryList";
import PostCard from "../components/feed/PostCard";
import ChallengeCard from "../components/feed/ChallengeCard";
import BattleCard from "../components/feed/BattleCard";
import SkillRoomCard from "../components/feed/SkillRoomCard";
import { Search as SearchIcon } from "lucide-react";

// Define SkillCategory type
type SkillCategory = string;

const Discover = () => {
  const { posts, challenges, battles, skillRooms } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "All">("All");
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter content based on search query and selected category
  const filterContent = (items: any[], key: string = "title") => {
    return items.filter(item => {
      const matchesSearch = !searchQuery || 
        item[key]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || 
        item.skillCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };
  
  const filteredPosts = filterContent(posts);
  const filteredChallenges = filterContent(challenges);
  const filteredBattles = filterContent(battles);
  const filteredRooms = filterContent(skillRooms);

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
          <Input
            placeholder="Search for skills, people, or content..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search content"
          />
        </div>
        
        <CategoryList 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          <TabsTrigger value="challenges" className="flex-1">Challenges</TabsTrigger>
          <TabsTrigger value="battles" className="flex-1">Battles</TabsTrigger>
          <TabsTrigger value="rooms" className="flex-1">Rooms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {searchQuery || selectedCategory !== "All" ? (
            <>
              {filteredPosts.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-bold text-lg px-4 mb-3">Posts</h2>
                  {filteredPosts.slice(0, 2).map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {filteredPosts.length > 2 && (
                    <Button 
                      variant="link" 
                      className="text-skill-purple mx-auto block"
                      onClick={() => setActiveTab("posts")}
                      aria-label={`View all ${filteredPosts.length} posts`}
                    >
                      View all {filteredPosts.length} posts
                    </Button>
                  )}
                </div>
              )}
              
              {filteredChallenges.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-bold text-lg px-4 mb-3">Challenges</h2>
                  <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                    {filteredChallenges.map(challenge => (
                      <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                  </div>
                </div>
              )}
              
              {filteredBattles.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-bold text-lg px-4 mb-3">Battles</h2>
                  <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                    {filteredBattles.map(battle => (
                      <BattleCard key={battle.id} battle={battle} />
                    ))}
                  </div>
                </div>
              )}
              
              {filteredRooms.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-bold text-lg px-4 mb-3">Skill Rooms</h2>
                  <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                    {filteredRooms.map(room => (
                      <SkillRoomCard key={room.id} room={room} />
                    ))}
                  </div>
                </div>
              )}
              
              {filteredPosts.length === 0 && filteredChallenges.length === 0 && 
               filteredBattles.length === 0 && filteredRooms.length === 0 && (
                <Card className="mx-4">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-2">No results found</p>
                    <p className="text-sm">Try adjusting your search or category filter</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-bold text-lg px-4 mb-3">Trending Posts</h2>
                {posts.slice(0, 3).map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              
              <div className="mb-6">
                <h2 className="font-bold text-lg px-4 mb-3">Popular Challenges</h2>
                <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                  {challenges.map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="font-bold text-lg px-4 mb-3">Active Battles</h2>
                <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                  {battles.map(battle => (
                    <BattleCard key={battle.id} battle={battle} />
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="font-bold text-lg px-4 mb-3">Live Skill Rooms</h2>
                <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                  {skillRooms.map(room => (
                    <SkillRoomCard key={room.id} room={room} />
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="posts">
          <h2 className="font-bold text-lg px-4 mb-3">Posts</h2>
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <Card className="mx-4">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No posts found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="challenges">
          <h2 className="font-bold text-lg px-4 mb-3">Challenges</h2>
          {filteredChallenges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4">
              {filteredChallenges.map(challenge => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <Card className="mx-4">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No challenges found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="battles">
          <h2 className="font-bold text-lg px-4 mb-3">Battles</h2>
          {filteredBattles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
              {filteredBattles.map(battle => (
                <BattleCard key={battle.id} battle={battle} />
              ))}
            </div>
          ) : (
            <Card className="mx-4">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No battles found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="rooms">
          <h2 className="font-bold text-lg px-4 mb-3">Skill Rooms</h2>
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
              {filteredRooms.map(room => (
                <SkillRoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <Card className="mx-4">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No skill rooms found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Discover;
