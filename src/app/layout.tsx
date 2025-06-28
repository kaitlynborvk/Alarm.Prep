import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import BottomNav from '@/components/BottomNav';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Alarm Prep",
  description: "GMAT and LSAT prep questions in a quiz alarm app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-alarm-blue-light`}
      >
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
