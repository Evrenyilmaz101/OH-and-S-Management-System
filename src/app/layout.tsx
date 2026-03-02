import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { StoreProvider } from "@/components/store-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thornton Engineering | OH&S Management System",
  description:
    "Occupational Health & Safety Management System for Thornton Engineering vessel fabrication shop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans`}>
        <StoreProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
