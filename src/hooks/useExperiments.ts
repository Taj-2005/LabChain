import useSWR from "swr";
import { useAuth } from "@/stores/useAuth";

interface Experiment {
  _id: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  protocol: Record<string, unknown>;
  status: "draft" | "active" | "completed" | "archived";
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface ExperimentsResponse {
  experiments: Experiment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const fetcher = async (url: string, token: string | null): Promise<unknown> => {
  if (!token) {
    throw new Error("No token");
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

export function useExperiments(
  page = 1,
  limit = 20,
  status?: string,
  ownerOnly = false
) {
  const { token } = useAuth();
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ownerOnly: ownerOnly.toString(),
  });
  if (status) {
    params.append("status", status);
  }

  const { data, error, isLoading, mutate } = useSWR<ExperimentsResponse>(
    token ? [`/api/experiments?${params.toString()}`, token] : null,
    ([url]) => fetcher(url, token) as Promise<ExperimentsResponse>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  return {
    experiments: data?.experiments || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

export function useExperiment(id: string | null) {
  const { token } = useAuth();
  const { data, error, isLoading, mutate } = useSWR<{ experiment: Experiment }>(
    token && id ? [`/api/experiments/${id}`, token] : null,
    ([url]) => fetcher(url, token) as Promise<{ experiment: Experiment }>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  return {
    experiment: data?.experiment,
    isLoading,
    error,
    mutate,
  };
}

export type { Experiment };
