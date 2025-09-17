const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";


export async function logout() {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: {
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
}
