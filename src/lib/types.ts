// Mirrors 001_initial_schema.sql. Kept in sync by hand with the admin
// app's src/lib/types.ts -- both read the same tables.

export type PageType =
  | "home"
  | "services_hub"
  | "service"
  | "locations_hub"
  | "location"
  | "about"
  | "contact";

export type BlockType =
  | "hero"
  | "page_intro"
  | "services_grid"
  | "differentiators"
  | "service_area"
  | "process_steps"
  | "pricing_table"
  | "testimonials"
  | "faq"
  | "related_links"
  | "local_trust"
  | "contact_info"
  | "body_section"
  | "final_cta";

export interface Site {
  id: string;
  domain: string;
  name: string;
  business_name: string;
  status: "active" | "paused" | "archived";
  phone: string | null;
  email: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  service_area_summary: string | null;
  tagline: string | null;
  ga_measurement_id: string | null;
  gsc_verification_tag: string | null;
}

export interface Page {
  id: string;
  site_id: string;
  parent_page_id: string | null;
  page_type: PageType;
  slug: string;
  nav_label: string | null;
  nav_order: number;
  meta_title: string | null;
  meta_description: string | null;
  status: "draft" | "published";
}

export interface PageBlock {
  id: string;
  page_id: string;
  block_type: BlockType;
  position: number;
  // Deliberately untyped per-block-type here -- BlockRenderer narrows by
  // block_type and casts to the specific *Content interface below.
  content: Record<string, unknown>;
}

export interface PageImage {
  id: string;
  slot_key: string;
  storage_path: string;
  alt_text: string | null;
}

// --- Per-block-type content contracts (see 001_initial_schema.sql) ---

export interface HeroContent {
  headline: string;
  subheadline?: string;
  intro?: string;
  cta_text?: string;
  cta_url?: string;
  image_slot?: string;
}

export interface PageIntroContent {
  headline: string;
  intro?: string;
}

export interface ServicesGridItem {
  title: string;
  blurb?: string;
  image_slot?: string;
  link_page_id?: string;
}
export interface ServicesGridContent {
  intro?: string;
  items: ServicesGridItem[];
  hub_link_page_id?: string;
}

export interface HeadingBodyItem {
  heading: string;
  body: string;
}
export interface DifferentiatorsContent {
  heading?: string;
  items: HeadingBodyItem[];
}
export interface ProcessStepsContent {
  heading?: string;
  items: HeadingBodyItem[];
}

export interface ServiceAreaRegion {
  region_name: string;
  cities: string[];
}
export interface ServiceAreaContent {
  heading?: string;
  regions: ServiceAreaRegion[];
}

export interface PricingRow {
  label: string;
  price_low: string;
  price_high: string;
  unit: string;
}
export interface PricingTableContent {
  heading?: string;
  intro?: string;
  rows: PricingRow[];
  cta_text?: string;
  cta_url?: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  title?: string;
  image_slot?: string;
}
export interface TestimonialsContent {
  heading?: string;
  items: TestimonialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}
export interface FaqContent {
  heading?: string;
  items: FaqItem[];
}

export interface RelatedLinksItem {
  label: string;
  link_page_id?: string;
  href?: string;
}
export interface RelatedLinksContent {
  heading?: string;
  items: RelatedLinksItem[];
}

export interface LocalTrustContent {
  heading?: string;
  body: string;
}

export interface ContactInfoContent {
  heading?: string;
  hours?: string;
  form_enabled?: boolean;
  map_embed_url?: string;
}

export type BodySectionContent = HeadingBodyItem;

export interface FinalCtaContent {
  heading?: string;
  body?: string;
  cta_text: string;
  cta_url: string;
}
