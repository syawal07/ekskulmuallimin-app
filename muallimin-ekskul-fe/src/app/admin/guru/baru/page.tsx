import GuruFormClient from "@/components/admin/guru-form-client"
import { getToken } from "@/lib/session"

export const dynamic = "force-dynamic"

interface Excul {
  id: string;
  name: string;
}

async function getExculs(): Promise<Excul[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
    const token = await getToken();
    if (!apiUrl || !token) return [];

    const res = await fetch(`${apiUrl}/admin/exculs`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
      cache: 'no-store'
    });
    
    if (!res.ok) return [];
    const result = await res.json();
    return result.data as Excul[];
  } catch (e) {
    return [];
  }
}

export default async function AddGuruPage() {
  const exculs = await getExculs()

  return <GuruFormClient exculs={exculs} />
}