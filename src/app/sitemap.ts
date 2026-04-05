import type { MetadataRoute } from "next";
import { metadataBaseUrl } from "@/lib/public-url";

const SEO_PAGES = [
  "/underpaid-car-insurance-claim",
  "/home-insurance-claim-underpaid",
  "/health-insurance-claim-dispute",
  "/insurance-claim-low-offer",
  "/how-to-negotiate-insurance-settlement",
  "/should-i-accept-insurance-settlement",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = metadataBaseUrl();
  const siteUrl = base?.href?.replace(/\/$/, "") ?? "https://claimgap.app";

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/analyze`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...SEO_PAGES.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
