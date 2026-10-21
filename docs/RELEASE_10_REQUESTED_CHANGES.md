# Release 10 — the eight requested changes

1. Every public-page hero except Home now has a relevant generated background image as well as its foreground image. A dark overlay preserves text contrast. Home keeps its existing foreground treatment.
2. Contact enquiry routes are three aligned image cards, with a shorter heading, balanced introduction and clear destinations. On phones the cards stack.
3. The Contact card uses the original `Logo-R01.png` and a real raster WhatsApp QR. The code resolves to `https://wa.me/916291001781`; both the 128px desktop and 112px mobile rendered codes were independently decoded during validation.
4. “Scan. Connect.” and the adjoining heading are white.
5. “Fit Case Study” is removed from Custom Machine Spares, including the inert text left by an earlier release.
6. `projects.html` and all ten `projects/*.html` files are deleted. Navigation, footer, homepage, related links, search and sitemap no longer refer to these routes. Home now points to practical Insights instead. Old project URLs return 404.
7. The footer is compact across all 78 public content pages. Its contact heading is “Contact Us.” WhatsApp and Instagram links use recognizable raster brand marks with accessible labels and 46px tap targets. Desktop footer height is about 351px at 1440px width, with responsive two-column/stacked layouts on smaller screens.
8. Insights contains 50 distinct articles: 17 existing guides plus 33 new guides with topic-specific checks, mistakes, review inputs and a next decision. All featured and library cards have image backgrounds and full-height contrast overlays. Four category filters and search remain usable. The Downloads section, PDF links and related metadata are removed from Insights.

## Images and article maintenance

Ten new generated subjects cover bearings, lubrication, fasteners, gaskets, fits, corrosion, safe maintenance, materials, weld fit-up and hydraulic hoses. The library contains 70 approved generated illustrations, with 480/800/1200/1536px WebP variants. All are illustrations, not verified company photographs or customer-project evidence. Captions and notices remain visible. No SVG assets are shipped.

`assets/data/insights.json` holds the article records. `scripts/build_insights.py` rebuilds the directory and the 33 new pages, homepage insight links, search entries and sitemap. The optional authoring script needs Python with Beautiful Soup; the deployed static website needs no build step. Existing 17 long-form articles retain their original body content. After changing image placements, run `scripts/sync_image_placements.py` to refresh the inventory.

The social marks use Simple Icons brand paths, retrieved from `https://cdn.jsdelivr.net/npm/simple-icons@15/icons/whatsapp.svg` and `https://cdn.jsdelivr.net/npm/simple-icons@15/icons/instagram.svg`, rasterized into white PNG assets. Simple Icons distributes its icon data under CC0. The SVG source files remain outside the repository. The WhatsApp QR is generated from the actual destination, not generated as artwork.

## Uploading matters

Upload all supplied HTML, CSS, JavaScript, JSON and new images together. Asset references use `10.0.0` so browsers request the updated styles and scripts. Delete `projects.html` and the complete old `projects/` directory from the deployed source. Uploading replacement files alone will not remove old remote pages. The handoff includes `DELETED-FILES.txt` with exact retired paths.

No v10 commit, push or deployment is performed by this release. Browser verification and screenshots cover the local source. The owner deploys the supplied package.
