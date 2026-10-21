# Release 12 — unique homepage background

A newly generated engineering-studio illustration, image 71, is used exclusively as the homepage hero background. It shows a daylit drawing bench, assembly area, organized tools and welding enclosure. It is not reused on another page and is different from both the previous background and the retained foreground CNC-workshop illustration, image 01.

The image has responsive 480/800/1200/1536px WebP files. Desktop uses the 1536px file; screens up to 800px use the 800px version. The homepage CSS explicitly assigns the new image so an older hero variable cannot restore the previous backdrop. A dark overlay preserves legibility without hiding the scene.

The homepage-only image was generated at the owner’s request. It is an illustration, not a photograph of actual company premises. The original PNG remains outside the website repository.

All other v11 work remains, including relevant backgrounds on the other public-page heroes and the earlier eight requested changes. There are now 71 registered generated illustrations. Version markers and asset references use 12.0.0.

Desktop and mobile browser checks confirmed that the new background actually decoded, image 71 is selected, foreground image 01 remains, and there is no horizontal overflow. Sampled axe checks found no selected WCAG A/AA violations. Static route, heading and raster checks cover the complete source. Exclusivity is verified against all HTML pages.

Upload the update’s index.html, CSS and new image assets together. The custom site will not show this release until the owner uploads it and Pages finishes publishing. Verify VERSION.txt shows 12.0.0. No commit, push or deployment was performed for v12.
