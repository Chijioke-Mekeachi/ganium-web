import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ganium",
  description: "AI-powered protection against scams across web, links, and messages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
