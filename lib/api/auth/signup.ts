export async function signup(email: string, password: string, name?: string, wallet_address?: string) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
    },
    body: JSON.stringify({ email, password, name, wallet_address }),
    credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).error || "Signup failed");
  return res.json(); // { message, user, auth? }
}
