'use server'

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function updateCompanyProfile(formData: FormData) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Sesi habis, silakan login ulang." }

  const filesToCheck = ["logo", "heroImage", "loginImage"];
  filesToCheck.forEach(field => {
      const file = formData.get(field) as File | null;
      if (!file || file.size === 0) {
          formData.delete(field);
      }
  });

  formData.append("_method", "PUT");

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BACKEND_URL;
    
    const res = await fetch(`${apiUrl}/admin/company-profile`, {
      method: "POST", 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal menyimpan perubahan profil." }
    }

    revalidatePath("/admin/sekolah")
    revalidatePath("/") 
    revalidatePath("/login")
    
    return { success: true }

  } catch (error) {
    return { error: "Terjadi kesalahan server saat menghubungi API." }
  }
}