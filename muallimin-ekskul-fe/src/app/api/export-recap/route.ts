import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as XLSX from "xlsx"

interface RecapSummary {
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  total_meetings: number;
}

interface RecapData {
  student_name: string;
  student_class: string;
  summary: RecapSummary;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const exculId = searchParams.get("exculId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const cookieStore = await cookies()
  const token = cookieStore.get("session_token")?.value
  const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL

  if (!token || !apiUrl || !exculId || !startDate || !endDate) {
    return NextResponse.json({ error: "Parameter tidak lengkap atau belum login" }, { status: 400 })
  }

  try {
    const url = `${apiUrl}/admin/attendances/recap?excul_id=${exculId}&start_date=${startDate}&end_date=${endDate}`
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.message || "Gagal fetch data")

    const dataList: RecapData[] = result.data
    
    const formattedData = dataList.map((item, index) => ({
      "No": index + 1,
      "Nama Siswa": item.student_name,
      "Kelas": item.student_class,
      "Total Pertemuan": item.summary.total_meetings,
      "Hadir (H)": item.summary.hadir,
      "Izin (I)": item.summary.izin,
      "Sakit (S)": item.summary.sakit,
      "Alpha (A)": item.summary.alpha
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Presensi")

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="Rekap_Presensi_${startDate}_sd_${endDate}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat file Excel" }, { status: 500 })
  }
}