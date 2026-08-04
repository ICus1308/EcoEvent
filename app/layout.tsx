import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/components/AuthProvider";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const numericFont = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  variable: "--font-numeric",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoEvent Hub",
  description: "Nền tảng sự kiện bền vững đầu tiên tại Việt Nam",
};

import FloatingChatStack from "@/components/chat/FloatingChatStack";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${headingFont.variable} ${bodyFont.variable} ${numericFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Header />
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
          <FloatingChatStack />
        </AuthProvider>
      </body>
    </html>
  );
}
