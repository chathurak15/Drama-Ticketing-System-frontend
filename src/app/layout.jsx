import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: {
    default: "Naataka.lk | Sri Lanka's Premier Stage Drama Ticketing Platform",
    template: "%s | Naataka.lk",
  },
  description:
    "Book tickets online for Sri Lanka's top stage dramas, theatre shows, and live cultural performances. Secure online card payment, instant QR e-tickets, and verified seat selection at Lionel Wendt, Nelum Pokuna, Elphinstone and more.",
  keywords: [
    "Sri Lanka drama tickets",
    "Naataka lk",
    "Sinhala drama booking",
    "Lionel Wendt tickets",
    "Nelum Pokuna stage drama",
    "stage drama Sri Lanka",
    "theatre tickets Colombo",
    "eventure lk alternative",
    "online drama booking",
    "වේදිකා නාට්‍ය",
  ],
  authors: [{ name: "Zeylex", url: "https://zeylex.com" }, { name: "Naataka.lk Team" }],
  creator: "Zeylex",
  publisher: "Naataka.lk",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nataka.chathurakavindu.me"),
  openGraph: {
    title: "Naataka.lk - Sri Lanka's Official Stage Drama Hub",
    description:
      "Explore, pick your seats, and book tickets for Sri Lanka's best stage dramas and theatrical events.",
    url: "https://nataka.chathurakavindu.me",
    siteName: "Naataka.lk",
    locale: "en_LK",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: "#0d0d12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Naataka" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('nataka_theme');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = (saved === 'light' || saved === 'dark') ? saved : (prefersDark ? 'dark' : 'light');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }

                  var a11yRaw = localStorage.getItem('nataka_a11y_prefs');
                  if (a11yRaw) {
                    var a11y = JSON.parse(a11yRaw);
                    if (a11y.fontSize && a11y.fontSize !== 16) {
                      document.documentElement.style.fontSize = a11y.fontSize + 'px';
                      document.documentElement.setAttribute('data-a11y-font-size', a11y.fontSize + 'px');
                    }
                    if (a11y.grayscale) document.documentElement.classList.add('a11y-grayscale');
                    if (a11y.highContrast) document.documentElement.classList.add('a11y-high-contrast');
                    if (a11y.negativeContrast) document.documentElement.classList.add('a11y-negative-contrast');
                    if (a11y.lightBg) document.documentElement.classList.add('a11y-light-bg');
                    if (a11y.linksUnderline) document.documentElement.classList.add('a11y-links-underline');
                    if (a11y.readableFont) document.documentElement.classList.add('a11y-readable-font');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Noto+Serif+Sinhala:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0d0d12] dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-black transition-colors duration-200" suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col" suppressHydrationWarning>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
