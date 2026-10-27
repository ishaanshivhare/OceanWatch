import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OceanWatch — Ocean Hazard Reporting & INCOIS Telemetry",
  description:
    "Integrated ocean hazard reporting and visualization platform. Real-time INCOIS early warnings, crowdsourced marine incident reporting, and interactive bathymetric mapping.",
  keywords: [
    "OceanWatch",
    "INCOIS",
    "Ocean Hazard Reporting",
    "High Wave Alert",
    "Tsunami Early Warning",
    "Oil Spill Detection",
    "Marine Safety",
  ],
  authors: [{ name: "OceanWatch National Hazard Observatory" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full w-full bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
