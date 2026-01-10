import { Link } from "wouter";
import { Flower2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6 text-primary animate-pulse">
        <Flower2 className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl font-display font-bold text-foreground mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn't find the page you were looking for. It might have been moved or deleted.
      </p>

      <Link href="/">
        <button className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
          Return Home
        </button>
      </Link>
    </div>
  );
}
