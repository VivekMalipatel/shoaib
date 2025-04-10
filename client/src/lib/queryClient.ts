import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Base URL for the Flask API - match the one in flaskApi.ts
const API_BASE_URL = window.location.protocol + '//' + window.location.host + '/api';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Ensure the URL is properly formatted with the API base URL
  const fullUrl = url.startsWith('/api') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle both relative and absolute URLs
    const url = typeof queryKey[0] === 'string' 
      ? (queryKey[0].startsWith('/api') 
          ? queryKey[0] 
          : `${API_BASE_URL}${(queryKey[0] as string).startsWith('/') ? queryKey[0] : '/' + queryKey[0]}`)
      : queryKey[0];
      
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
