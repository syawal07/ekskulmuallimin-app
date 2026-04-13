# Backend API - Sistem Ekstrakurikuler Muallimin

Repositori ini berisi *source code Backend* (API) untuk aplikasi manajemen presensi, penilaian, dan publikasi berita kegiatan ekstrakurikuler Madrasah Muallimin. Dibangun menggunakan *framework* Laravel.

## 🚀 Teknologi yang Digunakan
* PHP & Laravel Framework
* MySQL Database
* Laravel Sanctum (Autentikasi API)

## 🛠️ Cara Menjalankan Proyek di Komputer Lokal

Ikuti langkah-langkah berikut untuk menjalankan server secara lokal:

1. *Clone* repositori ini.
2. Buka terminal di dalam folder proyek, lalu jalankan perintah `composer install` untuk mengunduh semua *library*.
3. Salin file `.env.example` menjadi `.env`.
4. Sesuaikan konfigurasi *database* di dalam file `.env`.
5. Jalankan `php artisan key:generate` untuk mengamankan sesi.
6. Jalankan `php artisan migrate` untuk membuat struktur tabel di *database*.
7. Jalankan server dengan perintah `php artisan serve`.
8. API Backend akan berjalan di `http://127.0.0.1:8000`.

## 📂 Struktur Utama
* Fitur Utama: Autentikasi, Presensi, Kelola Berita, dan Data Ekskul.
* Foto/Gambar yang diunggah akan tersimpan di folder `public/uploads/`.