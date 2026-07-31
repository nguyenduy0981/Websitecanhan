import type { MetadataRoute } from "next";
import { activities } from "@/vo-tri/explore/activities";
import { SITE_URL } from "@/vo-tri/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["/", "/explore", "/profile", "/leaderboard"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const playRoutes: MetadataRoute.Sitemap = activities.map((activity) => ({
    url: `${SITE_URL}/play/${activity.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...playRoutes];
}
