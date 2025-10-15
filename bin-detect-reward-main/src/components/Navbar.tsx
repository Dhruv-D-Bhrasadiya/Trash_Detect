import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Leaf, LayoutDashboard, History, Gift, LogOut, User } from "lucide-react";

const Navbar = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
              <div className="bg-primary/10 p-2 rounded-full">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <span className="hidden sm:inline">EcoDetect</span>
            </Link>
            
            <div className="flex items-center gap-1">
              <Link to="/dashboard">
                <Button
                  variant={isActive("/dashboard") ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link to="/history">
                <Button
                  variant={isActive("/history") ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <Link to="/rewards">
                <Button
                  variant={isActive("/rewards") ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Gift className="h-4 w-4" />
                  <span className="hidden sm:inline">Rewards</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:inline text-sm text-muted-foreground max-w-[220px] truncate">{user?.email}</span>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
