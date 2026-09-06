import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentSite, getPageBlocks, getPageImages, getSingletonPage } from "@/lib/data";
import { BlockRenderer } from "@/components/BlockRenderer";
import type { PageIntroContent } from "@/lib/types";

async function loadAboutPage() {
  const site = await getCurrentSite();
  if (!site) return null;
  const page = await getSingletonPage(site.id, "about");
  if (!page || page.status !== "published") return null;
  return { site, page };
}

export async function generateMetadata(): Promise<Metadata> {
  const loaded = await loadAboutPage();
  if (!loaded) return {};

  const { site, page } = loaded;
  const blocks = await getPageBlocks(page.id);
  const intro = blocks.find((b) => b.block_type === "page_intro");
  const headline = intro ? (intro.content as unknown as PageIntroContent).headline : "About";

  // Same `absolute` opt-out of the layout's title template used on every
  // other page -- see [slug]/page.tsx for why.
  const title = page.meta_title ?? `${headline} | ${site.business_name}`;

  return {
    title: { absolute: title },
    description: page.meta_description ?? undefined,
  };
}

export default async function AboutPage() {
  const loaded = await loadAboutPage();
  if (!loaded) notFound();

  const { page } = loaded;
  const [blocks, images] = await Promise.all([getPageBlocks(page.id), getPageImages(page.id)]);

  return (
    <>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} images={images} />
      ))}
    </>
  );
}
