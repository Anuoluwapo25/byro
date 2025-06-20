import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./privy/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Byro - Create and Host Unforgettable Events",
    template: "%s | Byro",
  },
  description:
    "Create your event page, invite friends, and start selling tickets. Host an unforgettable event today with Byro!",
  keywords: [
    "event management",
    "ticket sales",
    "event hosting",
    "event creation",
    "event platform",
  ],
  authors: [{ name: "Byro Africa" }],
  creator: "Byro Africa",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://byro.africa",
    siteName: "Byro",
    title: "Byro - Create and Host Unforgettable Events",
    description:
      "Create your event page, invite friends, and start selling tickets. Host an unforgettable event today with Byro!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Byro - Event Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Byro - Create and Host Unforgettable Events",
    description:
      "Create your event page, invite friends, and start selling tickets. Host an unforgettable event today with Byro!",
    images: ["/og-image.jpg"],
    creator: "@byroafrica",
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
  verification: {
    google: "your-google-site-verification",
  },
  icons: {
    icon: [
      {
        url: "/favicon_io/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon_io/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: "/favicon_io/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
    apple: {
      url: "/favicon_io/apple-touch-icon.png",
      type: "image/png",
      sizes: "180x180",
    },
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/favicon_io/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/favicon_io/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
