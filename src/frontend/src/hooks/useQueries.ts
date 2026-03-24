import { useMutation, useQuery } from "@tanstack/react-query";
import type { LocationEntry } from "../backend";
import { useActor } from "./useActor";

export function useGetEntries(token: string) {
  const { actor, isFetching } = useActor();
  return useQuery<LocationEntry[]>({
    queryKey: ["entries", token],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEntries(token);
    },
    enabled: !!actor && !isFetching && !!token,
    refetchInterval: 10000,
  });
}

export function useCreateRequest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ token, label }: { token: string; label: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.createRequest(token, label);
    },
  });
}

export function useSubmitLocation() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      token,
      name,
      lat,
      lng,
    }: {
      token: string;
      name: string;
      lat: number;
      lng: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitLocation(token, name, lat, lng);
    },
  });
}
