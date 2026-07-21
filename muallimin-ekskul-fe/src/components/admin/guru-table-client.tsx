'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import GuruActionButtons from "@/components/admin/guru-action-buttons"

interface RelasiItem {
  id: number | string;
  name?: string;
  nama_jenjang?: string;
}

interface MentorItem {
  id: number | string;
  name: string;
  username: string;
  role: string;
  mentoring_exculs?: RelasiItem[];
  mentoringExculs?: RelasiItem[];
  perkaderans?: RelasiItem[];
}

interface GuruTableClientProps {
  mentors: MentorItem[];
  page: number;
  limit: number;
  totalPages: number;
  search: string;
  roleFilter: string;
}

export default function GuruTableClient({
  mentors,
  page,
  limit,
  totalPages,
  search,
  roleFilter
}: GuruTableClientProps) {
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[50px] text-center">No</TableHead>
              <TableHead className="min-w-[200px]">Nama Lengkap</TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="min-w-[250px]">Role & Hak Akses</TableHead>
              <TableHead className="text-right pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentors.length > 0 ? (
              mentors.map((item, index) => {
                const isMentor = item.role === 'MENTOR'
                const relasi = isMentor ? (item.mentoring_exculs || item.mentoringExculs || []) : (item.perkaderans || [])
                
                return (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-500 text-center">
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-slate-800 whitespace-nowrap">{item.name}</TableCell>
                    <TableCell className="text-slate-500">@{item.username}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <span className={`w-fit inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isMentor ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                          {isMentor ? 'Pelatih Ekskul' : 'Pembina Perkaderan'}
                        </span>
                        {relasi.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {relasi.map((r: RelasiItem) => (
                              <span key={r.id} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[11px] whitespace-nowrap">
                                {isMentor ? r.name : r.nama_jenjang}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-red-500 italic">Belum ada tanggungan</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <GuruActionButtons userId={item.id.toString()} userName={item.name} />
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-10 h-10 text-slate-200" />
                    <p className="font-medium">Data guru tidak ditemukan.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 bg-slate-50/30">
        <div className="text-sm text-slate-500">
          Halaman <b>{page}</b> dari <b>{totalPages || 1}</b>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/guru?page=${page - 1}&q=${search}&role=${roleFilter}`}
            scroll={false}
            className={!hasPrevPage ? "pointer-events-none" : ""}
          >
            <Button variant="outline" size="sm" disabled={!hasPrevPage} className="gap-1 bg-white">
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
          </Link>
          <Link
            href={`/admin/guru?page=${page + 1}&q=${search}&role=${roleFilter}`}
            scroll={false}
            className={!hasNextPage ? "pointer-events-none" : ""}
          >
            <Button variant="outline" size="sm" disabled={!hasNextPage} className="gap-1 bg-white">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}