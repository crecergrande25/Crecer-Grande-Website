# Release 15 — shared footer and Cresiq

Continues the workspace's v14 source. The shared footer now uses a larger original company logo, WhatsApp green and Instagram gradient treatments, centered GSTIN/Udyam registrations in its bottom row, compact link spacing and a manufacturing image backdrop. The bottom-row city label is removed. Static footer markup is updated alongside the runtime shared component.

Cresiq has a navy-and-gold generated icon, source-linked answers from 71 service/guide entries, weighted word matching with common typo normalization, short follow-up context, session history across pages, and a New chat control. Unknown questions prompt clarification. Pricing and delivery remain subject to team review. Existing human-help links are preserved. Responses are rendered as text and links are restricted to same-site paths.

Cresiq runs locally. It is a retrieval and routing assistant, not a connected general-purpose language model, and cannot understand every question. No API key, paid service or remote conversation endpoint was added. Rebuild its embedded knowledge after editing guides with `python scripts/build_cresiq_knowledge.py` (BeautifulSoup required).

Verification: syntax and static route/heading checks; browser conversation tests at 1440, 390 and 320px, including sourced answers, follow-ups, unknown requests, unsupported automation, session persistence, reset and Escape. Preview tests block external traffic. No live database changes, commit, push or deployment performed.
