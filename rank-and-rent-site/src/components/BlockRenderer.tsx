import type {
  BodySectionContent,
  ContactInfoContent,
  DifferentiatorsContent,
  FaqContent,
  FinalCtaContent,
  HeroContent,
  LocalTrustContent,
  PageBlock,
  PageImage,
  PageIntroContent,
  PricingTableContent,
  ProcessStepsContent,
  RelatedLinksContent,
  ServiceAreaContent,
  ServicesGridContent,
  TestimonialsContent,
} from "@/lib/types";
import { publicImageUrl } from "@/lib/supabase";

/**
 * Renders every block_type the schema defines (see the content contracts in
 * 001_initial_schema.sql), not just the ones a service page uses -- so this
 * keeps working unmodified once the admin grows location-page and homepage
 * screens. The heading level is fixed per block_type here, not left to
 * content: this is what actually enforces PROJECT.md's "H1 is always the
 * headline, H2 is always a section header" rule, since content editors can
 * only ever change the text inside these fields, never which tag wraps it.
 *
 * pageHrefById resolves the `link_page_id` values that live inside
 * services_grid/related_links content -- pass a { [pageId]: href } map when
 * rendering a page that uses those block types. Without it, those items
 * degrade to plain text instead of links (no service or location page uses
 * either block type yet, so the pages built so far never need the map).
 */
export function BlockRenderer({
  block,
  images,
  pageHrefById = {},
}: {
  block: PageBlock;
  images: Record<string, PageImage>;
  pageHrefById?: Record<string, string>;
}) {
  switch (block.block_type) {
    case "hero":
      return <Hero content={block.content as unknown as HeroContent} images={images} />;
    case "page_intro":
      return <PageIntro content={block.content as unknown as PageIntroContent} />;
    case "services_grid":
      return (
        <ServicesGrid
          content={block.content as unknown as ServicesGridContent}
          images={images}
          pageHrefById={pageHrefById}
        />
      );
    case "differentiators":
      return <Differentiators content={block.content as unknown as DifferentiatorsContent} />;
    case "service_area":
      return <ServiceArea content={block.content as unknown as ServiceAreaContent} />;
    case "process_steps":
      return <ProcessSteps content={block.content as unknown as ProcessStepsContent} />;
    case "pricing_table":
      return <PricingTable content={block.content as unknown as PricingTableContent} />;
    case "testimonials":
      return <Testimonials content={block.content as unknown as TestimonialsContent} images={images} />;
    case "faq":
      return <Faq content={block.content as unknown as FaqContent} />;
    case "related_links":
      return <RelatedLinks content={block.content as unknown as RelatedLinksContent} pageHrefById={pageHrefById} />;
    case "local_trust":
      return <LocalTrust content={block.content as unknown as LocalTrustContent} />;
    case "contact_info":
      return <ContactInfo content={block.content as unknown as ContactInfoContent} />;
    case "body_section":
      return <BodySection content={block.content as unknown as BodySectionContent} />;
    case "final_cta":
      return <FinalCta content={block.content as unknown as FinalCtaContent} />;
    default:
      return null;
  }
}

const section = "py-12 px-6 max-w-4xl mx-auto";
const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((p, i) => (
      <p key={i} className="text-slate-700 leading-relaxed mb-4">
        {p}
      </p>
    ));

/**
 * Small brand mark used above every block_type that carries a `heading`
 * field -- a short gold rule instead of a full-bleed color band, since
 * several blocks with headings (differentiators, service_area,
 * pricing_table, testimonials, faq) can stack on the same page, and a full
 * band on each would get heavy fast. Keeps the reference site's gold+bold
 * heading language without cloning its exact section-divider copy, which
 * doesn't exist in this schema.
 */
function Heading({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`mb-6 ${center ? "text-center" : ""}`}>
      <span className={`block w-10 h-1 bg-[var(--color-brand)] mb-3 ${center ? "mx-auto" : ""}`} />
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{children}</h2>
    </div>
  );
}

