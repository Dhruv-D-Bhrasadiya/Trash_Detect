import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

const History = () => {
  const [user, setUser] = useState<any>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchDetections(session.user.id);
      }
    });
  }, [navigate]);

  const fetchDetections = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("detections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching detections:", error);
    } else {
      setDetections(data || []);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Detection History</h1>
          <p className="text-muted-foreground">View all your past trash detections</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : detections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No detections yet. Upload your first image!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {detections.map((detection) => (
              <Card key={detection.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {format(new Date(detection.created_at), "MMM dd, yyyy")}
                    </CardTitle>
                    <Badge
                      variant={detection.points_earned > 0 ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {detection.points_earned > 0 ? "+" : ""}
                      {detection.points_earned} pts
                    </Badge>
                  </div>
                  <CardDescription>
                    {format(new Date(detection.created_at), "h:mm a")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Detected Items:</p>
                      <div className="flex flex-wrap gap-1">
                        {detection.detections && detection.detections.length > 0 ? (
                          detection.detections.map((item: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {item.label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs">No items detected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
