import { ROSTER_COUNT } from "@/data/roster-facets";
import { speakers } from "@/data/speakers";
import { OG_IMAGE, SITE_URL, absoluteUrl } from "./site";

const SPEAKER_COUNT = ROSTER_COUNT + speakers.length;

/**
 * Sitewide entity. Attached to the root route so every page carries it — AI
 * systems cross-reference the same entity facts across pages, and the homepage
 * previously shipped no structured data at all.
 */
export function organisationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "SummonSpeakers",
    url: SITE_URL,
    logo: OG_IMAGE,
    description:
      "SummonSpeakers is a speaker booking marketplace that publishes every speaker's fee band upfront and takes no commission on the booking.",
    slogan: "Book the keynote speaker your event deserves — with fees shown upfront.",
    email: "hello@summonspeakers.com",
    areaServed: ["AU", "NZ", "Global"],
    knowsAbout: [
      "keynote speakers",
      "speaker fees",
      "conference programming",
      "event planning",
      "master of ceremonies",
    ],
  };
}

/** WebSite + SearchAction, so the roster search is discoverable as a sitelink. */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "SummonSpeakers",
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/speakers?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * The service itself, with the published fee range as a real PriceSpecification
 * rather than prose. This is the claim the whole site rests on, so it belongs in
 * structured data.
 */
export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Keynote speaker booking",
    provider: { "@id": `${SITE_URL}/#organization` },
    serviceType: "Speaker booking and event programming",
    description: `Browse ${SPEAKER_COUNT.toLocaleString("en-AU")} speakers with published fee bands, receive a matched shortlist within one business day, and book directly with no bureau markup.`,
    areaServed: ["AU", "NZ", "Global"],
    audience: {
      "@type": "Audience",
      audienceType:
        "Conference producers, event managers, HR and people teams, association directors",
    },
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: 3000,
        maxPrice: 120000,
        priceCurrency: "USD",
        description: "Published keynote fee range across all tiers, excluding travel.",
      },
      url: absoluteUrl("/speaker-fees"),
    },
  };
}
