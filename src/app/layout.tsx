import type { Metadata } from "next";
import Link from "next/link";
import { Poppins } from "next/font/google";
import "./globals.css";
import { getChildPages, getCurrentSite, getHubPage, getSingletonPage } from "@/lib/data";

const displayFont = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCurrentSite();
  if (!site) return { title: "Site not configured" };
  return {
    title: { default: site.business_name, template: `%s | ${site.business_name}` },
    description: site.tagline ?? undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getCurrentSite();

  if (!site) {
    return (
      <html lang="en">
        <body className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
          <p>No site is configured for this domain yet.</p>
        </body>
      </html>
    );
  }

  const [servicesHub, locationsHub, aboutPage, contactPage] = await Promise.all([
    getHubPage(site.id, "services_hub"),
    getHubPage(site.id, "locations_hub"),
    getSingletonPage(site.id, "about"),
    getSingletonPage(site.id, "contact"),
  ]);

  // Only fetched for the nav dropdown, so a site with a services hub but no
  // published services yet still shows the Services link, just without a
  // dropdown under it (see NavDropdown below).
  const servicePages =
    servicesHub && servicesHub.status === "published"
      ? (await getChildPages(servicesHub.id)).filter((p) => p.status === "published")
      : [];
  const locationPages =
    locationsHub && locationsHub.status === "published"
      ? (await getChildPages(locationsHub.id)).filter((p) => p.status === "published")
      : [];

  return (
    <html lang="en" className={`h-full ${displayFont.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
          <nav className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
            <Link href="/" className="text-lg font-bold text-slate-900 tracking-tight shrink-0">
              {site.business_name}
            </Link>

            <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-slate-600">
              {servicesHub && servicesHub.status === "published" && (
                <NavDropdown label="Services" href="/services" items={servicePages} />
              )}
              {locationsHub && locationsHub.status === "published" && (
                <NavDropdown label="Locations" href="/locations" items={locationPages} />
              )}
              {aboutPage && aboutPage.status === "published" && <NavLink href="/about">About</NavLink>}
              {contactPage && contactPage.status === "published" && (
                <NavLink href="/contact">Contact</NavLink>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {site.phone && (
                <a
                  href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
                  className="hidden md:block text-sm font-semibold text-slate-900 hover:text-slate-600"
                >
                  {site.phone}
                </a>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-ink)] text-white text-xs font-semibold uppercase tracking-wide px-4 py-2.5 hover:bg-black whitespace-nowrap"
              >
                Get a Free Estimate <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 mt-12">
          <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-slate-500 flex flex-col sm:flex-row sm:justify-between gap-2">
            <p>
              {site.business_name}
              {site.city && site.state ? ` — ${site.city}, ${site.state}` : ""}
            </p>
            {site.phone && <p>{site.phone}</p>}
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="px-3 py-2 rounded-md hover:text-slate-900 hover:bg-slate-100">
      {children}
    </Link>
  );
}

/**
 * CSS-only hover dropdown (no client component / JS needed) -- matches
 * PROJECT.md's "Services (dropdown -> all service pages)" nav spec. Falls
 * back to a plain link when there's nothing to list yet (e.g. a hub with
 * no published children), so it never shows an empty dropdown.
 */
function NavDropdown({
  label,
  href,
  items,
}: {
  label: string;
  href: string;
  items: { id: string; slug: string; nav_label: string | null }[];
}) {
  if (items.length === 0) {
    return <NavLink href={href}>{label}</NavLink>;
  }
  return (
    <div className="relative group">
      <Link href={href} className="px-3 py-2 rounded-md hover:text-slate-900 hover:bg-slate-100 inline-block">
        {label}
      </Link>
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute left-0 top-full pt-1 min-w-[200px]">
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg py-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${item.slug}`}
              className="block px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              {item.nav_label ?? item.slug}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
