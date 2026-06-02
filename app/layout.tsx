import { SerwistProvider } from "@serwist/turbopack/react"; // 🎯 Menggunakan React runtime provider khusus Turbopack
import type { Metadata } from "next";
import { Instrument_Sans, Raleway } from "next/font/google";
import { NavigationProgress } from "@/components/providers/navigation-progress";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const APP_NAME = "Layered Farm Agung";
const APP_DEFAULT_TITLE = "Layered Farm Agung";
const APP_TITLE_TEMPLATE = "%s - Layered Farm Agung";
const APP_DESCRIPTION = "A layered farm management system built with Next.js and Tailwind CSS.";

const instrumentSansHeading = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json", // 🎯 Mendaftarkan manifes aplikasi ke meta HTML browser
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        raleway.variable,
        instrumentSansHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        {/* 🎯 Menghubungkan provider ke lokasi compile Service Worker yang sah */}
        <SerwistProvider swUrl="/serwist/sw.js">
          <ThemeProvider>
            <NavigationProgress />
            {children}
            <Toaster position="top-center" />
          </ThemeProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}