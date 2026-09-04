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

export const metadata: Metadata = {
  title: {
    default: "SO | אביזרי אופנה ותפירה",
    template: "%s | SO",
  },
  description:
    "SO - בוטיק אביזרי אופנה, סדקית ותפירה המוביל בישראל. תחרה, סרטים, פאצ'ים, אבזמים, כפתורים ועוד.",
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
