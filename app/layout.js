import "./globals.css";
import { getLang } from "@/lib/i18n";

export const metadata = {
  title: "The Hub · Library",
  description: "Bibliothèque de modules HTML — trading, GEX, ICT/SMC et plus.",
};

export default function RootLayout({ children }) {
  const lang = getLang();
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
