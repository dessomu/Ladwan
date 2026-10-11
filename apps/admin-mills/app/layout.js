import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "लाडवां चक्की एडमिन | Ladwan Chakki Owner Portal",
  description: "Live Rate Board, Duty Status & Order Management for Local Flour Mills (Atta Chakkis)",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#D97706",
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-stone-900 text-stone-100 selection:bg-amber-500 selection:text-stone-950">
        {children}
      </body>
    </html>
  );
}

