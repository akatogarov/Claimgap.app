import type { MetadataRoute } from "next";
import { metadataBaseUrl } from "@/lib/public-url";

export default function robots(): MetadataRoute.Robots {
  const base = metadataBaseUrl();
  const siteUrl = base?.href?.replace(/\/$/, "") ?? "https://claimgap.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/analyze",
          "/privacy",
          "/terms",
          "/underpaid-car-insurance-claim",
          "/home-insurance-claim-underpaid",
          "/health-insurance-claim-dispute",
          "/insurance-claim-low-offer",
          "/how-to-negotiate-insurance-settlement",
          "/should-i-accept-insurance-settlement",
        ],
        disallow: ["/admin", "/api/", "/preview/", "/result/", "/outcome/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
