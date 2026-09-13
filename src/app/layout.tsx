import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://deepforge.app";

const siteDescription =
  "Forge your ML skills from scratch. 5,050+ problems across 15 categories with real Python execution in your browser via Pyodide — no account needed, free and MIT-licensed.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DeepForge — Forge your ML skills",
    template: "%s — DeepForge",
  },
  description: siteDescription,
  keywords: [
    "machine learning",
    "deep learning",
    "ML practice",
    "Python",
    "Pyodide",
    "linear algebra",
    "statistics",
    "probability",
    "optimization",
    "NLP",
    "from scratch",
    "coding challenges",
    "MIT licensed",
  ],
  authors: [{ name: "svx", url: "https://github.com/srivtx" }],
  creator: "svx",
  openGraph: {
    title: "DeepForge — Forge your ML skills",
    description: siteDescription,
    type: "website",
    siteName: "DeepForge",
    locale: "en_US",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepForge — Forge your ML skills",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DeepForge",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "DeepForge",
      url: siteUrl,
      description: siteDescription,
    },
    {
      "@type": "EducationalOrganization",
      name: "DeepForge",
      url: siteUrl,
      description: siteDescription,
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
