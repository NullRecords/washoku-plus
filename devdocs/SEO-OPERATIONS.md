# SEO Operations (Washoku Plus)

Last updated: 2026-05-28

Current status:

- Google Search Console sitemap submission: completed.
- Bing Webmaster Tools setup: deferred (optional until account is available).

## Production URLs

- Site: https://www.washokuplus.com/
- Sitemap: https://www.washokuplus.com/sitemap.xml
- Robots: https://www.washokuplus.com/robots.txt
- App Store listing: https://apps.apple.com/il/app/washokuplus/id6771856203

## 1) Submit Sitemap in Google Search Console

Prerequisite: property ownership for `https://www.washokuplus.com/` in Search Console.

1. Open Google Search Console: https://search.google.com/search-console
2. Select property: `https://www.washokuplus.com/`.
3. In left nav, click **Sitemaps**.
4. In **Add a new sitemap**, enter: `sitemap.xml`.
5. Click **Submit**.
6. Confirm status shows **Success** or **Couldn\'t fetch**.
7. If fetch fails, test these URLs in browser:
   - https://www.washokuplus.com/sitemap.xml
   - https://www.washokuplus.com/robots.txt
8. Re-submit after any sitemap fix.

## 2) Optional: Submit Sitemap in Bing Webmaster Tools (Deferred)

Prerequisite: site verified in Bing Webmaster Tools.

Note: this section is optional and can be completed later without blocking Google indexing progress.

1. Open Bing Webmaster Tools: https://www.bing.com/webmasters
2. Select site: `https://www.washokuplus.com/`.
3. Go to **Sitemaps**.
4. Click **Submit sitemap**.
5. Submit full URL: `https://www.washokuplus.com/sitemap.xml`.
6. Confirm sitemap status is healthy and URL count is greater than zero.

## 3) Initial Indexing Requests (High Priority URLs)

Request indexing for these pages first in Google Search Console (and Bing later if enabled):

- https://www.washokuplus.com/
- https://www.washokuplus.com/ios.html
- https://www.washokuplus.com/menu.html
- https://www.washokuplus.com/sprout-kitchen.html
- https://www.washokuplus.com/guides/what-is-washoku.html

## 4) Weekly SEO Monitoring Checklist

Frequency: once per week (15-20 minutes)

1. Coverage and crawl
   - Google Search Console -> Indexing -> Pages
   - Check for spikes in excluded/error pages.
2. Sitemap health
   - Confirm sitemap is still processed successfully in Google.
   - If Bing is enabled later, confirm Bing sitemap processing too.
3. Query performance
   - Google Search Console -> Performance
   - Compare last 28 days vs previous 28 days:
     - Total clicks
     - Total impressions
     - Average CTR
     - Average position
4. App intent pages
   - Inspect page-level performance for:
     - `/`
     - `/ios.html`
     - `/menu.html`
5. Core search snippets
   - Spot-check title and description rendering in search results for brand terms:
     - washoku plus
     - washoku plus app
     - washoku plus app store
6. Technical checks
   - Confirm these still resolve with HTTP 200:
     - `/`
     - `/ios.html`
     - `/sitemap.xml`
     - `/robots.txt`
   - Confirm canonical tags exist and are self-referential on key pages.

## 5) Monthly Improvements Backlog

1. Expand FAQ content on support pages to target long-tail terms.
2. Add review/rating fields to `SoftwareApplication` structured data once stable review volume exists.
3. Publish one new guide monthly targeting searchable meal/allergy questions.
4. Refresh old guides with updated titles/meta descriptions based on query data.

## 6) KPI Targets (Next 90 Days)

Use these as directional targets:

- +30% organic impressions (sitewide)
- +20% organic clicks (sitewide)
- CTR for `/ios.html` at or above 3%
- Branded query average position in top 3

## 7) Fast Troubleshooting

If indexing is slow:

1. Verify sitemap and robots are reachable publicly.
2. Re-run URL Inspection on homepage and `ios.html`.
3. Confirm no accidental `noindex` or canonical mismatch.
4. Ensure latest deploy includes SEO head tags on all pages.

## 8) Change Log Notes

Record SEO-affecting releases with date and summary, for example:

- 2026-05-28: Added canonical, Open Graph, Twitter, app banner tags sitewide; added robots and sitemap; updated App Store CTAs.

## 9) CI SEO Smoke Test

- Workflow file: .github/workflows/seo-smoke-test.yml
- Script file: scripts/seo_smoke_test.sh
- Runs daily and on manual trigger against production URL.
- Validates:
   - robots -> sitemap declaration
   - sitemap format
   - canonical, og:url, twitter card, and app banner meta on priority pages
   - homepage App Store listing link presence
