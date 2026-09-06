import Link from "next/link";
import { notFound } from "next/navigation";
import { getChildPages, getCurrentSite, getHubPage, getPageBlocks, getPageImages } from "@/lib/data";
import { BlockRenderer } from "@/components/BlockRenderer";

// Mirrors src/app/services/page.tsx exactly -- same hub-page pattern
// (blocks + a list of published children), just for locations_hub instead
// of services_hub. This route was missing even though the nav (layout.tsx)
// already links to it and the sitemap already lists it when published.
export default async function LocationsHubPage() {
  const site = await getCurrentSite();
  if (!site) return null;

  const hub = await getHubPage(site.id, "locations_hub");
  if (!hub || hub.status !== "published") notFound();

  const [blocks, images, children] = await Promise.all([
    getPageBlocks(hub.id),
    getPageImages(hub.id),
    getChildPages(hub.id),
  ]);

  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} images={images} />
      ))}

      <section className="py-12 px-6 max-w-4xl mx-auto">
        {blocks.length === 0 && (
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Areas We Serve</h1>
        )}
        <ul className="grid sm:grid-cols-2 gap-4">
          {children
            .filter((page) => page.status === "published")
            .map((page) => (
              <li key={page.id} className="border border-slate-200 rounded-lg p-4">
                <Link href={`/${page.slug}`} className="font-medium text-slate-900 underline">
                  {page.nav_label ?? page.slug}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
