import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: "700",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Seznam.cz",
  description: "Klasické hledání — krátce",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh bg-white text-[#111]">{children}</body>
    </html>
  );
}
