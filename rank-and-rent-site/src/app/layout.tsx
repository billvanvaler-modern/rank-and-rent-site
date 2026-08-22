import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentSite, getHubPage, getSingletonPage } from "@/lib/data";

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

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900">
        <header className="border-b border-slate-200">
          <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold">
              {site.business_name}
            </Link>
            <div className="flex gap-6 text-sm">
              {servicesHub && servicesHub.status === "published" && (
                <Link href="/services">Services</Link>
              )}
              {locationsHub && locationsHub.status === "published" && (
                <Link href="/locations">Locations</Link>
              )}
              {aboutPage && aboutPage.status === "published" && <Link href="/about">About</Link>}
              {contactPage && contactPage.status === "published" && (
                <Link href="/contact">Contact</Link>
              )}
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 mt-12">
          <div className="max-w-4xl mx-auto px-6 py-8 text-sm text-slate-500 flex flex-col sm:flex-row sm:justify-between gap-2">
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
