import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Donnke Internal",
  description: "Internal bakery and donut operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full bg-[#080706] antialiased"
    >
      <body className="min-h-full bg-[#080706] text-slate-100">{children}</body>
    </html>
  );
}
