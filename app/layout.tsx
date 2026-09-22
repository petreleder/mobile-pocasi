import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seznam.cz",
  description: "Klasické hledání — e-mail",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className="h-full antialiased">
      <body className="min-h-full bg-white text-[#111]">{children}</body>
    </html>
  );
}
