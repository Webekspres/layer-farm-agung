import type { Metadata } from "next";
import { Instrument_Sans, Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const instrumentSansHeading = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Layered Farm Agung",
  description: "A layered farm management system built with Next.js and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        raleway.variable,
        instrumentSansHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
