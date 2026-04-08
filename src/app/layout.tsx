import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "AllWays - Premium Home Services",
  description: "Book trusted home services — cleaning, AC repair, plumbing & more. Professional service at your doorstep.",
  keywords: ["home services", "cleaning", "AC repair", "plumbing", "electrician"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full antialiased overflow-x-hidden" suppressHydrationWarning>
      <body className="min-h-full w-full flex flex-col m-0 p-0 overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
