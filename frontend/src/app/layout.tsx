import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { TanstackProvider } from "@/provider/tanstack-provider";
import { GlobalProvider } from "@/provider/global.Context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hệ thống chat emc - Socket",
  description: "Hệ thống chat emc của chúng tôi được tạo ra bởi socket.io",
  icons: {
    icon: {
      url: "https://console.emcvietnam.vn:9000/public-emc/logo.jfif",
      type: "image/x-icon",
    },
  },
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
        <AntdRegistry>
          <TanstackProvider>
            <GlobalProvider>{children}</GlobalProvider>
          </TanstackProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
