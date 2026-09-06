import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentSite, getPageBlocks, getPageImages, getSingletonPage } from "@/lib/data";
import { BlockRenderer } from "@/components/BlockRenderer";
import type { PageIntroContent } from "@/lib/types";

async function loadContactPage() {
  const site = await getCurrentSite();
  if (!site) return null;
  const page = await getSingletonPage(site.id, "contact");
  if (!page || page.status !== "published") return null;
  return { site, page };
}

export async function generateMetadata(): Promise<Metadata> {
  const loaded = await loadContactPage();
  if (!loaded) return {};

  const { site, page } = loaded;
  const blocks = await getPageBlocks(page.id);
  const intro = blocks.find((b) => b.block_type === "page_intro");
  const headline = intro ? (intro.content as unknown as PageIntroContent).headline : "Contact";

  const title = page.meta_title ?? `${headline} | ${site.business_name}`;

  return {
    title: { absolute: title },
    description: page.meta_description ?? undefined,
  };
}

export default async function ContactPage() {
  const loaded = await loadContactPage();
  if (!loaded) notFound();

  const { site, page } = loaded;
  const [blocks, images] = await Promise.all([getPageBlocks(page.id), getPageImages(page.id)]);

  const address = [site.street_address, site.city && site.state ? `${site.city}, ${site.state}` : site.city ?? site.state, site.postal_code]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} images={images} siteId={site.id} />
      ))}

      {/* The site's actual NAP fields, not a block -- a contact_info block
          can carry hours/a map/the "form not built yet" note, but the raw
          phone/email/address live on the site row and belong on this page
          regardless of what blocks exist yet. No submission form here --
          matching the rest of the "not built yet" list in PROJECT.md. */}
      {(site.phone || site.email || address) && (
        <section className="py-12 px-6 max-w-4xl mx-auto border-t border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Get in Touch</h2>
          <dl className="space-y-2 text-slate-700">
            {site.phone && (
              <div>
                <dt className="inline font-medium text-slate-900">Phone: </dt>
                <dd className="inline">
                  <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="underline hover:text-slate-900">
                    {site.phone}
                  </a>
                </dd>
              </div>
            )}
            {site.email && (
              <div>
                <dt className="inline font-medium text-slate-900">Email: </dt>
                <dd className="inline">
                  <a href={`mailto:${site.email}`} className="underline hover:text-slate-900">
                    {site.email}
                  </a>
                </dd>
              </div>
            )}
            {address && (
              <div>
                <dt className="inline font-medium text-slate-900">Address: </dt>
                <dd className="inline">{address}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </>
  );
}
