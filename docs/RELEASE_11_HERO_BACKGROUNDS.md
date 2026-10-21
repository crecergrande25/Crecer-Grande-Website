# Release 11 — visible background images on every hero

All 78 public content-page heroes now have background imagery as well as their foreground image. Home is included, superseding the earlier homepage exception. The remaining administrative and redirect routes do not have public content heroes.

The background uses a related scene rather than repeating the exact foreground composition: for example a bright production floor behind the homepage workshop image, weld detail behind laser welding, and component or material imagery behind relevant guides. A lighter dark overlay leaves the photo visible while preserving readable white text. Foreground images remain unobscured and retain their full composition.

Versioned asset references now use 11.0.0. VERSION.txt, `data-site-release` and the `cg-release` meta tag identify the published source. Image paths and the 70 existing illustrations are unchanged; no additional image upload is needed when updating a complete v10 installation. `assets/data/insights.json` records background choices for article regeneration.

The media checks now decode each hero’s actual background image in addition to checking the visible foreground image, labels, image provenance, dimensions and overflow. Static checks still reject SVG imagery. The source placement map contains 315 entries, including 78 hero backgrounds.

The previous deployment was found correctly uploaded to GitHub main and its Pages build reported success. The supplied homepage screenshot showed v10’s intentional plain homepage backdrop; this release removes that exception. Independently, the remote repository still retained 288 obsolete files from earlier uploads, including 271 SVGs and 11 retired Projects pages. Those files are absent from this complete source. The handoff includes the exact retirement list and an optional checksum-guarded cleanup helper for a Git checkout.

These changes are local until the owner publishes the supplied update. No commit or push is performed here.
