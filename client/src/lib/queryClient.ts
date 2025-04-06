import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Store token in memory
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  // Also store in localStorage for persistence across page refreshes
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

export function getAuthToken(): string | null {
  // If token is not in memory, try to get it from localStorage
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  return authToken;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = res.statusText;
    try {
      const text = await res.text();
      errorText = text || res.statusText;
      console.error("API Error Response:", {
        status: res.status,
        statusText: res.statusText,
        body: text
      });
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }
    throw new Error(`${res.status}: ${errorText}`);
  }
}

// Helper to determine if we need to use a full URL with hostname in production
const getApiUrl = (endpoint: string): string => {
  // If already a full URL, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Add DEBUG logging to help diagnose issues
  console.log(`Environment: ${import.meta.env.MODE || 'unknown'}`);
  
  // For Vercel deployment, we use relative URLs since API is served from same domain
  // via Vercel's rewrites in vercel.json
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
  
  // Prepare headers with content type
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  
  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const res = await fetch(apiUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal
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
    
    // Prepare headers
    const headers: Record<string, string> = {};
    
    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    try {
      const res = await fetch(apiUrl, {
        credentials: "include",
        signal: controller.signal,
        headers
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
