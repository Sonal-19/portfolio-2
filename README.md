# shivam-portfolio

Portfolio for **Shivam Shukla** (hishivam.com): Astro 7 + Tailwind v4 + GSAP + Lenis, with a "backend / systems" theme.

```bash
bun install
bun run dev      # http://localhost:4322
bun run build    # static output in dist/
bun run check    # Biome
```

## Editing content
All content lives in `src/data/`:
- `profile.ts` – name, roles (hero typer), bio, facts, socials, email
- `projects.ts` – projects + case-study pages (`/projects/[slug]`). `featured: true` puts a project in the sticky stack, the rest go in the "More work" grid. Use `image` (a file in `src/assets/projects/`) for a screenshot, or `cover` for an animated SVG (`mail`, `link`, `traffic`, `blog`, `api`). `role` says what Shivam did.
- `experience.ts` – **placeholder roles**, replace with real experience
- `skills.ts` – stack groups and the tag sphere

## Animation map (`src/lib/fx/`)
| File | Effects |
|---|---|
| `loader.ts` | terminal boot sequence → tile grid flips away (once per session) |
| `network.ts` | hero canvas API graph: drifting nodes, pointer hub, data packets, click bursts |
| `hero.ts` | glyph-decode name, letters repel from cursor, terminal role typer, scroll-out |
| `sections.ts` | block-wipe headings, line reveals + highlighter, sticky stacking project cards, git-log experience, JSON typing, springy contact headline, copy button, velocity marquee |
| `sphere.ts` | draggable 3D tag sphere |
| `chrome.ts` | nav pill, progress bar, active links, circular mobile menu, circular theme switch |

`prefers-reduced-motion` disables the loader and all motion; touch devices get tap/drag versions of hover effects.
