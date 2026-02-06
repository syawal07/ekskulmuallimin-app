import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// ============================================================================
// STUDENT SERVICE - LOGIC MANAJEMEN DATA SISWA
// ============================================================================

export const studentService = {
  
  // [READ] Mengambil semua data siswa
  getAllStudents: async () => {
    return await prisma.student.findMany({
      orderBy: { class: 'asc' },
      include: { 
        _count: { select: { attendances: true } } 
      } 
    });
  },

  // [READ] Mengambil data siswa spesifik per kelas
  getStudentsByClass: async (className: string) => {
    return await prisma.student.findMany({
      where: { 
        class: className,
        isActive: true 
      },
      orderBy: { name: 'asc' } 
    });
  },

  // [CREATE] Menambah 1 siswa manual
  // PERUBAHAN: exculId sekarang WAJIB (tidak pakai tanda tanya '?' lagi)
  createStudent: async (data: { name: string; nis?: string; class: string; exculId: string }) => {
    
    const studentData: Prisma.StudentUncheckedCreateInput = {
      name: data.name,
      nis: data.nis ?? null, // NIS boleh null jika di schema optional
      class: data.class,
      exculId: data.exculId  // WAJIB STRING: Tidak boleh null/undefined
    };

    return await prisma.student.create({
      data: studentData
    });
  },
  
  // [CREATE BULK] Menambah BANYAK siswa sekaligus (Import Excel)
  // PERUBAHAN: exculId di sini juga WAJIB
  createBulkStudents: async (students: { name: string; nis: string; class: string; exculId: string }[]) => {
    return await prisma.$transaction(
      students.map((student) => {
        
        const studentData: Prisma.StudentUncheckedCreateInput = {
          name: student.name,
          nis: student.nis ?? null, // Handle jika excel kosong NIS-nya
          class: student.class,
          exculId: student.exculId  // WAJIB STRING
        };

        return prisma.student.create({
          data: studentData
        });
      })
    );
  }
};