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
      return <Hero content={block.content as unknown as HeroContent} />;
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

function Hero({ content }: { content: HeroContent }) {
  return (
    <section className={`${section} text-center py-20`}>
      <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">{content.headline}</h1>
      {content.subheadline && <p className="text-xl text-slate-600 mb-4">{content.subheadline}</p>}
      {content.intro && <p className="text-slate-600 max-w-2xl mx-auto mb-8">{content.intro}</p>}
      {content.cta_text && content.cta_url && <CtaButton text={content.cta_text} href={content.cta_url} />}
    </section>
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
      {content.heading && <h2 className="text-2xl font-semibold text-slate-900 mb-3">{content.heading}</h2>}
      {content.intro && paragraphs(content.intro)}
      {content.rows?.length > 0 && (
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="py-2 pr-4 font-semibold text-slate-900">Service</th>
                <th className="py-2 pr-4 font-semibold text-slate-900">Typical Range</th>
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="py-2 pr-4 text-slate-700">{row.label}</td>
                  <td className="py-2 pr-4 text-slate-700">
                    ${row.price_low}&ndash;${row.price_high} {row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {content.cta_text && content.cta_url && <CtaButton text={content.cta_text} href={content.cta_url} />}
    </section>
  );
}

function Faq({ content }: { content: FaqContent }) {
  if (!content.items?.length) return null;
  return (
    <section className={section}>
      {content.heading && <h2 className="text-2xl font-semibold text-slate-900 mb-4">{content.heading}</h2>}
      <div className="space-y-6">
        {content.items.map((item, i) => (
          <div key={i}>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.question}</h3>
            <p className="text-slate-700 leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ content }: { content: FinalCtaContent }) {
  return (
    <section className={`${section} text-center bg-slate-900 rounded-xl py-16 my-8 max-w-4xl`}>
      {content.heading && <h2 className="text-2xl font-semibold text-white mb-3">{content.heading}</h2>}
      {content.body && <p className="text-slate-300 mb-6 max-w-xl mx-auto">{content.body}</p>}
      <CtaButton text={content.cta_text} href={content.cta_url} inverted />
    </section>
  );
}

function Differentiators({ content }: { content: DifferentiatorsContent }) {
  return (
    <section className={section}>
      {content.heading && <h2 className="text-2xl font-semibold text-slate-900 mb-6">{content.heading}</h2>}
      <div className="grid sm:grid-cols-2 gap-6">
        {content.items?.map((item, i) => (
          <div key={i}>
            <h3 className="font-semibold text-slate-900 mb-1">{item.heading}</h3>
            <p className="text-slate-700">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProcessSteps({ content }: { content: ProcessStepsContent }) {
  return (
    <section className={section}>
      {content.heading && <h2 className="text-2xl font-semibold text-slate-900 mb-6">{content.heading}</h2>}
      <ol className="space-y-6">
        {content.items?.map((item, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex-none w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-semibold flex items-center justify-center">
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
      {content.heading && <h2 className="text-2xl font-semibold text-slate-900 mb-6">{content.heading}</h2>}
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
            <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={publicImageUrl(image.storage_path)} alt={image.alt_text ?? item.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                {item.blurb && <p className="text-slate-700 text-sm mb-2">{item.blurb}</p>}
                {href ? (
                  <a href={href} className="text-sm font-medium text-slate-900 underline">
                    Learn More
                  </a>
                ) : (
                  item.link_page_id && <span className="text-sm text-slate-400">Learn More</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Testimonials({
  content,
  images,
}: {
  content: TestimonialsContent;
  images: Record<string, PageImage>;
}) {
  return (
    <section className={section}>
      {content.heading && <h2 className="text-2xl font-semibold text-slate-900 mb-6">{content.heading}</h2>}
      <div className="grid sm:grid-cols-3 gap-6">
        {content.items?.map((item, i) => {
          const image = item.image_slot ? images[item.image_slot] : undefined;
          return (
            <blockquote key={i} className="border border-slate-200 rounded-lg p-4">
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={publicImageUrl(image.storage_path)}
                  alt={image.alt_text ?? item.name}
                  className="w-12 h-12 rounded-full object-cover mb-3"
                />
              )}
              <p className="text-slate-700 italic mb-3">&ldquo;{item.quote}&rdquo;</p>
              <footer className="text-sm text-slate-500">
                {item.name}
                {item.title && `, ${item.title}`}
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
          ? "inline-block rounded-md bg-white text-slate-900 font-medium px-6 py-3 hover:bg-slate-100"
          : "inline-block rounded-md bg-slate-900 text-white font-medium px-6 py-3 hover:bg-slate-800"
      }
    >
      {text}
    </a>
  );
}
