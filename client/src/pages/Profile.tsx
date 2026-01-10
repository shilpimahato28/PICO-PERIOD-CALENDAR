import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useUser } from "@/hooks/use-auth";
import { User, Settings, Heart } from "lucide-react";

export default function ProfilePage() {
  const { data: user } = useUser();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground">Your Profile</h1>
        </header>

        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-4xl font-display font-bold shadow-xl">
              {user?.name?.[0] || user?.username?.[0] || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground">@{user?.username}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-1">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Age</label>
              <div className="p-4 bg-secondary/30 rounded-xl font-medium text-lg">
                {user?.age || "Not set"} years old
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Cycle Length</label>
              <div className="p-4 bg-secondary/30 rounded-xl font-medium text-lg">
                {user?.cycleLength || 28} Days
              </div>
            </div>
            
            <div className="grid gap-1">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Health Preferences</label>
              <div className="p-4 bg-secondary/30 rounded-xl text-muted-foreground">
                {user?.healthPreferences || "No specific preferences set."}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 flex gap-4">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-border hover:border-primary hover:text-primary transition-all font-medium">
              <Settings className="w-4 h-4" />
              Edit Settings
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-border hover:border-primary hover:text-primary transition-all font-medium">
              <Heart className="w-4 h-4" />
              Health Data
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
