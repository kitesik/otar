import type { MetadataRoute } from "next";
import { absoluteUrl, getIndexedIntents } from "@/lib/site";

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
    ...getIndexedIntents().map((intent) => ({
      url: absoluteUrl(`/oops/${intent.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: intent.slug === "chmi" ? 0.95 : 0.75,
    })),
  ];
}
