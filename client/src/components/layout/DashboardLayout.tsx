import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useUser } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect is handled in App.tsx or page level, but defensive here
  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar className="w-64 hidden md:flex shrink-0 z-20" />
      
      <main className="flex-1 overflow-auto relative">
        {/* Mobile Header could go here */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
