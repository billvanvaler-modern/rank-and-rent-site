import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getChildPages, getCurrentSite, getHubPage, getSingletonPage } from "@/lib/data";

// Varies per domain (multi-tenant), so this can't be statically generated
// once at build time -- it has to run per request.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getCurrentSite();
  if (!site) return [];

  const headerList = await headers();
  const host = headerList.get("host") ?? site.domain;
  const base = `https://${host}`;

  const entries: MetadataRoute.Sitemap = [{ url: base }];

  const [servicesHub, locationsHub, about, contact] = await Promise.all([
    getHubPage(site.id, "services_hub"),
    getHubPage(site.id, "locations_hub"),
    getSingletonPage(site.id, "about"),
    getSingletonPage(site.id, "contact"),
  ]);

  if (servicesHub?.status === "published") {
    entries.push({ url: `${base}/services` });
    const services = await getChildPages(servicesHub.id);
    for (const s of services) {
      if (s.status === "published") entries.push({ url: `${base}/services/${s.slug}` });
    }
  }

  if (locationsHub?.status === "published") {
    entries.push({ url: `${base}/locations` });
    const locations = await getChildPages(locationsHub.id);
    for (const l of locations) {
      if (l.status === "published") entries.push({ url: `${base}/locations/${l.slug}` });
    }
  }

  if (about?.status === "published") entries.push({ url: `${base}/about` });
  if (contact?.status === "published") entries.push({ url: `${base}/contact` });

  return entries;
}
