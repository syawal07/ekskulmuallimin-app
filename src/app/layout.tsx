import type { Metadata } from "next";
import { Poppins } from "next/font/google"; 
import "./globals.css";
// 1. IMPORT TOASTER (Wajib ada biar notifikasi muncul)
import { Toaster } from "@/components/ui/sonner"; 

// 2. Konfigurasi Font Poppins
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sistem Ekstrakurikuler Muallimin",
  description: "Aplikasi Presensi dan Manajemen Ekskul",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        // Gabungkan variable font dengan class font-sans
        className={`${poppins.variable} font-sans antialiased`}
      >
        {children}
        
        {/* 3. PASANG KOMPONEN TOASTER DISINI */}
        {/* position="top-center" agar muncul di tengah atas (paling terlihat) */}
        {/* richColors agar warna hijau/merah-nya menyala */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}