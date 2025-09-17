export async function logout() {
  const res = await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
}
