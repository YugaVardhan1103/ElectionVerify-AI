import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ElectionVerify AI — Evidence-Based Election Verification",
  description:
    "An AI-assisted platform designed to help voters and analysts investigate election-related claims, analyze facts against credible sources, and explore verification reports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('themePreference');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'Dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background text-text-primary antialiased">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <Script src="https://connect.facebook.net/en_US/sdk.js" strategy="afterInteractive" />
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
