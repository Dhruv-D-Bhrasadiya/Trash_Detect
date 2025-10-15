import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, Award, Trophy, Star, Shield, Leaf, Clock, Activity } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getCurrentAchievement, getNextAchievement, getProgressToNextAchievement } from "@/lib/achievements";
import { recentActivities, formatRelativeTime } from "@/lib/activity";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      // Convert image to base64 for detection
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result as string;
        await detectTrash(base64String);
      };
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const detectTrash = async (imageBase64: string) => {
    setDetecting(true);

    try {
      const { data, error } = await supabase.functions.invoke("detect-trash", {
        body: { imageBase64 },
      });

      if (error) throw error;

      const { detections, summary, points, labels } = data;

      // Save detection to database without hash
      const { error: insertError } = await supabase.from("detections").insert({
        user_id: user.id,
        image_url: imageBase64,
        detections: detections,
        points_earned: points,
      });

      if (insertError) throw insertError;

      // Update user points
      await supabase.rpc("update_user_points", {
        p_user_id: user.id,
        p_points: points,
      });

      // Refresh profile
      await fetchProfile(user.id);

      toast({
        title: points > 0 ? "Success! 🎉" : "Detection Complete",
        description: summary,
        variant: points > 0 ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Detection Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setDetecting(false);
      setPreviewUrl(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
      <Navbar user={user} />
      {/* Enhanced decorative animated blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-primary to-secondary animate-pulse-slow" />
      <div className="pointer-events-none absolute top-1/4 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-accent to-primary animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-secondary to-primary animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="pointer-events-none absolute bottom-1/3 -left-12 w-56 h-56 rounded-full blur-3xl opacity-20 bg-gradient-to-tl from-accent/70 to-secondary/70 animate-float-slow" style={{ animationDelay: '3s' }} />
      <div className="pointer-events-none absolute left-1/2 bottom-1/4 h-64 w-64 rounded-full blur-3xl opacity-20 bg-primary/10 animate-pulse-slow" style={{ animationDelay: '3000ms' }} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-5xl font-bold text-foreground mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Dashboard</h1>
              <p className="text-muted-foreground text-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>Upload images to detect trash and earn points!</p>
            </div>
            {/* email shown in top Navbar only */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Award className="h-6 w-6 animate-pulse-slow" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-6xl font-bold animate-count-up">{profile?.points || 0}</p>
              <p className="text-xs mt-2 text-primary-foreground/80">Keep collecting to earn rewards!</p>
            </CardContent>
          </Card>

          <Card className="border border-accent/20 bg-gradient-to-br from-background to-accent/5 hover:shadow-lg hover:shadow-accent/10 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-accent-foreground">
                <Activity className="h-5 w-5 text-accent animate-pulse-slow" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-2 rounded-lg bg-accent/5 hover:bg-accent/10 transition-all duration-300 animate-fade-in-up" 
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-lg animate-bounce-slow" style={{ animationDelay: `${index * 200}ms` }}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground animate-pulse-slow">{formatRelativeTime(activity.timestamp)}</p>
                        {activity.points && (
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${activity.points > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} animate-fade-in`}>
                            {activity.points > 0 ? `+${activity.points}` : activity.points} points
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-secondary/20 bg-gradient-to-br from-background to-secondary/5 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-secondary-foreground">
                <Trophy className="h-5 w-5 text-secondary animate-bounce-slow" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile?.points !== undefined && (
                <div className="flex flex-col gap-2">
                  {/* Current Achievement */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-xl">
                      {getCurrentAchievement(profile.points).icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-foreground animate-fade-in">
                        {getCurrentAchievement(profile.points).title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {getCurrentAchievement(profile.points).description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress to next achievement */}
                  {getNextAchievement(profile.points) && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress to next rank</span>
                        <span className="font-medium">{getProgressToNextAchievement(profile.points)}%</span>
                      </div>
                      <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary animate-pulse-slow" 
                          style={{ width: `${getProgressToNextAchievement(profile.points)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1 text-muted-foreground">
                        Next: {getNextAchievement(profile.points)?.title} at {getNextAchievement(profile.points)?.pointThreshold} points
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto animate-fade-in-up border-accent/30 shadow-lg hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-background to-muted/30" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="border-b border-border/30">
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary animate-pulse-slow"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
              Upload Image for Detection
            </CardTitle>
            <CardDescription className="text-muted-foreground/90">
              Upload an image containing trash and bins to earn points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {previewUrl && (
              <div className="relative rounded-lg overflow-hidden shadow-2xl animate-fade-in">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-lg max-h-96 object-contain transition-all duration-500 will-change-transform hover:scale-[1.03]"
                />
                {detecting && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 text-white animate-spin" />
                      <div className="absolute inset-0 h-16 w-16 rounded-full border-t-2 border-white/20 animate-ping"></div>
                    </div>
                    <p className="text-white absolute mt-24 animate-pulse">Analyzing image...</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 border-border/70 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="relative">
                    <Upload className="w-16 h-16 mb-4 text-primary/80 group-hover:text-primary transition-all duration-300 animate-float-slow" />
                    <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 -z-10 animate-pulse-slow"></div>
                  </div>
                  <p className="mb-2 text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-300">PNG, JPG or WEBP</p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading || detecting}
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
