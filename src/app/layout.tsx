import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { BusinessSettingsProvider } from "@/components/layout/business-settings-provider";
import ChromeShell from "@/components/layout/ChromeShell";
import PublicMobileBodyAttr from "@/components/layout/PublicMobileBodyAttr";
import { getBusinessSettings } from "@/lib/settings/queries";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const barlow = Barlow({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700"],
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VANROX Engineering and Surveying Services",
  description: "Professional land surveying and engineering services across Trinidad & Tobago. Precision you can trust.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const businessSettings = await getBusinessSettings();

  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-barlow bg-navy text-white selection:bg-green selection:text-navy">
        <PublicMobileBodyAttr />
        <BusinessSettingsProvider value={businessSettings}>
          <ChromeShell>{children}</ChromeShell>
        </BusinessSettingsProvider>
      </body>
    </html>
  );
}
