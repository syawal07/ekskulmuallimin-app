'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"

export interface LegerRecord {
  id: string | number;
  nama_kegiatan: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  total_pertemuan: number;
  persentase: number;
}

export interface LegerData {
  tahun_pelajaran?: string;
  semester?: string;
  ekstra_wajib?: LegerRecord[];
  ekstra_pilihan?: LegerRecord[];
  perkaderan?: LegerRecord[];
}

export default function LegerClient({ data }: { data: LegerData }) {
  const ekstraWajib = data?.ekstra_wajib || [];
  const ekstraPilihan = data?.ekstra_pilihan || [];
  const perkaderan = data?.perkaderan || [];

  const allRecords = [...ekstraWajib, ...ekstraPilihan, ...perkaderan];
  
  const totalHadir = allRecords.reduce((acc, curr) => acc + curr.hadir, 0);
  const totalIzin = allRecords.reduce((acc, curr) => acc + curr.izin, 0);
  const totalSakit = allRecords.reduce((acc, curr) => acc + curr.sakit, 0);
  const totalAlpha = allRecords.reduce((acc, curr) => acc + curr.alpha, 0);
  const totalPertemuan = allRecords.reduce((acc, curr) => acc + curr.total_pertemuan, 0);

  const persentaseTotal = totalPertemuan > 0 ? Math.round((totalHadir / totalPertemuan) * 100) : 0;

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in duration-700 pb-16 pt-8 md:pt-10 px-4 md:px-0">
      
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden border-2 border-white/10">
        <div className="absolute top-0 right-0 w-[35rem] h-[35rem] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Leger Kesiswaan
            </h1>
            <p className="text-indigo-100/80 mt-4 font-medium text-base md:text-lg leading-relaxed">
              Rekapitulasi total persentase kehadiran putra/putri Anda dari seluruh kegiatan ekstrakurikuler dan perkaderan.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 px-8 py-6 rounded-[2rem] text-center min-w-[200px] shadow-sm">
            <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-widest mb-2">Tahun Pelajaran</p>
            <p className="font-black text-2xl tracking-tight text-white">{data?.tahun_pelajaran || "-"}</p>
            <p className="text-xs font-bold text-white mt-3 bg-indigo-500/50 inline-block px-4 py-1.5 rounded-xl">Semester {data?.semester || "-"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border-2 border-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-emerald-100/50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-4xl font-black text-slate-800 tracking-tighter">{totalHadir}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Total Hadir</span>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border-2 border-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-100/50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 border border-blue-100">
            <Clock className="w-6 h-6" />
          </div>
          <span className="text-4xl font-black text-slate-800 tracking-tighter">{totalIzin + totalSakit}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Izin & Sakit</span>
        </div>
        <div className="bg-white/60 backdrop-blur-xl border-2 border-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-rose-100/50 rounded-2xl flex items-center justify-center mb-4 text-rose-600 border border-rose-100">
            <XCircle className="w-6 h-6" />
          </div>
          <span className="text-4xl font-black text-slate-800 tracking-tighter">{totalAlpha}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Tanpa Keterangan</span>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-[2.5rem] shadow-lg flex flex-col items-center justify-center text-center text-white border-2 border-white/20">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-white border border-white/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <span className="text-4xl font-black tracking-tighter">{persentaseTotal}%</span>
          <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest mt-2">Rasio Kehadiran</span>
        </div>
      </div>

      <Card className="rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-3xl border-2 border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <CardHeader className="bg-transparent border-b-2 border-white/60 p-8 md:p-10">
          <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
            <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-100/50 border-2 border-white flex items-center justify-center shadow-sm">
              <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            </div>
            Tabel Rekapitulasi Presensi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b-2 border-slate-100 hover:bg-transparent">
                  <TableHead className="font-bold text-slate-500 uppercase text-xs tracking-wider py-5 pl-8 md:pl-10">Nama Kegiatan</TableHead>
                  <TableHead className="font-bold text-emerald-600 uppercase text-xs tracking-wider py-5 text-center">Hadir</TableHead>
                  <TableHead className="font-bold text-blue-600 uppercase text-xs tracking-wider py-5 text-center">Izin</TableHead>
                  <TableHead className="font-bold text-amber-600 uppercase text-xs tracking-wider py-5 text-center">Sakit</TableHead>
                  <TableHead className="font-bold text-rose-600 uppercase text-xs tracking-wider py-5 text-center">Alpha</TableHead>
                  <TableHead className="font-bold text-slate-500 uppercase text-xs tracking-wider py-5 text-center pr-8 md:pr-10">Persentase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                
                {ekstraWajib.length > 0 && (
                  <>
                    <TableRow className="bg-slate-100/50 hover:bg-slate-100/50">
                      <TableCell colSpan={6} className="font-black text-slate-700 py-4 pl-8 md:pl-10">Ekstrakurikuler Wajib</TableCell>
                    </TableRow>
                    {ekstraWajib.map((record, i) => (
                      <TableRow key={`wajib-${i}`} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100/50">
                        <TableCell className="font-bold text-slate-800 py-5 pl-8 md:pl-10">{record.nama_kegiatan}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.hadir}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.izin}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.sakit}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.alpha}</TableCell>
                        <TableCell className="text-center pr-8 md:pr-10">
                          <Badge variant="outline" className="bg-white border-2 border-slate-200 text-slate-700 font-black px-4 py-1.5 shadow-sm text-sm">
                            {record.persentase}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {perkaderan.length > 0 && (
                  <>
                    <TableRow className="bg-amber-50/30 hover:bg-amber-50/30">
                      <TableCell colSpan={6} className="font-black text-amber-800 py-4 pl-8 md:pl-10">Program Perkaderan (TKM)</TableCell>
                    </TableRow>
                    {perkaderan.map((record, i) => (
                      <TableRow key={`pk-${i}`} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100/50">
                        <TableCell className="font-bold text-slate-800 py-5 pl-8 md:pl-10">{record.nama_kegiatan}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.hadir}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.izin}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.sakit}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.alpha}</TableCell>
                        <TableCell className="text-center pr-8 md:pr-10">
                          <Badge variant="outline" className="bg-amber-50 border-2 border-amber-200 text-amber-700 font-black px-4 py-1.5 shadow-sm text-sm">
                            {record.persentase}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {ekstraPilihan.length > 0 && (
                  <>
                    <TableRow className="bg-indigo-50/30 hover:bg-indigo-50/30">
                      <TableCell colSpan={6} className="font-black text-indigo-800 py-4 pl-8 md:pl-10">Ekstrakurikuler Pilihan</TableCell>
                    </TableRow>
                    {ekstraPilihan.map((record, i) => (
                      <TableRow key={`pilihan-${i}`} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100/50">
                        <TableCell className="font-bold text-slate-800 py-5 pl-8 md:pl-10">{record.nama_kegiatan}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.hadir}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.izin}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.sakit}</TableCell>
                        <TableCell className="text-center font-bold text-slate-600">{record.alpha}</TableCell>
                        <TableCell className="text-center pr-8 md:pr-10">
                          <Badge variant="outline" className="bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-black px-4 py-1.5 shadow-sm text-sm">
                            {record.persentase}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {allRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center text-slate-500 font-medium">
                      Belum ada data presensi yang terekam pada semester ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}