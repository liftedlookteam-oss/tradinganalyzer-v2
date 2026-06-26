import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Chart Setup Analyzer",
  description:
    "AI-powered multi-timeframe trading analysis for forex, crypto, stocks and futures.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
  {children}
  <GoogleAnalytics gaId="G-5W1JWW9YCR" />
</body>
      </html>
    </ClerkProvider>
  );
}