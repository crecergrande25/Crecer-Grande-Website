# Release 8: generated-image placement

This release adds the 50 images explicitly requested and approved for use by the website owner. All are generated illustrations. They are not verified photographs of company facilities, staff or completed projects. No source SVGs, logos on parts or customer branding were introduced.

## Placement and presentation

- One homepage workshop illustration; four service cards use CAD, manufacturing, maintenance and inspection respectively.
- Process galleries match their service: cutting, welding, marking, bending, printing, reverse engineering and inspection.
- Project previews and article examples match the linked guide. The three merged project routes continue to redirect as before.
- Pump imagery is unbranded. Generated people on About are identified as fictional illustrations, not real employees.
- The quote-input image appears in the supporting sidebar. On mobile the form now takes the full available width and the sidebar follows it; a regression check guards the field widths and ordering.
- The Engineering Desk switches to the correct image with each of its five routes.
- Technical frames show the complete image with object-fit: contain. The homepage uses a single frame with a contrast overlay on desktop and displays it below the headline on mobile.
- Every illustrated page includes a disclosure; standalone figures also carry generated-image captions.

## Web assets

The original 1536 × 1024 PNG files are preserved outside this repository. The website contains 50 WebP images at four responsive widths: 480, 800, 1200 and 1536 pixels, totalling about 13.3 MiB for all 200 files. srcset and sizes select the appropriate download; below-the-fold images are lazy-loaded. The homepage hero is loaded eagerly with high priority. All images retain the 3:2 composition.

The allowlist, alternative text and placement map are in assets/data/photography.json. Old unverified raster assets remain retired and are not used by the new pages. CI checks reject unregistered content imagery, SVGs, missing disclosures and stretched images.

## Image index

