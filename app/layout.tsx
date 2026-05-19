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
      className="h-full bg-slate-950 antialiased"
    >
      <body className="min-h-full bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
