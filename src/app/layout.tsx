import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeepForge · by svx",
  description:
    "Forge your ML skills. Build from scratch. 2000+ problems, real in-browser Python execution, no libraries, no shortcuts.",
  keywords: [
    "machine learning",
    "deep learning",
    "ML practice",
    "Python",
    "Pyodide",
    "linear algebra",
    "statistics",
    "from scratch",
    "svx",
  ],
  authors: [{ name: "svx", url: "https://github.com/srivtx" }],
  creator: "svx",
  openGraph: {
    title: "DeepForge · by svx",
    description:
      "Forge your ML skills. Build from scratch. 2000+ problems, real in-browser Python execution.",
    type: "website",
    url: "https://github.com/srivtx/deepforge",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepForge · by svx",
    description:
      "Forge your ML skills. Build from scratch. 2000+ problems, real in-browser Python execution.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-canvas text-ink`}
      >
        {children}
      </body>
    </html>
  );
}
