import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Chart Setup Analyzer",
  description:
    "AI-powered multi-timeframe trading analysis for forex, crypto, stocks and futures.",
};

export const viewport: Viewport = {
  width: 1440,
  initialScale: 1,
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
<script
  type="text/javascript"
  dangerouslySetInnerHTML={{
    __html: `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "xd6mym2w1r");
    `,
  }}
/>
</body>
      </html>
    </ClerkProvider>
  );
}