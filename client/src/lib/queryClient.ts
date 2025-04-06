import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const errorJson = await res.json().catch(() => null);
      
      if (errorJson) {
        console.error("API Error Response:", {
          status: res.status,
          statusText: res.statusText,
          body: JSON.stringify(errorJson)
        });
        
        // Return a more user-friendly error message
        const message = errorJson.message || errorJson.error || `${res.status}: ${res.statusText}`;
        throw new Error(message);
      } else {
        // Fall back to text if not JSON
        const text = await res.text().catch(() => res.statusText);
        console.error("API Error Response:", {
          status: res.status,
          statusText: res.statusText,
          body: text
        });
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        throw e; // Re-throw the structured error we created above
      }
      
      // Last resort fallback if both JSON and text parsing fail
      console.error("Failed to parse error response:", e);
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

// Helper to determine if we need to use a full URL with hostname in production
const getApiUrl = (endpoint: string): string => {
  // If already a full URL, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // For Vercel production, we can use relative URLs as routes are handled by Vercel's rewrites
  // as defined in vercel.json. This works across domains and environments.
  return endpoint;
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const apiUrl = getApiUrl(url);
  
  console.log(`Making ${method} request to ${apiUrl}`);
  
  // Create an AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const res = await fetch(apiUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "Accept": "application/json",
        "Cache-Control": "no-cache"
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
      cache: "no-store"
    });
    
    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle AbortError for timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    // Re-throw the original error
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const apiUrl = getApiUrl(queryKey[0] as string);
    console.log(`Making GET request to ${apiUrl}`);
    
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        },
        credentials: "include",
        signal: controller.signal,
        cache: "no-store"
      });
      
      clearTimeout(timeoutId);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Received 401 from ${apiUrl}, returning null as requested`);
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle AbortError for timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      // Re-throw the original error
      throw error;
    }
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
