import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Menyimpan token dari Laravel
export async function createSession(token: string, role: string) {
  const cookieStore = await cookies();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 Hari

  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });

  cookieStore.set("user_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value;
}

export async function getRole() {
  const cookieStore = await cookies();
  return cookieStore.get("user_role")?.value;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  cookieStore.delete("user_role");
  redirect("/login");
}