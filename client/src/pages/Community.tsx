import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRooms, useMessages, useSendMessage } from "@/hooks/use-community";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, Hash, Send, AlertCircle } from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function CommunityPage() {
  const { data: rooms } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Default to first room if available
  useEffect(() => {
    if (rooms && rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms]);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {/* Rooms Sidebar */}
        <div className="w-64 bg-secondary/20 border-r border-border flex flex-col">
          <div className="p-6 border-b border-border/50">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Community
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {rooms?.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3",
                  selectedRoomId === room.id 
                    ? "bg-white shadow-sm border border-border font-medium text-primary" 
                    : "hover:bg-white/50 text-muted-foreground"
                )}
              >
                <Hash className="w-4 h-4 opacity-50" />
                <span>{room.name}</span>
              </button>
            ))}
            
            {(!rooms || rooms.length === 0) && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No rooms available.
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedRoomId ? (
            <ChatRoom roomId={selectedRoomId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a room to start chatting
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ChatRoom({ roomId }: { roomId: number }) {
  const { data: messages } = useMessages(roomId);
  const { mutate: sendMessage, isPending, error } = useSendMessage(roomId);
  const { data: user } = useUser();
  
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <>
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
        <div className="flex justify-center mb-8">
          <div className="bg-secondary/30 px-4 py-2 rounded-full text-xs text-muted-foreground font-medium">
            🔒 This is an anonymous safe space. Be kind.
          </div>
        </div>
        
        {messages?.map((msg) => {
          const isMe = msg.userId === user?.id;
          return (
            <div 
              key={msg.id} 
              className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
            >
              <div 
                className={cn(
                  "max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-secondary text-foreground rounded-tl-none"
                )}
              >
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                {format(new Date(msg.createdAt), "h:mm a")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-gray-50/50">
        {error && (
          <div className="mb-2 flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            <AlertCircle className="w-3 h-3" />
            {error.message}
          </div>
        )}
        
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
          <button 
            type="submit" 
            disabled={isPending || !input.trim()}
            className="bg-primary text-primary-foreground p-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
}
