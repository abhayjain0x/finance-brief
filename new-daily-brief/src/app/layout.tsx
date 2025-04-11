import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

// Load Inter font with all weights
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

// Use JetBrains Mono for monospace text
const jetBrainsMono = JetBrains_Mono({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://markets-brief.com"),
  title: {
    default: "Home",
    template: "%s | Markets Brief"
  },
  description: "All you need to know about today",
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "Markets Brief",
    description: "All you need to know about today",
    type: "website",
    siteName: "Markets Brief"
  },
  twitter: {
    card: "summary_large_image",
    title: "Markets Brief",
    description: "All you need to know about today",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetBrainsMono.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
} 