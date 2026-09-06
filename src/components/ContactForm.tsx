"use client";

import { useRef, useState, useTransition } from "react";
import { submitLead } from "@/lib/actions";

/**
 * The real contact-form submission -- rendered by BlockRenderer's
 * ContactInfo when a contact_info block has form_enabled turned on (see
 * BlockRenderer.tsx). Everything here is a client component because it
 * needs local state for the pending/success/error UI; the actual write
 * happens in the submitLead server action.
 */
export function ContactForm({
  siteId,
  pageId,
  source = "contact_page",
}: {
  siteId: string;
  pageId: string | null;
  source?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitLead(siteId, pageId, source, formData);
      setResult(res);
      if (res.ok) formRef.current?.reset();
    });
  }

  if (result?.ok) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-slate-700">
        Thanks — we got your message and will be in touch shortly. If it&apos;s urgent, give us a
        call instead.
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            name="name"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input
            name="phone"
            type="tel"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <p className="text-xs text-slate-400">Enter at least a phone number or an email.</p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          What do you need help with?
        </label>
        <textarea
          name="message"
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--color-ink)] text-white text-sm font-semibold uppercase tracking-wide px-6 py-3 hover:bg-black disabled:opacity-50"
      >
        {isPending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
