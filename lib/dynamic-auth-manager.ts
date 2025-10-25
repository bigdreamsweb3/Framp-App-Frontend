import { getAuthToken, useDynamicContext } from "@dynamic-labs/sdk-react-core";

export const fetchAndStoreToken = () => {
  const token = getAuthToken();
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
  return token;
};

export async function logoutDynamicUser() {
  // const { handleLogOut } = useDynamicContext();
  // await handleLogOut(); // ✅ actually execute logout

  localStorage.removeItem("authToken");
  return true;
}
