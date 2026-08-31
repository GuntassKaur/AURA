import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/providers/ThemeProvider";
import MotionProvider from "@/providers/MotionProvider";
import QueryProvider from "@/providers/QueryProvider";
import CustomCursor from "@/components/common/CustomCursor";
import AnimatedBackground from "@/components/background/AnimatedBackground";

const inter = Inter({
  variable: "--font-inter-var",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono-var",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "LifeSphere",
  description: "LifeSphere is a personal memory operating system that connects your documents, photos, places, events and everyday life into one intelligent experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="antialiased bg-[#F7F6F2] text-[#17181C] min-h-screen selection:bg-[#5B5CE2]/15 selection:text-[#5B5CE2]">
        <QueryProvider>
          <ThemeProvider>
            <MotionProvider>
              {/* Premium warm ambient background */}
              <AnimatedBackground />
              <CustomCursor />
              
              {/* Main content slot */}
              <div className="relative z-10 min-h-screen flex flex-col">
                {children}
              </div>
            </MotionProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

