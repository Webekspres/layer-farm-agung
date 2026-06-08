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
const APP_DESCRIPTION =
  "Sistem manajemen peternakan ayam petelur — dashboard admin Layered Farm Agung.";

const instrumentSansHeading = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
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
        <ThemeProvider>
          <NavigationProgress />
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
