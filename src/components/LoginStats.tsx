import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LoginStatsData {
  today: {
    date: string;
    logins: number;
  };
  totalRegisteredUsers: number;
  lastUpdated: string;
}

const LoginStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<LoginStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-login-stats`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching login stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user || loading) return null;

  return (
    <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Logins</p>
                <p className="font-semibold text-foreground">
                  {stats?.today.logins ?? 0}
                </p>
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Users</p>
                <p className="font-semibold text-foreground">
                  {stats?.totalRegisteredUsers ?? 0}
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Admin View
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginStats;
