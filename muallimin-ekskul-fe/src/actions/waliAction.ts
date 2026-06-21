'use server'

import { cookies } from "next/headers"

export async function fetchWaliDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Sesi habis, silakan login ulang." }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/wali/dashboard`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal mengambil data dashboard." }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return { error: "Terjadi gangguan koneksi ke server backend." }
  }
}

export async function fetchWaliAttendances() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Sesi habis, silakan login ulang." }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/wali/attendances`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal mengambil riwayat presensi." }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return { error: "Terjadi gangguan koneksi ke server backend." }
  }
}

export async function fetchWaliAssessments() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value

  if (!token) return { error: "Sesi habis, silakan login ulang." }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const res = await fetch(`${apiUrl}/wali/assessments`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Gagal mengambil transkrip nilai." }
    }

    return { success: true, data: result.data }
  } catch (error) {
    return { error: "Terjadi gangguan koneksi ke server backend." }
  }
}