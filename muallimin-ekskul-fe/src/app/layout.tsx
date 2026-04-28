import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; // Ganti ke Google Fonts
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; 

// Konfigurasi font otomatis (tidak perlu file manual)
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="id" className="scroll-smooth">
      <body
        className={`${plusJakartaSans.variable} font-sans antialiased bg-[#F8FAFC]`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}