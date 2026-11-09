import type { Metadata, Viewport } from "next";
import "@fontsource/playfair-display/latin-400.css";
import "@fontsource/playfair-display/latin-400-italic.css";
import "@fontsource/playfair-display/latin-500.css";
import "@fontsource/playfair-display/latin-600.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./globals.css";
import { meta } from "@data/meta";
import { themes, tokensCss } from "@design/tokens";

const favicon = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
  `<rect width="64" height="64" rx="8" fill="${themes.dark.bg}"/>`,
  `<circle cx="32" cy="32" r="22" fill="none" stroke="${themes.dark.accent}" stroke-width="1.5" opacity="0.55"/>`,
  `<text x="32" y="43" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="${themes.dark.text}">P</text>`,
  "</svg>",
].join("");

export const metadata: Metadata = {
  title: `${meta.deckTitle} · ${meta.deckSubtitle}`,
  description:
    "An offline, presenter-controlled lecture on projective and objective personality assessment.",
  applicationName: meta.deckTitle,
  robots: { index: false, follow: false },
  icons: {
    icon: `data:image/svg+xml,${encodeURIComponent(favicon)}`,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="font-body" suppressHydrationWarning>
        <style dangerouslySetInnerHTML={{ __html: tokensCss }} suppressHydrationWarning />
        {children}
      </body>
    </html>
  );
}
