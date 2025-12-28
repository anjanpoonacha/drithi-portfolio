import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}
