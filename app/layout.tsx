import type { Metadata } from "next";
import { Rubik, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-serif",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://craftyso.co.il";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SO | אביזרי אופנה, סדקית ותפירה",
    template: "%s | SO Atelier",
  },
  description:
    "SO - בוטיק אביזרי אופנה, סדקית ותפירה המוביל בישראל. תחרה, סרטים, פאצ'ים, אבזמים, כפתורים ובדי יוקרה במחירי יבואן עם משלוח מהיר לכל הארץ.",
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "SO Atelier & Couture",
    title: "SO | אביזרי אופנה, סדקית ותפירה",
    description:
      "בוטיק אביזרי אופנה, סדקית ותפירה המוביל בישראל. משלוח מהיר לכל הארץ ומחירי סיטונאות למעצבים.",
    images: [{ url: "/logo/so-logo.png", alt: "SO Atelier & Couture" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SO | אביזרי אופנה, סדקית ותפירה",
    description:
      "כפתורים, סרטים, פאצ'ים, אבזמים, תחרות מובחרות ובדי יוקרה — במחירי יבואן ישירים.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${rubik.variable} ${frankRuhl.variable} h-full antialiased font-sans selection:bg-[#c99a65]/30 selection:text-[#f8f5ee]`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground relative">
        {children}
      </body>
    </html>
  );
}
