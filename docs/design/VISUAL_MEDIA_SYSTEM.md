# VISUAL MEDIA SYSTEM ARCHITECTURE & ASSET SPECIFICATION
**Seven Lands (سفن لاند) — Visual Experience Expansion**  
**Document Authority:** Design Engineering & Brand Systems  
**Date:** October 9, 2026  
**Primary Domain:** `https://7-lands.com`  

---

## 1. System Vision & Creative Tenets

Seven Lands is a premier Saudi marketing, technology, and business-growth consultancy headquartered in Riyadh. The visual media system transforms the digital experience from a purely typographic interface into an immersive, authentic, and prestigious editorial publication.

### Core Creative Tenets:
1. **Regional Grounding (Contemporary Riyadh):** Visuals reflect contemporary Saudi commercial reality—the architectural ambition of King Abdullah Financial District (KAFD), executive workspaces, refined materiality (travertine stone, warm wood, bronze, dark glass), and dignified Saudi professional identity.
2. **Multidisciplinary Depth:** Each of the 7 Lands represents a distinct domain of mastery (Strategy, Branding, Film Production, Digital Presence, Performance Marketing, Digital Products, Enterprise Technology). Each Land possesses its own tailored visual character while harmonizing with the overarching Seven Lands design language.
3. **Restraint & Editorial Sophistication:** The brand palette is anchored in deep ink (`#0B0F19`), warm sand (`#EADBC8`), clean off-white (`#FAF8F5`), and muted steel (`#4A5568`). Photography is high-contrast, atmospheric, and natural—never saturated with artificial neon gradients.
4. **Zero Fabrication & Honest Craft:** Portfolio displays depict authentic disciplines and process methodologies without inventing fictional clients or using misleading mockups.

---

## 2. Directory Hierarchy & Asset Inventory

All static visual assets are organized in the `/public/media` structure to ensure immediate availability in development, local builds, and edge delivery, with cloud mirror syncing to Cloudflare R2 (`seven-lands-media`):

```
public/
└── media/
    ├── editorial/
    │   ├── riyadh-kafd-skyline.webp          # Cinematic Riyadh business context (dusk)
    │   ├── studio-discovery-workshop.webp    # Executive strategy & client alignment
    │   ├── creative-materials-library.webp   # Physical brand craft & tactile textures
    │   └── riyadh-consultation-space.webp    # Welcoming consultation environment
    ├── services/
    │   ├── 01-strategy-growth.webp           # Boardroom executive strategy & market data
    │   ├── 02-branding-creative.webp         # Typography, tactile print, brand identity
    │   ├── 03-content-production.webp        # Cinema camera rig, anamorphic lens, lighting
    │   ├── 04-social-presence.webp           # Real-time digital media & campaign monitors
    │   ├── 05-performance-acquisition.webp   # Performance analytics & data telemetry
    │   ├── 06-web-experiences.webp           # Dark-mode digital flagship UX & responsive UI
    │   └── 07-technology-automation.webp     # Cloud architecture, code terminal & backend
    ├── craft/
    │   ├── craft-identity-system.webp        # Brand architecture & design engineering
    │   ├── craft-digital-flagship.webp       # High-performance commerce platform
    │   ├── craft-commercial-film.webp        # Cinematic storytelling & direction
    │   └── craft-growth-engine.webp          # Full-funnel acquisition & conversion
    └── og/
        ├── og-ar.png                         # Arabic OpenGraph Card (1200x630)
        └── og-en.png                         # English OpenGraph Card (1200x630)
```

---

## 3. The 7 Lands Visual Identity Ledger

| Land # | Slug | Visual Metaphor | Dominant Mood & Materials | Key Elements in Composition |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `strategy-business-growth` | Executive Architecture & Market Vision | Deep slate, travertine, warm daylight | Modern Riyadh executive boardroom overlooking KAFD towers; strategic roadmap displays. |
| **02** | `branding-creative` | Materiality, Grid & Calligraphic Precision | Ink, heavy paper, bronze foil | Tactile stationery mockups, Arabic typography scale specimens, geometric grid overlays. |
| **03** | `content-production` | Cinematic Optics & Studio Lighting | Matte black camera alloys, rim light (3200K) | Precision cinema camera rig (ARRI/RED), anamorphic matte box, studio boom lighting. |
| **04** | `social-digital-presence` | Dynamic Cultural Velocity & Media Command | Editorial contrast, high shutter speed | Social content command console, high-res vertical framing, multi-feed campaign storyboard. |
| **05** | `performance-acquisition` | Mathematical Rigor & Telemetry | Charcoal ink, data amber, clean glass | Multi-monitor performance terminal, attribution funnel matrices, real-time analytics telemetry. |
| **06** | `web-commerce-experiences` | Digital Flagship & Haptic Interaction | Dark UI glass, precision pixels | Multi-device responsive showcase (mobile + desktop) displaying elegant e-commerce design. |
| **07** | `software-automation-technology`| System Reliability & Infrastructure | Deep terminal obsidian, monospace syntax | Clean terminal code review, cloud server topology, resilient backend architecture. |

---

## 4. Technical Performance & Responsive Architecture

To maintain **Lighthouse 95+ performance** and ensure **CLS = 0**:

1. **Format & Compression:**
   - Source images authored at high fidelity (up to 2400px wide).
   - Formatted in next-generation WebP with progressive rendering.
   - Target payload sizes:
     - Hero backgrounds: < 180 KB
     - Card / service visual: < 95 KB
     - Vignette / craft: < 75 KB
2. **Next.js `<Image />` Implementation:**
   - **Above the fold:** Marked with `priority={true}` and `fetchPriority="high"`.
   - **Below the fold:** Lazy loaded by default (`loading="lazy"`).
   - **Responsive sizing (`sizes`):**
     - Full-width hero: `sizes="100vw"`
     - Two-column split: `sizes="(max-width: 768px) 100vw, 50vw"`
     - Three-column grid: `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`
3. **Aspect Ratio Enforcement:**
   - Strict CSS aspect ratios (`aspect-video`, `aspect-[4/3]`, `aspect-[16/10]`) paired with object-cover to guarantee zero layout shift during asset loading.
4. **Bilingual Accessibility (`alt` text):**
   - Every image carries complete, descriptive, culturally accurate `alt` strings in both Arabic and English. No generic "image" or "photo" labels.
