import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { BusinessSettingsProvider } from "@/components/layout/business-settings-provider";
import ChromeShell from "@/components/layout/ChromeShell";
import PublicMobileBodyAttr from "@/components/layout/PublicMobileBodyAttr";
import { getBusinessSettings } from "@/lib/settings/queries";
import { GOOGLE_MAPS_URL } from "@/lib/reviews/constants";

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

const SITE_URL = "https://www.vanrox-group.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VANROX Engineering & Surveying | Land Surveyors Trinidad & Tobago",
    template: "%s | VANROX Engineering & Surveying",
  },
  description:
    "VANROX Engineering and Surveying Services — licensed land surveyors and engineers based in Scarborough, Tobago. Boundary surveys, topographic surveys, cadastral mapping, and development planning across Trinidad & Tobago. 4.9★ on Google. 15+ years experience.",
  keywords: [
    "VANROX",
    "VANROX Group",
    "VANROX Engineering",
    "land surveyor Trinidad",
    "land surveyor Tobago",
    "land surveying TT",
    "surveying services Trinidad and Tobago",
    "engineering services TT",
    "boundary survey Trinidad",
    "cadastral survey Tobago",
    "topographic survey TT",
    "development planning Trinidad",
    "licensed surveyor Tobago",
    "Scarborough Tobago surveyor",
    "engineering consultancy TT",
    "Mr. Mottley surveyor",
  ],
  authors: [{ name: "VANROX Engineering and Surveying Services" }],
  creator: "VANROX Engineering and Surveying Services",
  publisher: "VANROX Engineering and Surveying Services",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "VANROX Engineering & Surveying | Land Surveyors Trinidad & Tobago",
    description:
      "Licensed land surveyors and engineers based in Scarborough, Tobago. Boundary surveys, topographic mapping, and development planning across T&T. 4.9★ on Google.",
    url: SITE_URL,
    siteName: "VANROX Engineering and Surveying Services",
    locale: "en_TT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VANROX Engineering & Surveying | Trinidad & Tobago",
    description:
      "Licensed land surveyors and engineers based in Scarborough, Tobago. Boundary surveys, topographic mapping, and development planning across T&T.",
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
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "LocalBusiness"],
  name: "VANROX Engineering and Surveying Services",
  alternateName: "VANROX Group",
  description:
    "Licensed land surveyors and engineers providing boundary surveys, topographic surveys, cadastral mapping, and engineering consultancy across Trinidad & Tobago.",
  url: SITE_URL,
  telephone: "+18682721240",
  email: "info@vanrox-group.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "25 Whim Development, Plymouth Rd",
    addressLocality: "Scarborough",
    addressRegion: "Tobago",
    addressCountry: "TT",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 11.184,
    longitude: -60.74,
  },
  areaServed: [
    { "@type": "AdministrativeArea", "name": "Tobago" },
    { "@type": "AdministrativeArea", "name": "Trinidad" },
    { "@type": "Country", "name": "Trinidad and Tobago" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "30",
    bestRating: "5",
    worstRating: "1",
  },
  priceRange: "$$",
  sameAs: [GOOGLE_MAPS_URL],
  hasMap: GOOGLE_MAPS_URL,
  foundingDate: "2009",
  numberOfEmployees: { "@type": "QuantitativeValue", value: 5 },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-barlow bg-navy text-white selection:bg-green selection:text-navy">
        <PublicMobileBodyAttr />
        <BusinessSettingsProvider value={businessSettings}>
          <ChromeShell>{children}</ChromeShell>
        </BusinessSettingsProvider>
      </body>
    </html>
  );
}
