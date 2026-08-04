import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingAiChatbot } from "@/components/ai/FloatingAiChatbot";

import { AuthModalProvider } from "@/components/auth/AuthModalContext";

export const metadata: Metadata = {
  title: "YATRIK - Your All-in-one Travel Recommendation & Itinerary Kit",
  description: "Plan Smart. Travel Safe. Explore Together. AI-powered travel ecosystem featuring intelligent itineraries, smart budget prediction, Women's Safety Mode, safe routes, and community intelligence.",
  keywords: "travel planner, AI itinerary, women safety travel, smart travel budget, local hidden gems, safe routes, travel reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#111827',
          borderRadius: '1rem',
        },
        elements: {
          card: 'glass-panel border border-white/10 shadow-glow',
          headerTitle: 'text-gradient font-extrabold',
          headerSubtitle: 'text-gray-400 text-xs',
          socialButtonsBlockButton: 'glass-panel border border-white/10 hover:border-indigo-500/40 transition-all text-white text-xs font-semibold',
          formButtonPrimary: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-glow transition-all',
          footerActionLink: 'text-indigo-400 hover:text-indigo-300 font-semibold',
        }
      }}
    >
      <html lang="en" className="dark">
        <body className="min-h-screen bg-dark-bg text-gray-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
          <AuthModalProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
            <FloatingAiChatbot />
            <Footer />
          </AuthModalProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
