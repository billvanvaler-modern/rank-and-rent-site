import { headers } from "next/headers";
import { createPublicClient } from "@/lib/supabase";
import type { Page, PageBlock, PageImage, PageType, Site } from "@/lib/types";

/**
 * Resolves the site to render from the incoming request's Host header --
 * this is the multi-tenant mechanism PROJECT.md describes: one codebase,
 * many custom domains, the `sites.domain` column decides which content
 * renders. Falls back to DEV_DEFAULT_DOMAIN when the host doesn't match any
 * site (e.g. the *.vercel.app preview URL before a real domain is attached).
 */
export async function getCurrentSite(): Promise<Site | null> {
  const headerList = await headers();
  const host = (headerList.get("host") ?? "").split(":")[0]; // strip port for local dev

  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("domain", host)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as Site;

  const fallbackDomain = process.env.DEV_DEFAULT_DOMAIN;
  if (!fallbackDomain || fallbackDomain === host) return null;

  const { data: fallback, error: fallbackError } = await supabase
    .from("sites")
    .select("*")
    .eq("domain", fallbackDomain)
    .maybeSingle();
  if (fallbackError) throw fallbackError;
  return (fallback as Site) ?? null;
}

export async function getPageByTypeAndSlug(
  siteId: string,
  pageType: PageType,
  slug: string
): Promise<Page | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("site_id", siteId)
    .eq("page_type", pageType)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Page | null;
}

export async function getHubPage(
  siteId: string,
  pageType: "services_hub" | "locations_hub"
): Promise<Page | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("site_id", siteId)
    .eq("page_type", pageType)
    .maybeSingle();
  if (error) throw error;
  return data as Page | null;
}

export async function getChildPages(parentPageId: string): Promise<Page[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("parent_page_id", parentPageId)
    .order("nav_order", { ascending: true });
  if (error) throw error;
  return data as Page[];
}

/** Used for the global nav -- one page per singleton type (about, contact, home). */
export async function getSingletonPage(
  siteId: string,
  pageType: "home" | "about" | "contact"
): Promise<Page | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("site_id", siteId)
    .eq("page_type", pageType)
    .maybeSingle();
  if (error) throw error;
  return data as Page | null;
}

export async function getPageBlocks(pageId: string): Promise<PageBlock[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("page_blocks")
    .select("*")
    .eq("page_id", pageId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data as PageBlock[];
}

export async function getPageImages(pageId: string): Promise<Record<string, PageImage>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("page_images")
    .select("id, slot_key, storage_path, alt_text")
    .eq("page_id", pageId);
  if (error) throw error;
  const bySlot: Record<string, PageImage> = {};
  for (const img of (data ?? []) as PageImage[]) {
    bySlot[img.slot_key] = img;
  }
  return bySlot;
}
