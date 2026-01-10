import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useRooms() {
  return useQuery({
    queryKey: [api.rooms.list.path],
    queryFn: async () => {
      const res = await fetch(api.rooms.list.path);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return api.rooms.list.responses[200].parse(await res.json());
    },
  });
}

export function useMessages(roomId: number) {
  return useQuery({
    queryKey: [api.rooms.messages.list.path, roomId],
    queryFn: async () => {
      const url = buildUrl(api.rooms.messages.list.path, { roomId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return api.rooms.messages.list.responses[200].parse(await res.json());
    },
    // Poll every 5 seconds for new messages
    refetchInterval: 5000,
  });
}

export function useSendMessage(roomId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const url = buildUrl(api.rooms.messages.create.path, { roomId });
      const res = await fetch(url, {
        method: api.rooms.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      if (!res.ok) {
        if (res.status === 400) throw new Error("Rate limit exceeded");
        throw new Error("Failed to send message");
      }
      
      return api.rooms.messages.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.rooms.messages.list.path, roomId] });
    },
  });
}
