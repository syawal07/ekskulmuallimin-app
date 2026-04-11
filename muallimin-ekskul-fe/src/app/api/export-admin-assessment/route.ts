import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const exculId = searchParams.get('exculId');

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;

  if (!token || !exculId) return NextResponse.json({ error: "Akses ditolak" }, { status: 400 });

  try {
    const res = await fetch(`${apiUrl}/admin/assessments/export?excul_id=${exculId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Gagal mengambil file Excel.");

    const blob = await res.blob();
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="Laporan_Nilai.xlsx"`);

    return new NextResponse(blob, { status: 200, statusText: "OK", headers });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}