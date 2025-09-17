export async function getCurrentUser(accessToken?: string) {
  const headers: Record<string, string> = {
    "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch("/api/auth/me", {
    method: "GET",
    headers,
    credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).error || "Unauthorized");
  return res.json(); // { user }
}
