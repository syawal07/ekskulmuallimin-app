// prisma/seed.ts
import { PrismaClient, CampusLocation } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Memulai seeding database Lengkap & Dinamis...')

  // 1. Bersihkan data lama (Urutan penting agar tidak error relation)
  await prisma.attendance.deleteMany()
  await prisma.student.deleteMany()
  await prisma.excul.deleteMany()
  await prisma.gallery.deleteMany()
  await prisma.user.deleteMany()
  await prisma.companyProfile.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)

  // 2. Daftar Ekskul
  const ekskulInduk = [
    "Bahasa", "Robotik", "MUIN TV", "68 Store", "Desain Grafis", 
    "Karya Ilmiah Remaja", "Keagamaan", "Jurnalistik", "Atletik", 
    "Informatika dan Teknologi", "PMR", "Kaligrafi", "Qiroah MTs-MA", 
    "Hadroh", "Musik", "Tonti", "Panahan Modern", "Tapak Suci", 
    "Tenis Meja", "Sepak Takraw", "Bola Voli", "Bulutangkis", 
    "Bola Basket", "Sepak Bola", "Futsal"
  ]

  const ekskulTerpadu = [
    "Marching Band", "Olympiade Sains", "Bahasa", "Robotik", "MUIN TV", 
    "68 Store", "Desain Grafis", "Karya Ilmiah Remaja", "Jurnalistik", 
    "Keagamaan", "Atletik", "Informatika dan Teknologi", "PMR", 
    "Kaligrafi", "Tonti", "Qiroah MA", "Qiroah MTs", "Hadroh", "Musik", 
    "Panahan Modern", "Tapak Suci", "Tenis Meja", "Bulutangkis", 
    "Sepak Takraw", "Bola Voli", "Bola Basket", "Sepak Bola", "Futsal"
  ]

  // 3. Masukkan Ekskul ke Database
  console.log('⏳ Mengisi data Ekskul Kampus INDUK...')
  for (const name of ekskulInduk) {
    await prisma.excul.create({
      data: { name, location: CampusLocation.INDUK }
    })
  }

  console.log('⏳ Mengisi data Ekskul Kampus TERPADU...')
  for (const name of ekskulTerpadu) {
    await prisma.excul.create({
      data: { name, location: CampusLocation.TERPADU }
    })
  }

  // 4. Buat ADMIN Utama
  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Akun Admin dibuat: admin / password123')

  // 5. Buat Guru Demo (Futsal Induk)
  const futsalInduk = await prisma.excul.findFirst({
    where: { name: 'Futsal', location: CampusLocation.INDUK }
  })

  if (futsalInduk) {
    await prisma.user.create({
      data: {
        username: 'guru_futsal',
        password: hashedPassword,
        name: 'Ust. Pengampu Futsal',
        role: 'MENTOR',
        mentoringExculs: {
          connect: { id: futsalInduk.id }
        }
      },
    })
    console.log('✅ Akun Guru Demo dibuat: guru_futsal / password123')

    // Isi Siswa Dummy
    await prisma.student.createMany({
      data: [
        { name: 'Ahmad Dahlan (Contoh)', class: '10 MIPA 1', exculId: futsalInduk.id },
        { name: 'Nyai Walidah (Contoh)', class: '10 MIPA 2', exculId: futsalInduk.id },
      ]
    })
  }

// 6. Company Profile Default (FULL LENGKAP)
  console.log('⏳ Mengisi data Profil Sekolah & CMS...')
  await prisma.companyProfile.create({
    data: {
      schoolName: 'Madrasah Mu\'allimin Muhammadiyah Yogyakarta',
      logoUrl: '/logo.png',
      
      // Hero Section
      heroTitle: 'Wadah Kreativitas',
      heroSubtitle: 'Kader Pemimpin',
      heroDescription: 'Platform digital manajemen ekstrakurikuler Kampus Induk & Terpadu. Memantau perkembangan minat bakat santri secara real-time, akurat, dan transparan.',
      heroImageUrl: '/logo.png', 

      // Login Section (GAMBAR BARU)
      loginImageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop', 
      
      loginQuote: 'Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan Anda dapat mengubah dunia.',
      loginQuoteAuthor: 'Nelson Mandela',

      // Kontak
      aboutText: 'Mu\'allimin Muhammadiyah Yogyakarta adalah sekolah kader persyarikatan yang berkomitmen mencetak calon pemimpin umat dan bangsa.',
      address: 'Jl. S. Parman No.68, Wirobrajan, Yogyakarta',
      email: 'info@muallimin.sch.id',
      phone: '(0274) 373122',
      website: 'muallimin.sch.id',
    },
  })

  // 7. Seed GALERI (Foto Dummy Baru & Valid)
  console.log('⏳ Mengisi data Galeri...')
  await prisma.gallery.createMany({
    data: [
      { title: "Latihan Panahan", imageUrl: "https://images.unsplash.com/photo-1513108272915-c49f80735777?q=80&w=600&auto=format&fit=crop" },
      { title: "Kompetisi Robotik", imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&auto=format&fit=crop" },
      { title: "Kajian Keagamaan", imageUrl: "https://images.unsplash.com/photo-1584286595398-a59f21d313f9?q=80&w=600&auto=format&fit=crop" },
      { title: "Futsal Santri", imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop" },
      { title: "Bela Diri Tapak Suci", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop" },
      { title: "Kegiatan Kepanduan", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop" },
    ]
  })
  
  console.log('🚀 SEEDING SELESAI! Database siap digunakan.')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })