
import { env } from "../config/environment.js";

const MAX_RESULTS = 6;
const MAX_SNIPPET_LENGTH = 2500;
const REQUEST_TIMEOUT_MS = 15000;

export class EvidenceRetrievalService {
  constructor(config = env, fetchImpl = globalThis.fetch) {
    this.apiKey = config.TAVILY_API_KEY;
    this.provider = config.SEARCH_PROVIDER;
    this.endpoint = "https://api.tavily.com/search";
    this.fetchImpl = fetchImpl;
  }

  isConfigured() {
    return (
      this.provider === "tavily" &&
      Boolean(this.apiKey?.trim())
    );
  }

  normalizeUrl(rawUrl) {
    try {
      const parsed = new URL(rawUrl);

      if (parsed.protocol !== "https:") return null;
      if (parsed.username || parsed.password) return null;

      const hostname = parsed.hostname.toLowerCase();

      if (
        hostname === "localhost" ||
        hostname.endsWith(".localhost") ||
        hostname.endsWith(".local")
      ) {
        return null;
      }

      for (const key of [...parsed.searchParams.keys()]) {
        const normalizedKey = key.toLowerCase();

        if (
          normalizedKey.startsWith("utm_") ||
          ["fbclid", "gclid", "mc_cid", "mc_eid"].includes(normalizedKey)
        ) {
          parsed.searchParams.delete(key);
        }
      }

      parsed.hash = "";

      return parsed.href;
    } catch {
      return null;
    }
  }

  extractPublisherFromUrl(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "Unknown";
    }
  }

  matchesDomain(host, domain) {
    return host === domain || host.endsWith(`.${domain}`);
  }

  classifyDomainTrust(url) {
    try {
      const host = new URL(url).hostname
        .toLowerCase()
        .replace(/^www\./, "");

      const gazetteDomains = [
        "egazette.gov.in",
        "egazette.nic.in",
      ];

      if (
        gazetteDomains.some((domain) =>
          this.matchesDomain(host, domain)
        )
      ) {
        return "Official Gazette";
      }

      if (this.matchesDomain(host, "eci.gov.in")) {
        return "Statutory Election Body";
      }

      const factCheckers = [
        "altnews.in",
        "boomlive.in",
        "factchecker.in",
      ];

      if (
        factCheckers.some((domain) =>
          this.matchesDomain(host, domain)
        )
      ) {
        return "Fact-Checking Organization";
      }

      const newsDomains = [
        "reuters.com",
        "apnews.com",
        "thehindu.com",
        "indianexpress.com",
      ];

      if (
        newsDomains.some((domain) =>
          this.matchesDomain(host, domain)
        )
      ) {
        return "Recognized News Media";
      }

      const publicForums = [
        "reddit.com",
        "quora.com",
      ];

      if (
        publicForums.some((domain) =>
          this.matchesDomain(host, domain)
        )
      ) {
        return "Public Forum";
      }

      return "Unknown";
    } catch {
      return "Unknown";
    }
  }

  parsePublicationDate(value) {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  async retrieveEvidence({ claimText, context = "" }) {
    if (!this.isConfigured()) {
      return {
        sources: [],
        isConfigured: false,
        message: "Tavily evidence retrieval is not configured.",
      };
    }

    if (typeof claimText !== "string" || !claimText.trim()) {
      return {
        sources: [],
        isConfigured: true,
        message: "A valid claim is required for evidence retrieval.",
      };
    }

    const query = [
      claimText.trim(),
      typeof context === "string" ? context.trim() : "",
      "India official election evidence verification",
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 400);

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          search_depth: "basic",
          topic: "general",
          max_results: MAX_RESULTS,
          include_answer: false,
          include_raw_content: false,
        }),
      });

      if (!response.ok) {
        console.error(
          `[Tavily] Search failed with HTTP ${response.status}.`
        );

        return {
          sources: [],
          isConfigured: true,
          message: "Evidence search provider returned an error.",
        };
      }

      const data = await response.json();

      if (!Array.isArray(data.results)) {
        return {
          sources: [],
          isConfigured: true,
          message: "Evidence search returned an invalid response.",
        };
      }

      const seen = new Set();
      const sources = [];

      for (const item of data.results) {
        if (
          !item ||
          typeof item.url !== "string" ||
          typeof item.content !== "string" ||
          !item.content.trim()
        ) {
          continue;
        }

        const normalizedUrl = this.normalizeUrl(item.url);

        if (!normalizedUrl || seen.has(normalizedUrl)) {
          continue;
        }

        seen.add(normalizedUrl);

        sources.push({
          url: normalizedUrl,
          title:
            typeof item.title === "string" && item.title.trim()
              ? item.title.trim().slice(0, 500)
              : "Untitled Source",
          publisher: this.extractPublisherFromUrl(normalizedUrl),
          publicationDate: this.parsePublicationDate(
            item.published_date
          ),
          retrievalDate: new Date(),
          snippet: item.content.trim().slice(0, MAX_SNIPPET_LENGTH),
          domainTrust: this.classifyDomainTrust(normalizedUrl),
          reliabilityScore: null,
        });

        if (sources.length >= MAX_RESULTS) break;
      }

      return {
        sources,
        isConfigured: true,
        message: sources.length
          ? "Evidence search completed."
          : "Search completed but no usable sources were found.",
      };
    } catch (error) {
      const message =
        error.name === "AbortError"
          ? "Evidence search timed out."
          : "Evidence retrieval failed.";

      console.error(`[Tavily] ${message}`);

      return {
        sources: [],
        isConfigured: true,
        message,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const evidenceRetrievalService =
  new EvidenceRetrievalService();

export default evidenceRetrievalService;
