# Crecer Grande Website V2.6 — Release Notes

V2.6 changes the website from a primarily brochure-style presentation into a requirement-led industrial engineering platform.

## Major release areas

- New engineering-gateway homepage and problem-led Engineering Desk.
- Universal technical search and upload-first requirement routing.
- Expanded Laser Machine Ecosystem and Product Finder.
- Complete chiller / pump / consumable requirement routes.
- 3D Printing & CAD platform with local mesh analysis and preliminary FDM/resin estimation.
- SLS/MJF/PolyJet/metal additive RFQ paths without invented instant pricing.
- Material explorer, secondary-operation options, brass inserts and FAI.
- Eight finalized Crecer Grande division pages.
- Rebuilt engineering/manufacturing/maintenance/quality/tender service architecture.
- Anonymized technical case studies and resource articles.
- Improved internal linking, canonical URLs, structured data and sitemap.
- Secured Website Manager V2.6 using Supabase Auth/RLS plus protected Edge Function user management.
- GitHub Pages host files and deployment documentation.

## Commercial / technical caution retained

- Product compatibility is not presented as verified until checked.
- Third-party brand references do not imply authorization unless documented.
- ISO/QMS consultancy is not described as certification.
- Advanced additive-manufacturing routes are presented as RFQ / approved-network routes where applicable.
- Website manufacturing estimates remain preliminary and require engineering review.

## Final visual correction

- Footer refinement pass: reduced oversized logo treatment, tightened footer columns, improved the premium dark background, link spacing and mobile footer behavior across all pages.

## Footer restored to the preferred CG layout

- Rebuilt the shared footer to match the preferred previous layout: top engineering CTA, large horizontal CG brand area, Capabilities / Company / Contact columns, WhatsApp + Instagram + Email icon pills, contact phone/address, and GSTIN/Udyam/version bottom bar.

## Footer navigation regression corrected

- Restored a clearly visible **Admin Login** link to `/admin/` on every public-page footer.
- Restored direct footer links for Engineering Desk, Laser Product Finder, 3D Printing / CAD Quote and Insights while retaining the preferred V2.2-style footer layout.
- The secured Website Manager files were verified present; only the public navigation link had been lost during the footer redesign.

## Admin footer rendering correction

- Removed the custom inline SVG padlock from the public footer because it could render at the browser's default SVG size when an older cached stylesheet was used.
- Restored **Admin Login** as a normal Company-column footer link, matching the preferred clean footer layout.
- Added `?v=2.6.1` to the shared public stylesheet URL to force browsers to load the corrected V2.6 CSS after deployment.
- The secured `/admin/` Website Manager itself was preserved unchanged.

## Header / footer action placement refinement

- Moved **Admin Login** from the footer Company column to the main header immediately before **Request a Quote**, with deliberate separation from the normal navigation links.
- Moved the WhatsApp and Instagram action buttons from below the logo into the **Contact** footer column.
- Removed the duplicate email action pill from below the logo; the main contact email remains in the Contact column.
- Added stylesheet cache version `2.6.2`.
