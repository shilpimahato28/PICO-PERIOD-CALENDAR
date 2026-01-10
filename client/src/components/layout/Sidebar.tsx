import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpen, 
  MessageCircle, 
  User, 
  LogOut,
  Flower2
} from "lucide-react";
import { useLogout } from "@/hooks/use-auth";

export function Sidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { mutate: logout } = useLogout();

  const links = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/calendar", icon: CalendarDays, label: "Calendar" },
    { href: "/articles", icon: BookOpen, label: "Wellness" },
    { href: "/community", icon: MessageCircle, label: "Community" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-card border-r border-border p-6", className)}>
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <Flower2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">PiCO</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <div 
                className={cn(
                  "nav-link cursor-pointer",
                  isActive && "active"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className="font-medium">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={() => logout()}
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-destructive hover:bg-destructive/10 mt-auto"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );
}
