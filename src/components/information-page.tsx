import Link from "next/link";
import type { ReactNode } from "react";
import { storefrontPages, type StorefrontPageSlug } from "@/lib/storefront-pages";

export type InformationContent = {
  title: string;
  description: string;
  intro: string;
  policy?: boolean;
  sections: { id: string; title: string; content: ReactNode }[];
};

export function InformationPage({
  slug,
  content,
}: {
  slug: StorefrontPageSlug;
  content: InformationContent;
}) {
  return (
    <main id="main-content" className="container information-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><span>{content.title}</span>
      </nav>
      <header className="information-heading">
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        {content.policy && <p className="information-date">Last updated: November 16, 2026</p>}
      </header>
      <div className="information-layout">
        <aside className="information-sidebar">
          <nav aria-label="Customer information" className="information-navigation">
            <h2>Good to know</h2>
            {storefrontPages.map((page) => (
              <Link
                key={page.slug}
                href={`/${page.slug}`}
                aria-current={page.slug === slug ? "page" : undefined}
              >
                {page.title}
              </Link>
            ))}
          </nav>
        </aside>
        <article className="information-content" aria-label={content.title}>
          {content.policy && (
            <div className="information-notice">
              <strong>Before we open for orders</strong>
              <p>
                Noksa is currently a browsing-only storefront. This page describes the current
                site; purchase policies will be finalized before checkout opens.
              </p>
            </div>
          )}
          <details className="information-contents">
            <summary>On this page <span>{content.sections.length} sections</span></summary>
            <nav aria-label="On this page">
              <ul>
                {content.sections.map((section) => (
                  <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>
                ))}
              </ul>
            </nav>
          </details>
          {content.sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.content}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
