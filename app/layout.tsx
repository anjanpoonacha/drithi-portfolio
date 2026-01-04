import type { Metadata } from "next";
import { Pacifico, Poppins } from "next/font/google";
import "./globals.css";
import { LayoutContent } from "./layout-content";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Drithi Sparkle - Story Reading Website",
  description: "A beautiful collection of stories by Drithi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pacifico.variable} ${poppins.variable} font-sans antialiased`}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
