# Release 14 — image disclosure in Privacy

At the owner's request, image-origin labels have been removed from the public website and admin sign-in. The disclosure now lives in the Privacy Policy under **Website imagery**, at `/privacy.html#website-imagery`.

The change removes 147 static image labels, 70 repeated page notices and the admin sign-in label. The 33 engineering guides that combined an image notice with practical-use guidance retain that engineering guidance. The changing Engineering Desk route panel also no longer renders its image label. Subject captions and descriptive alt text remain; image assets, image placement and the exclusive homepage background are preserved.

The Insights generator was updated so rebuilding articles and directory cards will preserve this choice. The media registry retains source provenance internally and records the central disclosure URL. Image descriptions now focus on their subjects. Public pages continue to link to Privacy in the shared footer.

Public and admin asset URLs use release 14 cache parameters. `VERSION.txt` reads `14.0.0`. Public content timestamps have been refreshed so older CMS copy does not overwrite this release.

Existing rendered-media checks now verify the central Privacy disclosure and the absence of repeated labels. Static pages, headings, images, responsive heroes and the Engineering Desk route changes are checked separately. Detailed verification results accompany the handoff. No administrator credentials or backend changes are needed for this update.

Upload the contents of `website/` to the repository root, preserving paths. The update archive assumes v13 is already present; the complete archive includes all previous website and admin changes. No commit, push or deployment was performed for this release.
