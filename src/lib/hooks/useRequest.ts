import useSWR, { type SWRConfiguration, type SWRResponse } from "swr";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import qs from "qs";
import { api } from "@/lib/axios";
import type { ApiError } from "@/lib/api/client";

export type GetRequest = AxiosRequestConfig | null;

interface Return<Data>
  extends Pick<SWRResponse<AxiosResponse, ApiError>, "isValidating" | "isLoading" | "mutate"> {
  data: Data | undefined;
  meta: Record<string, unknown> | undefined;
  response: AxiosResponse | undefined;
  error: ApiError | undefined;
}

export interface Config<Data> extends Omit<SWRConfiguration<AxiosResponse, ApiError>, "fallbackData"> {
  fallbackData?: Data;
}

function keyOf(request: GetRequest): string | null {
  if (!request) return null;
  const query = request.params ? `?${qs.stringify(request.params)}` : "";
  return `${request.method ?? "GET"} ${request.url}${query}`;
}

function unwrap<Data>(body: unknown): {
  data: Data | undefined;
  meta: Record<string, unknown> | undefined;
} {
  if (body && typeof body === "object" && "data" in body) {
    const { data, ...rest } = body as { data: Data } & Record<string, unknown>;
    return { data, meta: Object.keys(rest).length ? rest : undefined };
  }
  return { data: body as Data, meta: undefined };
}

export function useRequest<Data = unknown>(
  request: GetRequest,
  { fallbackData, ...config }: Config<Data> = {},
): Return<Data> {
  const swr = useSWR<AxiosResponse, ApiError>(
    keyOf(request),
    request ? () => api.request(request) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      ...config,
      fallbackData:
        fallbackData !== undefined
          ? ({
              status: 200,
              statusText: "InitialData",
              config: request ?? {},
              headers: {},
              data: { data: fallbackData },
            } as AxiosResponse)
          : undefined,
    },
  );

  const { data, meta } = unwrap<Data>(swr.data?.data);

  return {
    data,
    meta,
    response: swr.data,
    error: swr.error,
    isValidating: swr.isValidating,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
}
