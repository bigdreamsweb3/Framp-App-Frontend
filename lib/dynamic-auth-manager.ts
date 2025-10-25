import { getAuthToken } from "@dynamic-labs/sdk-react-core";

export const fetchAndStoreToken = () => {
  const token = getAuthToken();
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
  return token;
};

// Note: Dynamic context functions must be called from React components
// Use useDynamicContext() directly in your components instead
