import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "OPC UA Клиент • Промышленная диспетчеризация",
  description: "Клиент OPC UA с поддержкой автопоиска контроллеров и узлов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <body className="h-full max-h-screen overflow-hidden bg-[#090a0f] text-[#0f172a] font-sans">
        {children}
      </body>
    </html>
  );
}
