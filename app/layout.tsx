import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LogMagang — Generator Logbook Harian Magang MBKM, MSIB & KKN",
  description:
    "Ubah catatan harian santai menjadi laporan logbook resmi berstandar akademik berbasis Taksonomi Bloom dalam hitungan detik.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="min-h-screen font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
