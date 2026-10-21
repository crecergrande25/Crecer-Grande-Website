# Release 7: review and upload checklist

> Historical release notes. Release 8 now adds the owner-requested generated illustrations; see RELEASE_8_IMAGE_PLACEMENT.md for current image behavior. The earlier text-led description below records the state before that integration.

This release extends the earlier local repairs. No commit, push, Google account configuration or production deployment was performed.

## Implemented

- Four homepage service divisions: engineering/design, manufacturing, machine maintenance and inspection/quality.
- One Services directory. Divisions and the retired Automation URLs redirect there; navigation, search, metadata and service lists use the new scope. The Automation PDF is deleted.
- Six distinct engineering project guides. The CO2, keychain and SS304 duplicates redirect to expanded sections in the laser investigation and precision-marking guides. Guides are identified as methods, not verified completed customer jobs.
- Plain homepage copy, current social description and an “Explore Services” action. Old CMS text cannot overwrite newer static release copy.
- Registration details moved to the footer. “Ask us a question” replaces the public Botcha label. The guide uses current local service answers so an outdated remote knowledge base cannot reintroduce retired offerings.
- Unverified content photos and hero backgrounds withdrawn sitewide, including the mismatched welding and pump images. Logos remain raster images; no SVGs are introduced. Real photographs and video remain outstanding.
- Consistent section/card gaps, aligned card actions, restricted gold accents, no scroll-reveal blank sections, responsive buttons and headings.
- Public heading hierarchy passes. Photo alt text will be written against approved originals; vague alt text is not repurposed to misdescribe existing images.
- Administrator workspace stays hidden/inert before verified active access and clears on sign-out. The public login page remains reachable; authorization belongs at the backend.

## PDFs

The two tender/compliance PDFs mentioned in review are already absent from the supplied checkout and its tracked downloads. The remaining profiles are manufacturing, design, machine maintenance and inspection. Check the deployed URLs after uploading; old files must be removed from the remote branch, not merely omitted from a drag-and-drop overlay. Git preserves their history; deletion from the current branch is the requested public removal.

## After your upload

1. On desktop and phone, confirm four homepage cards, no Automation card, plain headline, Services navigation and current social description in page source.
2. Open Services and Divisions (the latter should reach Services). Open Projects and all six guides, Laser Welding, Contact and Request a Quote.
3. Confirm the three merged project URLs reach the correct article sections. Check filters and empty search states.
4. Check at 320 and 390 px: no horizontal scroll, no hidden sections, readable headings and tap targets. The current release intentionally has no workshop images, so cropped/stretched process photos cannot remain.
5. Inspect GitHub Pages deployment and run the production smoke checks only after the new release is visible. Confirm removed files return 404.
6. Refresh social platform caches if their previews still show the older copy. Search engines and social services cache previews separately from the website.

## Still requires owner input

Original photographs, genuine before/after pairs and process video; Google ownership/verification; actual admin password/MFA policy checks; and a live deployment smoke test. See ORIGINAL_PHOTOGRAPHY_BRIEF.md and OWNER_ACCOUNT_ACTIONS.md. Production and photo hosts remain blocked by this task's proxy, so local browser evidence must not be reported as a live-site audit.
