import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertPeriodLog } from "@shared/routes";
import { format } from "date-fns";

// Hook to fetch logs
export function useLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      const res = await fetch(api.logs.list.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      // Need to parse dates because JSON returns strings
      const raw = await res.json();
      return api.logs.list.responses[200].parse(raw).map(log => ({
        ...log,
        startDate: new Date(log.startDate), // Convert string to Date
        endDate: log.endDate ? new Date(log.endDate) : null,
      }));
    },
  });
}

// Hook to create a log
export function useCreateLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertPeriodLog, 'userId'>) => {
      // Format dates to strings YYYY-MM-DD for API if they are Date objects
      // Zod schema might expect strings for dates
      const payload = {
        ...data,
        startDate: typeof data.startDate === 'object' ? format(data.startDate, 'yyyy-MM-dd') : data.startDate,
        endDate: data.endDate && typeof data.endDate === 'object' ? format(data.endDate, 'yyyy-MM-dd') : data.endDate,
      };

      const res = await fetch(api.logs.create.path, {
        method: api.logs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create log");
      return api.logs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
      // Also invalidate predictions as new data changes them
      queryClient.invalidateQueries({ queryKey: [api.predictions.list.path] });
    },
  });
}

export function useDeleteLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.logs.delete.path, { id });
      const res = await fetch(url, { method: api.logs.delete.method });
      if (!res.ok) throw new Error("Failed to delete log");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.logs.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.predictions.list.path] });
    },
  });
}
