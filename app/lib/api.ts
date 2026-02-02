const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

function buildApiUrl(endpoint: string): string {
  if (API_BASE_URL) return `${API_BASE_URL}${endpoint}`;
  return `/api${endpoint}`;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      return {
        success: false,
        error: error.error || `HTTP ${response.status}`,
        errors: error.errors,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getHome() {
  return apiCall("/home");
}

export async function getSpeakers() {
  return apiCall("/speakers");
}

export async function getEvents() {
  return apiCall("/events");
}

export async function getSponsors() {
  return apiCall("/sponsors");
}

export async function getFile(fileId: string) {
  return apiCall(`/files/${fileId}`);
}

export async function submitRegistration(formData: FormData) {
  try {
    const url = buildApiUrl("/register");
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      return {
        success: false,
        error: error.error || `HTTP ${response.status}`,
        errors: error.errors,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
