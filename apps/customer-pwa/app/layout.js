import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "लाडवां • 100% ताज़ा पारंपरिक पत्थर-पिसा आटा (Ladwan Fresh Atta)",
  description:
    "हाइपर-लोकल चक्की डिलीवरी नेटवर्क। ऑर्डर आने पर ही गेहूं की ताज़ा पिसाई शुरू होगी। 100% शुद्ध संपूर्ण गेहूं आटा 30-45 मिनट में आपके द्वार।",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "लाडवां",
  },
};

export const viewport = {
  themeColor: "#1c1917",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="hi"
      className={`${outfit.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-stone-950 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
