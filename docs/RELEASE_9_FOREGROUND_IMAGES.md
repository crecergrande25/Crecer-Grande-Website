# Release 9 — images at the front of every page

The previous release placed most illustrations below the hero. This release gives all 52 public content-page heroes a visible foreground image next to the heading. On screens up to 800px wide the image follows the heading and actions. Text never overlays the image, and no gradient obscures it. Redirect pages and authenticated admin screens are intentionally outside this coverage.

Ten additional owner-requested illustrations fill the service overview, planning, enquiries, quotation, calculations, industries, feedback, tap/drill, vernier and document-review gaps. The site now uses 60 generated images. These are illustrative, not verified company photographs or customer case-study evidence. Captions identify generated imagery. No SVG images were added.

The Services directory also has topic-specific thumbnails. The tap/drill and vernier guides use new close-up hero illustrations. Existing service galleries remain available below the heroes.

Every new image has descriptive alt text and 480/800/1200/1536px WebP sources. Hero images load eagerly at high priority; supporting images load lazily. The complete composition is preserved with `object-fit: contain`. Versioned local asset references use 9.0.0 to refresh cached styles.

`assets/data/photography.json` and `docs/IMAGE_PLACEMENTS.csv` list the current placements. The media browser checks now require a visible, loaded foreground hero image on every content page and reject overlap, missing files, SVG artwork and horizontal overflow. Homepage checks use the type sizes and column widths appropriate to the new split layout.

This source package is for owner deployment. It does not change the hosted site until uploaded.
