import { getAuthToken } from "@dynamic-labs/sdk-react-core";

// Helper function to get headers with authorization
export const getHeaders = (): HeadersInit => {
  // Use Dynamic Labs token instead of localStorage
  const accessToken = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
  };

  // Add authorization header if accessToken exists
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};