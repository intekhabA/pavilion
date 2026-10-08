import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SettingsProvider } from "@/context/SettingsContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pavilion 360 | Luxury Real Estate & Investment Portfolios",
  description:
    "Curated portfolio of prime apartments, sky penthouses, and gated private estates in India and Dubai. RERA verified with end-to-end investment advisory.",
  keywords: [
    "real estate",
    "luxury apartments",
    "penthouses",
    "villas",
    "investors clinic",
    "delhi ncr real estate",
    "golf course road",
    "rera verified",
  ],
  authors: [{ name: "Pavilion 360 Advisory" }],
  openGraph: {
    title: "Pavilion 360 | Luxury Real Estate & Investment Advisory",
    description: "Curated luxury residences from India and Dubai's premier developers.",
    siteName: "Pavilion 360",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased selection:bg-amber-400 selection:text-slate-950 min-h-screen flex flex-col justify-between">
        <SettingsProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </SettingsProvider>
      </body>
    </html>
  );
}
