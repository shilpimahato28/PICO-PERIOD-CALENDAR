import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function usePredictions() {
  return useQuery({
    queryKey: [api.predictions.list.path],
    queryFn: async () => {
      const res = await fetch(api.predictions.list.path);
      if (!res.ok) throw new Error("Failed to fetch predictions");
      const raw = await res.json();
      return api.predictions.list.responses[200].parse(raw).map(p => ({
        ...p,
        predictedStartDate: new Date(p.predictedStartDate),
      }));
    },
  });
}

export function useGeneratePrediction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.predictions.generate.path, {
        method: api.predictions.generate.method,
      });
      if (!res.ok) throw new Error("Failed to generate prediction");
      return api.predictions.generate.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.predictions.list.path] });
    },
  });
}
