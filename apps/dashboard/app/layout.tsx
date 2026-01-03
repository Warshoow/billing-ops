import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "BillingOps - Dashboard",
  description: "Decision-oriented dashboard application for payment management, without the complexity of the Stripe environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col gap-4 p-6 min-h-screen font-sans">
              <div className="flex justify-between w-full mb-4 items-center">
                <nav className="flex gap-4">
                  <a href="/" className="text-sm font-medium hover:underline">Dashboard</a>
                  <a href="/subscriptions" className="text-sm font-medium hover:underline">Subscriptions</a>
                  <a href="/customers" className="text-sm font-medium hover:underline">Customers</a>
                </nav>
                <ModeToggle />
              </div>
              {children}
            </div>
          </ThemeProvider>
      </body>
    </html>
  );
}
