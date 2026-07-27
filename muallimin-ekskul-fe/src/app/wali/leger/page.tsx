import { cookies } from "next/headers"
import LegerClient from "./leger-client"

export const dynamic = "force-dynamic"

async function getLegerData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { error: "Sesi Anda telah berakhir, silakan login ulang." };

  try {
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    };

    const response = await fetch(`${apiUrl}/wali/leger`, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      return { error: "Gagal memuat API dari Server." };
    }

    const json = await response.json();
    return json.data || { error: "Struktur data tidak valid." };

  } catch (error) {
    return { error: "Koneksi ke Server terputus. Pastikan Backend berjalan." };
  }
}

export default async function WaliLegerPage() {
  const data = await getLegerData();

  if (!data || data.error) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto mt-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-red-500/5 backdrop-blur-xl text-red-900 p-8 rounded-[3rem] border-2 border-red-500/20 shadow-sm relative overflow-hidden">
          <p className="font-semibold text-red-800/90 leading-relaxed">{data?.error || "Gagal memuat data dari server."}</p>
        </div>
      </div>
    );
  }

  return <LegerClient data={data} />
}