// const API_BASE =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

export async function getCurrentUser(accessToken?: string) {
  const headers: Record<string, string> = {
    "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).error || "Unauthorized");
  return res.json(); // { user }
}
