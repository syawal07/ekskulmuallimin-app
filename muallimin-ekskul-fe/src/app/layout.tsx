import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; 

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  // Menggunakan ketebalan yang lengkap agar desain dinamis
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistem Ekstrakurikuler Muallimin",
  description: "Aplikasi Presensi dan Manajemen Ekskul Madrasah Mu'allimin Muhammadiyah Yogyakarta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        /* MENGGUNAKAN .className AGAR FONT LANGSUNG TER-APPLY PERSIS SEPERTI WEB MUALLIMIN */
        className={`${plusJakartaSans.className} text-foreground antialiased bg-[#F8FAFC]`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}