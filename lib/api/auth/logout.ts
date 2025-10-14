const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";


export async function logout() {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    headers: {
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    // non-JSON response
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || data?.message || `Logout failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}
