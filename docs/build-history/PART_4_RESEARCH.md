# Crecer Grande Website V2.6 — Part 4 Research Notes

## Scope
Part 4 rebuilds the company/about presentation, project case-study architecture, resource/insight library, industries page and core SEO/host files.

## Google Search guidance used
- Organization structured data is most useful on the home page or a page that describes the organization. Relevant properties such as name, logo, URL, contact and address can help Google understand and disambiguate the business.
- Breadcrumb structured data can help Google understand the position of a page within the site hierarchy.
- Self-referencing canonical URLs, consistent internal links and a current sitemap are important signals for canonicalization and crawling.
- Structured data should describe content that is actually visible on the page and should be validated after deployment.
- Search documentation continues to recommend submitting/updating a sitemap and using URL Inspection / Rich Results testing after deployment.

## Content decisions
1. Case studies are written as anonymized engineering problem-solving patterns rather than publishing confidential customer identities.
2. Project pages separate problem, evidence, review, execution and engineering takeaway.
3. Resource pages are designed around practical preparation: part identification, CAD-file selection, breakdown evidence, NCR/RCA/CAPA and replacement-pump matching.
4. Third-party brand references and regulated/certified activities are kept carefully worded; no authorization, accreditation or certification-body status is implied.
5. The About page explains what CG is and what it does not claim.
6. The site now has a real `manifest.webmanifest`, `robots.txt`, `.nojekyll`, `CNAME`, `404.html` and generated `sitemap.xml`.
7. The broken `/estimate.html` route is replaced with an engineering-tools gateway.
8. Homepage search is extended with the new case-study and engineering-resource index.

## Post-deployment SEO actions
- Run Google Rich Results Test on the homepage, About, one project page and one insight page.
- Inspect canonical selection and rendered HTML in Search Console.
- Submit the refreshed sitemap.
- Request indexing first for the home page, Products, Engineering Desk, Projects, Resources and the strongest new technical articles.
