import { getCurrentSite, getPageBlocks, getPageImages, getSingletonPage } from "@/lib/data";
import { BlockRenderer } from "@/components/BlockRenderer";

export default async function HomePage() {
  const site = await getCurrentSite();
  if (!site) return null; // layout already renders the "not configured" state

  const home = await getSingletonPage(site.id, "home");

  if (!home) {
    // A real site with no home page built yet -- distinct from a bad URL,
    // so this gets a friendly placeholder rather than a 404.
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center text-slate-500">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">{site.business_name}</h1>
        <p>This site&apos;s homepage hasn&apos;t been published yet.</p>
      </div>
    );
  }

  const [blocks, images] = await Promise.all([getPageBlocks(home.id), getPageImages(home.id)]);

  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} images={images} />
      ))}
    </>
  );
}
