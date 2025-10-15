import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Award, Loader2, Gift } from "lucide-react";

const Rewards = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getRewardImageBase = (title: string | undefined): string | null => {
    if (!title) return null;
    const t = title.toLowerCase();
    if (t.includes("notebook")) return "/images/notebook";
    if (t.includes("tote") || t.includes("bag")) return "/images/Bag";
    if (t.includes("utensil") || t.includes("cutlery") || t.includes("bamboo")) return "/images/utensil";
    if (t.includes("plant") || t.includes("tree")) return "/images/plant tree";
    if (t.includes("power") || t.includes("solar")) return "/images/power bank";
    return null;
  };

  const buildCandidateList = (reward: any): string[] => {
    const explicit = typeof reward.image_url === 'string' && reward.image_url.trim().length > 0 ? reward.image_url : null;
    const base = getRewardImageBase(reward.title);
    const candidates: string[] = [];
    if (explicit) candidates.push(explicit);
    if (base) {
      candidates.push(`${base}.png`, `${base}.jpg`, `${base}.jpeg`, `${base}.webp`);
    }
    candidates.push('/placeholder.svg');
    return candidates;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    });
  }, [navigate]);

  const fetchData = async (userId: string) => {
    setLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) setProfile(profileData);

    // Fetch rewards
    const { data: rewardsData } = await supabase.from("rewards").select("*").eq("available", true);

    if (rewardsData) setRewards(rewardsData);

    // Fetch redeemed rewards
    const { data: redeemedData } = await supabase
      .from("user_rewards")
      .select("*, rewards(*)")
      .eq("user_id", userId)
      .order("redeemed_at", { ascending: false });

    if (redeemedData) setRedeemedRewards(redeemedData);

    setLoading(false);
  };

  const handleRedeem = async (reward: any) => {
    setRedeeming(reward.id);

    try {
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_reward_id: reward.id
      });

      if (error) throw error;

      toast({
        title: "Reward Redeemed! 🎉",
        description: `You've successfully redeemed ${reward.title}`,
      });

      // Refresh data
      await fetchData(user.id);
    } catch (error: any) {
      toast({
        title: "Redemption Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
      <Navbar user={user} />

      {/* Decorative animated blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-primary to-secondary anim-blob" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-secondary to-primary anim-blob" style={{ animationDelay: '1s' }} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 anim-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground mb-2">Rewards</h1>
          <p className="text-muted-foreground">Redeem your points for eco-friendly rewards</p>
        </div>

        <Card className="mb-8 bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6 text-accent" />
              Your Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-accent">{profile?.points || 0}</p>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Available Rewards</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <Card key={reward.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{reward.title}</CardTitle>
                        <CardDescription>{reward.description}</CardDescription>
                      </div>
                      <Gift className="h-8 w-8 text-primary flex-shrink-0 ml-2 anim-float-slow" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-muted">
                      {(() => {
                        const candidates = buildCandidateList(reward);
                        return (
                          <img
                            src={candidates[0]}
                            data-idx="0"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              const currentIdx = parseInt(target.getAttribute('data-idx') || '0', 10);
                              const nextIdx = currentIdx + 1;
                              if (nextIdx < candidates.length) {
                                target.setAttribute('data-idx', String(nextIdx));
                                target.src = candidates[nextIdx];
                              }
                            }}
                            alt={reward.title}
                            className="w-full h-full object-cover"
                          />
                        );
                      })()}
                    </div>
                    <Badge className="text-base px-3 py-1">
                      {reward.points_required} points
                    </Badge>
                    <Button
                      onClick={() => handleRedeem(reward)}
                      disabled={
                        profile?.points < reward.points_required ||
                        redeeming === reward.id
                      }
                      className="w-full"
                    >
                      {redeeming === reward.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redeeming...
                        </>
                      ) : profile?.points < reward.points_required ? (
                        "Not Enough Points"
                      ) : (
                        "Redeem"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {redeemedRewards.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Redeemed Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {redeemedRewards.map((item) => (
                <Card key={item.id} className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.rewards.title}</CardTitle>
                    <CardDescription>
                      Redeemed on {new Date(item.redeemed_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Rewards;
