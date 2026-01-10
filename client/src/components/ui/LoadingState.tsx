import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="w-full h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="font-medium">{message}</p>
    </div>
  );
}
