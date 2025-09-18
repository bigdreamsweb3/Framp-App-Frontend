// File: lib\api\auth\me.ts

// const API_BASE =
//   process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

// File: lib/api/auth/me.ts
export async function getCurrentUser(accessToken?: string) {
  console.log("📡 Calling /api/auth/me...");
  const headers: Record<string, string> = {
    "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  console.log("📡 Response status:", res.status);

  if (!res.ok) throw new Error((await res.json()).error || "Unauthorized");

  const data = await res.json();
  console.log("✅ Response JSON:", data);
  return data; // { user }
}
