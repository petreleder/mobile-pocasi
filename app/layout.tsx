import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seznam.cz",
  description: "Klasické hledání — e-mail",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className="antialiased">
      <body className="min-h-dvh bg-white text-[#111]">{children}</body>
    </html>
  );
}
