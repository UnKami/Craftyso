import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: {
    default: "קראפטיסו | אביזרי אופנה וסדקית",
    template: "%s | קראפטיסו",
  },
  description:
    "קראפטיסו - בוטיק אביזרי אופנה, סדקית ותפירה, המוביל בישראל. תחרה, סרטים, פאצ'ים, אבזמים, כפתורים ועוד.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