| Image | Subject | Placement examples |
|---|---|---|
| 01 | Workshop hero | `/` |
| 02 | Engineering and CAD | `/`, `/services.html`, `/mechanical-design-services-kolkata.html` |
| 03 | Manufacturing division | `/`, `/services.html`, `/divisions/advanced-manufacturing.html` |
| 04 | Machine maintenance | `/`, `/services.html`, `/industrial-machine-maintenance-kolkata.html` |
| 05 | Inspection and quality | `/`, `/services.html`, `/industrial-inspection-qa-kolkata.html` |
| 06 | Laser cutting | `/laser-cutting-kolkata.html`, `/projects/laser-machine-rca.html`, `/insights/laser-nozzle-focus-basics.html` |
| 07 | Laser welding | `/laser-welding-kolkata.html` |
| 08 | Laser marking | `/laser-marking-kolkata.html` |
| 09 | 3D printing | `/3d-printing-kolkata.html`, `/divisions/advanced-manufacturing.html` |
| 10 | Reverse engineering | `/reverse-engineering-kolkata.html`, `/projects/reverse-engineering-sample-to-drawing.html`, `/projects.html` |
| 11 | Sheet metal bending | `/sheet-metal-bending-kolkata.html`, `/insights/holes-near-sheet-metal-bends.html`, `/insights/sheet-metal-bending-basics.html` |
| 12 | CNC milling | `/insights/cnc-vmc-speeds-feeds-basics.html`, `/divisions/advanced-manufacturing.html`, `/insights.html` |
| 13 | CNC turning | `/insights/cnc-vmc-speeds-feeds-basics.html` |
| 14 | Mechanical assembly planning | `/mechanical-design-services-kolkata.html` |
| 15 | Piping layout design | `/design-job-work.html`, `/divisions/engineering-design.html` |
| 16 | Production drawing review | `/design-job-work.html`, `/mechanical-design-services-kolkata.html`, `/projects/reverse-engineering-sample-to-drawing.html` |
| 17 | Industrial spare identification | `/custom-machine-spares.html`, `/projects/laser-chiller-pump-replacement.html`, `/divisions/advanced-manufacturing.html` |
| 18 | Chiller pump compatibility | `/`, `/projects/laser-chiller-pump-replacement.html`, `/insights/chiller-pump-equivalent-selection.html` |
| 19 | Coupling alignment inspection | `/industrial-machine-maintenance-kolkata.html`, `/divisions/machine-maintenance.html` |
| 20 | First article inspection | `/projects/3d-print-fai-batch.html`, `/insights/3d-printing-tolerances.html`, `/projects.html` |
| 21 | Marking process comparison | `/`, `/laser-marking-kolkata.html`, `/projects/precision-marked-components.html` |
| 22 | Sheet-to-part cutting comparison | `/laser-cutting-kolkata.html` |
| 23 | Replacement bushing comparison | `/custom-machine-spares.html`, `/reverse-engineering-kolkata.html`, `/projects/fit-correction-replacement-component.html` |
| 24 | Custom keychain marking | `/laser-marking-kolkata.html`, `/projects/precision-marked-components.html` |
| 25 | Laser component identification | `/projects/laser-machine-rca.html`, `/insights/identify-laser-consumables.html`, `/insights/laser-nozzle-focus-basics.html` |
| 26 | Laser cut-quality investigation | `/projects/laser-machine-rca.html`, `/insights/laser-cutting-defects.html`, `/projects.html` |
| 27 | Sheet-metal enclosure | `/sheet-metal-bending-kolkata.html`, `/insights/holes-near-sheet-metal-bends.html`, `/divisions/advanced-manufacturing.html` |
| 28 | Jig and fixture | `/insights/gdt-datum-basics.html`, `/divisions/advanced-manufacturing.html` |
| 29 | Stainless weld detail | `/laser-welding-kolkata.html` |
| 30 | Prototype design iterations | `/projects/3d-print-fai-batch.html` |
| 31 | Printing material samples | `/3d-printing-kolkata.html` |
| 32 | Resin printing process | `/3d-printing-kolkata.html` |
| 33 | Detailed resin prototype | `/insights/3d-printing-tolerances.html`, `/insights.html` |
| 34 | Nylon engineering components | `/custom-machine-spares.html` |
| 35 | Flexible TPU component | `/3d-printing-kolkata.html` |
| 36 | Brass inserts in printed parts | `/3d-printing-kolkata.html` |
| 37 | Infill planning samples | `/insights/3d-printing-file-formats.html` |
| 38 | Deburring a cut edge | `/laser-cutting-kolkata.html` |
| 39 | Stainless surface finishes | `/laser-welding-kolkata.html`, `/insights/stainless-steel-handling.html`, `/insights/surface-roughness-ra-rz.html` |
| 40 | Protective packing | `/projects/precision-marked-components.html`, `/insights/stainless-steel-handling.html` |
| 41 | Surface plate measurement | `/industrial-inspection-qa-kolkata.html`, `/insights/gdt-datum-basics.html`, `/divisions/inspection-testing.html` |
| 42 | Coordinate measurement | `/industrial-inspection-qa-kolkata.html`, `/divisions/inspection-testing.html` |
| 43 | Engineering review discussion | `/about.html` |
| 44 | Workshop overview | `/about.html` |
| 45 | Quote inputs | `/request-quote.html` |
| 46 | Replacement part trial fit | `/reverse-engineering-kolkata.html`, `/projects/fit-correction-replacement-component.html`, `/projects.html` |
| 47 | Sheet thickness inspection | `/sheet-metal-bending-kolkata.html`, `/insights/sheet-metal-bending-basics.html` |
| 48 | Bearing condition review | `/industrial-machine-maintenance-kolkata.html` |
| 49 | Maintenance cleanliness check | `/insights/preventive-maintenance-basics.html`, `/divisions/machine-maintenance.html`, `/insights.html` |
| 50 | Drawing to inspected component | `/design-job-work.html` |

The complete placement inventory is in IMAGE_PLACEMENTS.csv. A repeated image is intentional when the same process is referenced by a service, a preview card and its guide. The set is distributed across 43 relevant routes rather than added to policy, feedback, administrator or error pages.

## Review and deployment

No commit, push or deployment was performed. Review the change manifest and browser evidence, stage with git add -A, and commit when ready. The new v8 package includes all prior repairs plus this integration. Extracting over an old site does not remove retired files; use the verified patch or preserve the deletion manifest.
