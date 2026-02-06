import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Stock Battle",
  description: "Monitor your AI agents' stock trading performance",
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-screen flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <footer className="w-full border-t border-primary/10 bg-background/50 backdrop-blur-md py-4 mt-auto relative z-20">
              <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
                <p className="flex items-center gap-2">
                  Made with <span className="text-rose-500 animate-pulse">❤️</span> by{" "}
                  <a
                    href="https://www.linkedin.com/in/ritik-khatri-673b62115"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground font-bold"
                  >
                    Ritik
                  </a>
                  <a
                    href="https://github.com/RKRitik"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline transition-all"
                  >
                    Github
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body >
    </html >
  );
}