function Hero({ content, images }: { content: HeroContent; images: Record<string, PageImage> }) {
  const image = content.image_slot ? images[content.image_slot] : undefined;

  if (!image) {
    // No photo uploaded yet -- fall back to the plain two-column layout so
    // the hero never looks broken pre-photos (see ImageBox below).
    return (
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">{content.headline}</h1>
          {content.subheadline && <p className="text-xl text-slate-600 italic mb-4">{content.subheadline}</p>}
          {content.intro && <p className="text-slate-600 max-w-xl mb-8">{content.intro}</p>}
          {content.cta_text && content.cta_url && <CtaButton text={content.cta_text} href={content.cta_url} />}
        </div>
        <ImageBox image={image} alt={content.headline} className="aspect-[4/3] w-full rounded-xl" />
      </section>
    );
  }

  return (
    <section
      className="relative bg-cover bg-center"
      style={{ backgroundImage: `url(${publicImageUrl(image.storage_path)})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/10" />
      <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <div className="max-w-xl bg-white/70 backdrop-blur-sm rounded-xl p-6 sm:p-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">{content.headline}</h1>
          {content.subheadline && <p className="text-xl text-slate-700 italic mb-4">{content.subheadline}</p>}
          {content.intro && <p className="text-slate-700 mb-8">{content.intro}</p>}
          {content.cta_text && content.cta_url && <CtaButton text={content.cta_text} href={content.cta_url} />}
        </div>
      </div>
    </section>
  );
}

/**
 * Renders a real photo when one's been uploaded to this slot, or a clearly-
 * labeled placeholder box when it hasn't -- so an empty image slot reads as
 * "not filled in yet" rather than looking like something's broken. Real
 * photos go in via the admin's Image Manager (Supabase Storage); this
 * component doesn't know or care which slot names are "real" vs. still
 * empty, it just renders whatever it's given.
 */
function ImageBox({
  image,
  alt,
  className = "",
  showLabel = true,
}: {
  image: PageImage | undefined;
  alt: string;
  className?: string;
  showLabel?: boolean;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={publicImageUrl(image.storage_path)}
        alt={image.alt_text ?? alt}
        className={`object-cover bg-slate-100 ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 bg-slate-100 border border-dashed border-slate-300 text-slate-400 ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      {showLabel && <span className="text-xs">Photo coming soon</span>}
    </div>
  );
}

function PageIntro({ content }: { content: PageIntroContent }) {
  return (
    <section className={section}>
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">{content.headline}</h1>
      {content.intro && paragraphs(content.intro)}
    </section>
  );
}

function BodySection({ content }: { content: BodySectionContent }) {
  return (
    <section className={section}>
      <h2 className="text-2xl font-semibold text-slate-900 mb-3">{content.heading}</h2>
      {paragraphs(content.body)}
    </section>
  );
}

function PricingTable({ content }: { content: PricingTableContent }) {
  return (
    <section className={section}>
      {content.heading && <Heading>{content.heading}</Heading>}
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {(content.intro || (content.cta_text && content.cta_url)) && (
          <div className="bg-slate-100 rounded-lg p-6">
            {content.intro && paragraphs(content.intro)}
            {content.cta_text && content.cta_url && <CtaButton text={content.cta_text} href={content.cta_url} />}
          </div>
        )}
        {content.rows?.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900">
                  <th className="py-3 px-4 font-semibold text-white text-sm">Service</th>
                  <th className="py-3 px-4 font-semibold text-white text-sm">Typical Range</th>
                </tr>
              </thead>
              <tbody>
                {content.rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                    <td className="py-2.5 px-4 text-slate-700">{row.label}</td>
                    <td className="py-2.5 px-4 text-slate-700 tabular-nums">
                      ${row.price_low}&ndash;${row.price_high} {row.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function Faq({ content }: { content: FaqContent }) {
  if (!content.items?.length) return null;
  return (
    <section className={section}>
      {content.heading && <Heading center>{content.heading}</Heading>}
      <div className="divide-y divide-slate-200">
        {content.items.map((item, i) => (
          <div key={i} className="py-5 first:pt-0">
            <h3 className="text-lg font-semibold text-slate-900 mb-1.5">{item.question}</h3>
            <p className="text-slate-700 leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ content }: { content: FinalCtaContent }) {
  return (
    <section className={`${section} text-center py-16`}>
      {content.heading && <h2 className="text-3xl font-bold text-slate-900 mb-3">{content.heading}</h2>}
      {content.body && <p className="text-slate-600 mb-6 max-w-xl mx-auto">{content.body}</p>}
      <CtaButton text={content.cta_text} href={content.cta_url} />
    </section>
  );
}

function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="var(--color-brand)" aria-hidden="true">
      <path d="M10 0l2.59 6.34L19.5 7.64l-5.02 4.6L15.9 19 10 15.27 4.1 19l1.42-6.76-5.02-4.6 6.91-1.3L10 0z" />
    </svg>
  );
}

function Differentiators({ content }: { content: DifferentiatorsContent }) {
  return (
    <section className={section}>
      {content.heading && <Heading>{content.heading}</Heading>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        {content.items?.map((item, i) => (
          <div key={i}>
            <div className="mb-2">
              <StarIcon />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{item.heading}</h3>
            <p className="text-slate-600">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProcessSteps({ content }: { content: ProcessStepsContent }) {
  return (
    <section className={section}>
      {content.heading && <Heading>{content.heading}</Heading>}
      <ol className="space-y-6">
        {content.items?.map((item, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-[var(--color-ink)] text-white text-sm font-semibold flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">{item.heading}</h3>
              <p className="text-slate-700">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ServiceArea({ content }: { content: ServiceAreaContent }) {
  return (
    <section className={section}>
      {content.heading && <Heading center>{content.heading}</Heading>}
      <div className="grid sm:grid-cols-2 gap-6">
        {content.regions?.map((region, i) => (
          <div key={i}>
            <h3 className="font-semibold text-slate-900 mb-2">{region.region_name}</h3>
            <ul className="text-slate-700 space-y-1">
              {region.cities.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesGrid({
  content,
  images,
  pageHrefById,
}: {
  content: ServicesGridContent;
  images: Record<string, PageImage>;
  pageHrefById: Record<string, string>;
}) {
  return (
    <section className={section}>
      {content.intro && <p className="text-slate-700 mb-6">{content.intro}</p>}
      <div className="grid sm:grid-cols-2 gap-6">
        {content.items?.map((item, i) => {
          const image = item.image_slot ? images[item.image_slot] : undefined;
          const href = item.link_page_id ? pageHrefById[item.link_page_id] : undefined;
          return (
            <div key={i}>
              <ImageBox image={image} alt={item.title} className="w-full h-44 rounded-lg mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
              {item.blurb && <p className="text-slate-600 text-sm mb-2">{item.blurb}</p>}
              {href ? (
                <a
                  href={href}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-brand-dark)]"
                >
                  Learn More <span aria-hidden="true">&rarr;</span>
                </a>
              ) : (
                item.link_page_id && <span className="text-sm text-slate-400">Learn More</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

const TESTIMONIAL_CARD_COLORS = ["bg-[var(--color-brand-soft)]", "bg-teal-50", "bg-slate-100"];

function Testimonials({
  content,
  images,
}: {
  content: TestimonialsContent;
  images: Record<string, PageImage>;
}) {
  return (
    <section className={section}>
      {content.heading && <Heading center>{content.heading}</Heading>}
      <div className="grid sm:grid-cols-3 gap-6 pt-6">
        {content.items?.map((item, i) => {
          const image = item.image_slot ? images[item.image_slot] : undefined;
          return (
            <blockquote
              key={i}
              className={`relative rounded-xl p-5 pt-9 text-center ${TESTIMONIAL_CARD_COLORS[i % TESTIMONIAL_CARD_COLORS.length]}`}
            >
              <ImageBox
                image={image}
                alt={item.name}
                className="w-14 h-14 rounded-full absolute -top-7 left-1/2 -translate-x-1/2 border-4 border-white"
                showLabel={false}
              />
              <p className="text-slate-700 italic mb-3">&ldquo;{item.quote}&rdquo;</p>
              <footer className="text-sm font-semibold text-slate-900">
                {item.name}
                {item.title && <span className="block font-normal text-slate-500">{item.title}</span>}
              </footer>
            </blockquote>
          );
        })}
      </div>
    </section>
  );
}

function RelatedLinks({
  content,
  pageHrefById,
}: {
  content: RelatedLinksContent;
  pageHrefById: Record<string, string>;
}) {
  return (
    <section className={section}>
      {content.heading && <h2 className="text-2xl font-semibold text-slate-900 mb-4">{content.heading}</h2>}
      <ul className="space-y-2">
        {content.items?.map((item, i) => {
          const href = item.href ?? (item.link_page_id ? pageHrefById[item.link_page_id] : undefined);
          return (
            <li key={i}>
              {href ? (
                <a href={href} className="text-slate-900 underline">
                  {item.label}
                </a>
              ) : (
                <span className="text-slate-400">{item.label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LocalTrust({ content }: { content: LocalTrustContent }) {
  return (
    <section className={section}>
      {content.heading && <h2 className="text-2xl font-semibold text-slate-900 mb-3">{content.heading}</h2>}
      {paragraphs(content.body)}
    </section>
  );
}

function ContactInfo({ content }: { content: ContactInfoContent }) {
  return (
    <section className={section}>
      {content.heading && <h2 className="text-2xl font-semibold text-slate-900 mb-3">{content.heading}</h2>}
      {content.hours && <p className="text-slate-700 mb-4">{content.hours}</p>}
      {content.map_embed_url && (
        <iframe
          src={content.map_embed_url}
          className="w-full h-64 rounded-lg border border-slate-200 mb-4"
          loading="lazy"
        />
      )}
      {content.form_enabled && (
        <p className="text-slate-400 text-sm">
          (Contact form not built yet -- for now, use the phone number / email in the footer.)
        </p>
      )}
    </section>
  );
}

function CtaButton({ text, href, inverted = false }: { text: string; href: string; inverted?: boolean }) {
  return (
    <a
      href={href}
      className={
        inverted
          ? "inline-flex items-center gap-2 rounded-md bg-white text-[var(--color-ink)] text-sm font-semibold uppercase tracking-wide px-6 py-3 hover:bg-slate-100"
          : "inline-flex items-center gap-2 rounded-md bg-[var(--color-ink)] text-white text-sm font-semibold uppercase tracking-wide px-6 py-3 hover:bg-black"
      }
    >
      {text} <span aria-hidden="true">&rarr;</span>
    </a>
  );
}
