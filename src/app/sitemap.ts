import type { MetadataRoute } from "next";
import { absoluteUrl, getLandingVariants } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/dictionary"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/archive"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...getLandingVariants().map((variant) => ({
      url: absoluteUrl(variant.canonicalPath),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: variant.isPrimary ? (variant.slug === "chmi" ? 0.95 : 0.75) : 0.6,
    })),
  ];
}
