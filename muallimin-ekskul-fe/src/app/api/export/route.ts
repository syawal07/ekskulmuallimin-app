import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date');
  const exculId = searchParams.get('exculId');

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

  if (!token || !date || !exculId) {
    return NextResponse.json({ error: "Akses ditolak atau parameter tidak lengkap" }, { status: 400 });
  }

  try {
    const res = await fetch(`${apiUrl}/admin/attendances/export?date=${date}&excul_id=${exculId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Gagal mengambil file Excel dari server.");

    const blob = await res.blob();
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="Rekap_Presensi_${date}.xlsx"`);

    return new NextResponse(blob, { status: 200, statusText: "OK", headers });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}