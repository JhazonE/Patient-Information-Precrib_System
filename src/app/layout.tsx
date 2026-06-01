import type { Metadata } from "next";
import "./globals.css";
import ThemeInitializer from "@/presentation/components/ThemeInitializer";

export const metadata: Metadata = {
  title: "PatientCare — Admin Panel",
  description: "Patient Information & Prescription Management System",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ height: "100%" }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ height: "100%", margin: 0 }} suppressHydrationWarning>
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
