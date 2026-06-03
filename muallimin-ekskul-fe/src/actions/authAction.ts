"use server";

import { createSession, logout } from "../lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function loginAction(prevState: unknown, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username dan password wajib diisi!" };
  }

  let targetUrl = "";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    
    const response = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { error: result.message || "Login gagal, periksa kredensial." };
    }

    const token = result.data.token;
    const role = result.data.user.role;
    const name = result.data.user.name;
    const uname = result.data.user.username;

    const cookieStore = await cookies();
    cookieStore.set("user_name", name, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
    cookieStore.set("user_username", uname, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });
    
    await createSession(token, role);

    if (role === "ADMIN") {
      targetUrl = "/admin/dashboard";
    } else if (role === "MENTOR") {
      targetUrl = "/mentor/dashboard";
    } else if (role === "wali") {
      targetUrl = "/wali/dashboard";
    }

  } catch (error) {
    console.error("Fetch error:", error);
    return { error: "Server Backend sedang bermasalah." };
  }

  if (targetUrl) {
    redirect(targetUrl);
  }
}

export async function logoutAction() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (token && apiUrl) {
      await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
    }
  } catch (error) {
    console.error("Gagal memanggil API logout backend", error);
  }

  const cookieStore = await cookies();
  cookieStore.delete("user_name");
  cookieStore.delete("user_username");
  
  await logout(); 
}