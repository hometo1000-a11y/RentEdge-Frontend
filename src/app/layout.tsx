import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentEdge | India's Fintech-Powered Rental Network",
  description: "Zero brokers. Full transparency. Rent premium homes, pay rent seamlessly via UPI, and build your credit profile with India's first Rent Score.",
  keywords: ["rent", "broker-free", "fintech", "rent score", "india rental", "apartment rental", "nobroker alternative"],
  authors: [{ name: "RentEdge Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Ensures app-like experience inside WebView
  themeColor: "#0B6E4F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#F7F9F8] dark:bg-[#0B0F19] text-[#16202A] dark:text-[#F8F9FA] font-sans selection:bg-[#0B6E4F]/10 selection:text-[#0B6E4F]">
        {children}
      </body>
    </html>
  );
}
