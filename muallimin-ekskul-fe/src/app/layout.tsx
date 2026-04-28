import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; 

// Definisi font lengkap dengan variable CSS
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta", // Wajib ada untuk disambungkan ke Tailwind
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
        // Gabungkan variable font-jakarta dan trigger class font-sans
        className={`${plusJakartaSans.variable} font-sans text-foreground antialiased bg-[#F8FAFC]`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}