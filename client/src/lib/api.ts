// lib/api.ts

// Define options that can include headers
interface RequestOptions {
  headers?: Record<string, string>; // Allow passing custom headers
  // Add other fetch options if needed in the future (mode, cache, etc.)
}


export async function apiRequest<T>(
  method: string,
  url: string,
  data?: unknown | undefined,
  options: RequestOptions = {} // Accept optional options, including headers
): Promise<T> {
  // Merge default headers (like Content-Type for data) with provided headers
  const defaultHeaders = data ? { 'Content-Type': 'application/json' } : {};
  const headers = { ...defaultHeaders, ...options.headers }; // Merge headers

  const res = await fetch(url, {
    method,
    headers, // Use the merged headers
    body: data ? JSON.stringify(data) : undefined,
    // credentials: 'include', // Remove this, not typically needed with JWT in Auth header
  });

  if (!res.ok) {
    // Attempt to parse JSON error response first
   let errorData = { message: res.statusText || 'API request failed' };
   try {
       errorData = await res.json();
   } catch (e) {
       // If JSON parsing fails, fall back to text or status
       const text = await res.text();
       errorData.message = text || res.statusText || 'Unknown API error';
   }

   // Include status in the error message for better debugging
   const error = new Error(`${res.status}: ${errorData.message}`) as any;
   error.status = res.status; // Attach status to error object
   error.data = errorData; // Attach error response body
   throw error;
  }

  return await res.json();
}

export async function uploadFile<T>(
  url: string,
  formData: FormData,
  options: RequestOptions = {} // Accept optional options, including headers
): Promise<T> {
  // Headers are provided in options. Note: Do NOT set Content-Type manually for FormData.
  const headers = options.headers;

  const res = await fetch(url, {
    method: 'POST',
    headers, // Use the provided headers
    body: formData,
    // credentials: 'include', // Remove this
  });

  if (!res.ok) {
    // Attempt to parse JSON error response first
   let errorData = { message: res.statusText || 'File upload failed' };
   try {
       errorData = await res.json();
   } catch (e) {
        const text = await res.text();
       errorData.message = text || res.statusText || 'Unknown upload error';
   }

   const error = new Error(`${res.status}: ${errorData.message}`) as any;
   error.status = res.status;
   error.data = errorData;
   throw error;
  }

  return await res.json();
}