import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentSite, getPageBlocks, getPageByTypeAndSlug, getPageImages } from "@/lib/data";
import { BlockRenderer } from "@/components/BlockRenderer";
import type { PageIntroContent } from "@/lib/types";

async function loadPage(slug: string) {
  const site = await getCurrentSite();
  if (!site) return null;
  const page = await getPageByTypeAndSlug(site.id, "service", slug);
  // RLS already hides drafts from the anon key, but the .eq("status", ...)
  // filter isn't in the query itself -- this check is what makes that
  // explicit rather than relying solely on RLS to notice a bad state.
  if (!page || page.status !== "published") return null;
  return { site, page };
}

function firstHeadline(blocks: Awaited<ReturnType<typeof getPageBlocks>>): string | undefined {
  const intro = blocks.find((b) => b.block_type === "page_intro");
  return intro ? (intro.content as unknown as PageIntroContent).headline : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadPage(slug);
  if (!loaded) return {};

  const { site, page } = loaded;
  const blocks = await getPageBlocks(page.id);
  const headline = firstHeadline(blocks) ?? page.nav_label ?? slug;

  // `absolute` opts this page's title out of the root layout's
  // `template: "%s | business_name"` -- without it, a fallback title built
  // here (which already appends the business name) gets the business name
  // appended a *second* time by the layout's template when merged.
  const title = page.meta_title ?? `${headline} | ${site.business_name}`;

  return {
    title: { absolute: title },
    description: page.meta_description ?? undefined,
    openGraph: {
      title,
      description: page.meta_description ?? undefined,
      type: "website",
    },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadPage(slug);
  if (!loaded) notFound();

  const { site, page } = loaded;
  const [blocks, images] = await Promise.all([getPageBlocks(page.id), getPageImages(page.id)]);
  const headline = firstHeadline(blocks) ?? page.nav_label ?? slug;

  // Minimal LocalBusiness + Service schema from the site's NAP fields --
  // PROJECT.md calls this out as auto-generated, once, at the template
  // level, inherited by every page. This is that: no per-page authoring.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: headline,
    provider: {
      "@type": "LocalBusiness",
      name: site.business_name,
      telephone: site.phone ?? undefined,
      address: site.street_address
        ? {
            "@type": "PostalAddress",
            streetAddress: site.street_address,
            addressLocality: site.city ?? undefined,
            addressRegion: site.state ?? undefined,
            postalCode: site.postal_code ?? undefined,
          }
        : undefined,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} images={images} />
      ))}
    </>
  );
}
