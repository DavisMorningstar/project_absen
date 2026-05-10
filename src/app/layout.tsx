import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";

export const metadata: Metadata = {
  title: "Web Absen",
  description: "Sistem absensi digital sederhana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
