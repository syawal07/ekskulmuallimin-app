import { prisma } from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

// Definisi tipe data input agar type-safe
type AttendanceInput = {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
};

// ============================================================================
// ATTENDANCE SERVICE - LOGIC PRESENSI & PELAPORAN
// ============================================================================

export const attendanceService = {

  // [CREATE BULK] Submit Presensi Massal (Fitur Checklist Guru)
  // Menerima array data siswa, ID guru, Tanggal, dan Link Foto Bukti
  submitBulkAttendance: async (
    data: AttendanceInput[], 
    recorderId: string, 
    date: Date,
    proofImageUrl?: string // Link foto dari Cloudinary/Uploadthing (Ringan di server)
  ) => {
    // Menggunakan transaction untuk performa tinggi saat insert puluhan data
    return await prisma.$transaction(
      data.map((item) =>
        prisma.attendance.create({
          data: {
            date: date, // Tanggal yang dipilih guru
            studentId: item.studentId,
            status: item.status,
            notes: item.notes,
            recorderId: recorderId,
            proofImageUrl: proofImageUrl // URL foto bukti tersimpan di sini
          },
        })
      )
    );
  },

  // [READ] Tarik Laporan Presensi (Fitur Admin & Dashboard)
  // Filter fleksibel: Bisa Harian, Pekanan, atau Bulanan tergantung input startDate & endDate
  getReport: async (startDate: Date, endDate: Date, classFilter?: string) => {
    return await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate, // Greater Than or Equal (Mulai dari)
          lte: endDate,   // Less Than or Equal (Sampai dengan)
        },
        // Jika ada filter kelas, filter by relation student
        student: classFilter ? { class: classFilter } : undefined 
      },
      include: {
        student: true, // Sertakan detail siswa (Nama, NIS)
        recorder: {    // Sertakan detail guru pelapor
          select: { name: true } 
        }
      },
      orderBy: { date: 'desc' } // Data terbaru di atas
    });
  },

  // [READ] Statistik Dashboard (Widget Admin)
  // Menghitung ringkasan: Berapa Hadir, Sakit, Alpha hari ini?
  getTodayStats: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set start hari ini (00:00)

    // Grouping by status (Menghitung jumlah per status)
    const stats = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: {
          gte: today
        }
      },
      _count: {
        status: true
      }
    });

    return stats;
  }
};