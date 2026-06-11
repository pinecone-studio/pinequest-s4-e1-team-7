---
name: Sign Bridge
colors:
  primary: "#f5c518"
  background-dark: "#0d1e35"
  background-light: "#c8def0"
  surface-dark: "#152332"
  surface-light: "#dff0fd"
  text-dark: "#e8f0f8"
  text-light: "#0d1e35"
  teal: "#1e5a8c"
  destructive: "#e53535"
---

# Sign Bridge — Design System

Sign Bridge is a Mongolian sign-language translation platform. The UI blends a deep navy-blue primary surface with a punchy golden-yellow accent (60% blue · 30% white/light · 10% yellow). Dark mode is the primary experience; light mode mirrors the palette with inverted luminosity. Motion (Framer Motion + GSAP) is present throughout: scroll-parallax on the hero, staggered reveal cards, a live 3-D globe, and walking crowd animations.

---

## 1. Visual Theme & Atmosphere

- **Tone:** Professional-tech with warmth. Deep navy backgrounds give a "night sky" quality; the amber-yellow accent (`--olive` / `#F5C518`) pops as the single energetic highlight.
- **Dark mode first:** `[data-theme="dark"]` is the canonical look. Light mode maps the same semantic tokens to a pale sky-blue background (`#c8def0`) with the same yellow accent unchanged.
- **Glassmorphism:** Nav bar and overlay cards use `backdrop-filter: blur(14px)` with `rgba` backgrounds to float above content.
- **Motion:** Framer Motion `EASE = [0.22, 1, 0.36, 1]` easing throughout. Sections reveal with `opacity + translateY`. Hero images parallax on scroll. Globe spins continuously. GSAP drives the crowd-walking canvas.
- **Theme switching:** `[data-theme]` attribute on `<html>` / `:root`; detected in JS via `MutationObserver` for components that need conditional assets (logo image, bridge wordmark color).

---

## 2. Color Palette

All tokens are defined as CSS custom properties on `:root[data-theme="light"]` and `:root[data-theme="dark"]` in `app/globals.css`. Tailwind maps them via `hsl(var(--token))`.

### Brand / Accent

| Token | Light value | Dark value | Hex (dark) | Role |
|---|---|---|---|---|
| `--olive` / `--brand-yellow` | `hsl(47 92% 53%)` | same | `#F5C518` | Primary CTA, active nav, highlights |
| `--olive-2` | `#E8B612` | same | `#E8B612` | Hover state for olive |
| `--olive-deep` | `#C89A0A` | same | `#C89A0A` | Pressed/dark olive |
| `--olive-bright` | `#F9D44A` | same | `#F9D44A` | Scan line glow, live indicators |
| `--olive-soft` | `rgba(245,197,24,0.14)` | `rgba(245,197,24,0.15)` | — | Warm circle background, badge fills |
| `--olive-faint` | `rgba(245,197,24,0.06)` | same | — | Ghost number watermark |

### Background / Surface

| Token | Light value | Dark value | Role |
|---|---|---|---|
| `--bg` | `#C8DEF0` | `#0D1E35` | Page background |
| `--bg-2` | `#BDD3EA` | `#091526` | Alternate page bg |
| `--surface` | `#DFF0FD` | `#152332` | Card / panel background |
| `--surface-2` | `#EDF5FC` | `#1C2D42` | Nested surface, section bg |
| `--background` (Shadcn) | `hsl(207 57% 90%)` | `hsl(215 55% 10%)` | Shadcn base |
| `--card` (Shadcn) | `hsl(0 0% 100%)` | `hsl(213 41% 14%)` | Shadcn card |

### Text

| Token | Light | Dark | Role |
|---|---|---|---|
| `--text` | `#0D1E35` | `#E8F0F8` | Primary body text |
| `--text-2` | `#3A5A7A` | `#9AB8D4` | Secondary / muted text |
| `--text-3` | `#7A9AB8` | `#6080A0` | Tertiary / placeholder |

### Blue / Teal

| Token | Light | Dark | Role |
|---|---|---|---|
| `--teal` | `#1E5A8C` | `#1A3D5C` | Step-1 icon gradient start, feature card bg |
| `--teal-2` | `#2E7AB8` | `#2A5A80` | Step-3 icon gradient, feature card bg |
| `--teal-soft` | `rgba(30,90,140,0.12)` | `rgba(42,90,128,0.20)` | Subtle teal wash |
| `--brand-blue` | `hsl(208 57% 60%)` | `hsl(208 57% 55%)` | Shadcn brand alias |

### Borders & Rings

| Token | Light | Dark | Role |
|---|---|---|---|
| `--border-c` | `rgba(30,80,150,0.10)` | `rgba(150,200,255,0.10)` | Card / nav borders |
| `--border-2` | `rgba(30,80,150,0.18)` | `rgba(150,200,255,0.18)` | Hover border |
| `--border` (Shadcn) | `hsl(208 30% 83%)` | `hsl(213 20% 22%)` | Shadcn border |

### Semantic / State

| Token | Hex / HSL | Role |
|---|---|---|
| `--destructive` | `hsl(0 72% 56%)` light / `hsl(0 55% 62%)` dark | Error states |
| Hardcoded `#e53535` | — | Error text in Settings, AvatarMenu, TranscriptPanel (should use `--destructive`) |
| `#d06a4f` | — | End-call button in FeatureVideoCall (one-off, no token) |

### Globe Section (dark-only overlay)

These colors appear only inside the full-black `GlobeSection` which overrides the theme:

| Value | Role |
|---|---|
| `#000` / `background: "#000"` | Globe section background |
| `#F5C518` | All stat numbers (hardcoded, matches `--olive`) |
| `#0d1e35` | Timeline button text color (hardcoded, matches `--bg` dark) |
| `rgba(255,255,255,0.x)` | Ghost text, borders in dark overlay |

---

## 3. Typography System

### Fonts

| Variable | Family | Weight range | Used for |
|---|---|---|---|
| `--font-sans` / `font-sans` | Montserrat | 400–700 | Body copy, UI labels |
| `--font-display` / `font-display` | Montserrat | 700–900 | Headings, logo wordmark, step numbers |

> Note: `tailwind.config.ts` declares `Onest` and `Unbounded` as fallbacks for `--font-sans` and `--font-display` respectively, but `globals.css` sets both to Montserrat. The `.ts` config is the active one (Next.js loads TypeScript config). The `.js` config is redundant/stale — only `tailwind.config.ts` should exist.

### Scale

| Usage | Size | Weight | Tracking |
|---|---|---|---|
| Hero H1 | `clamp(44px → 72px)` (fluid via responsive classes) | 700 | `-1.5px` |
| Section H2 | `28px` / `38px` md | 700 | `tight` |
| Feature H2 | `30px` / `40–48px` md | 700 | `tight` |
| Step card H4 | `18px` | 600 | normal |
| `.db-h` dashboard heading | `clamp(26px, 3vw, 38px)` | 700 | `-0.8px` |
| Body large | `17–19px` | 400 | normal |
| Body base | `14–15px` | 400–500 | normal |
| Caption / label | `11–13px` | 500–700 | `1.2px` uppercase |
| Section tag (`.ltag`) | `13px` | 700 | `1.2px` uppercase |
| Dashboard card header (`.db-card-h`) | `12px` | 700 | `0.8px` uppercase |

### Line Heights

- Headings: `1.04` (hero), `leading-snug` for cards
- Body: `1.6` base, `leading-relaxed` for paragraphs

---

## 4. Component Patterns

### Buttons

**Primary CTA (`db-pillbtn.green`)**
```
height: 44px (lg: 52px)
padding: 0 18px (lg: 0 24px)
border-radius: 999px
background: var(--olive)
color: #0d1e35
font: 14px / 600
hover: background → var(--olive-2)
active: scale(0.96) opacity(0.88)
```

**Ghost / Secondary (`db-pillbtn`)**
```
height: 44px
border: 1px solid var(--border-c)
background: var(--surface)
color: var(--text)
hover: background → var(--surface-2), border → var(--border-2)
```

**Active Nav Tab (TopNav)**
```
background: var(--olive)
color: #0d1e35
border-radius: 999px
padding: 0.5rem 0.875rem
font: 13px / 600
```

**Inactive Nav Tab**
```
color: var(--text-3)
hover: opacity 0.8
```

### Cards

**Dashboard Card (`db-card`)**
```
background: var(--surface)
border: 1px solid var(--border-c)
border-radius: 26px
padding: 22px
```

**Step Cards (ThreeSteps)**
```
background: var(--surface)
border: 1px solid var(--border-c)
border-radius: 24px
padding: 1.75rem (p-7)
whileHover: translateY(-4px) — Framer Motion
```

**Feature List Card (ThreeModes)**
```
background: var(--surface)
border: 1px solid var(--border-c)
border-radius: 18px
padding: 1rem / 1.25rem md
transition: hover:shadow-sm
```

**Globe Floating Data Card**
```
background: #fff (hardcoded — intentional "paper" look against black globe)
border-radius: 6px
box-shadow: 0 12px 60px rgba(0,0,0,0.5)
```

### Navigation

**Landing Nav (`.lnav`)**
```
position: sticky; top: 0; z-index: 100
padding: 16px 32px (mobile: 12px 5px)
backdrop-filter: blur(14px)
light: background rgba(245,253,255,0.85)
dark: background color-mix(in srgb,var(--bg) 82%,transparent)
border-bottom: 1px solid var(--border-c)
```

**Dashboard TopNav**
```
position: sticky; top: 0; z-index: 40
padding: 1rem 1.5rem → 4rem xl
background: var(--surface)
border-bottom: 1px solid var(--border-c)
backdrop-filter: blur(12px)
hidden on mobile (md:flex)
```

### Phone Mockup (`.lphone`)
```
width: 300px (200–240px in feature sections)
background: #0d1826
border-radius: 40px
padding: 14px
box-shadow: 0 0 0 10px #0d1e35, var(--shadow)
color: #eaf0f8
```

### Toggle (`.dbtoggle`)
```
width: 46px; height: 27px
border-radius: 999px
off: background var(--border-2)
on: background var(--olive)
knob: 21×21px white circle, translateX(19px) when on
```

### Logo Wordmark
```
"Sign" → color: #ffbf00 (= --olive without full saturation, note: Header uses #ffbf00ff with alpha, LogoLoader uses #ffbf00)
"Bridge" → color: var(--text) in LogoLoader, hardcoded #0D1E35 (light) / #E5EEFF (dark) in Header/TopNav
font: var(--font-display), weight 900, size 20–26px
```

---

## 5. Layout Principles

### Container

```
max-width: 1280px (2xl breakpoint)
center: true
padding: 1.5rem (horizontal)
```

### Grid & Spacing

- Section padding: `py-20 px-4 md:px-8` (ThreeSteps, ThreeModes) or `py-20 px-4 md:px-16` (feature sections)
- Step card row: `flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-0` with 36px chevron separators
- Feature rows: `flex flex-col gap-12 md:flex-row md:gap-16` (alternating image + text)
- Custom spacing tokens: `4.5` (1.125rem), `13` (3.25rem) — used for `h-13 w-13` logo sizes

### Breakpoints (Tailwind defaults extended)

| Breakpoint | Width | Key behavior |
|---|---|---|
| `sm` | 640px | Phone mockups show full width, CTA row centers |
| `md` | 768px | Two-column feature layouts, TopNav visible |
| `lg` | 1024px | Globe arc icons and stat panels visible |
| `xl` | 1280px | TopNav wider padding |
| `2xl` | 1280px | Container max-width caps |

### Hero Section

- Full-viewport: `min-h-screen flex-col`
- Text block: `max-w-3xl text-center mx-auto`
- Visual composition: `max-w-5xl mx-auto mt-10` with absolutely-positioned floating images
- Parallax: `useTransform(scrollYProgress, [0,1], ["0%", "-22%"])` on the image block

### Dashboard Layout

- `flex h-dvh flex-col` → TopNav (sticky) + `<main flex-1 overflow-hidden>` + MobileNav (conditional)
- All overflow inside `<main>` managed per-page

### Globe Section

- `height: 100vh` with `overflow: hidden`, `background: #000` — fully isolated from theme
- Globe: `~82vh` square, positioned at `left: 55%` (shifts to `68%` when detail panel open)
- Stat panel: `right: 3%`, `width: clamp(220px, 21vw, 290px)`
- Detail panel: `width: 36%`, left-anchored with gradient fade

---

## 6. Inconsistencies to Fix

### 6.1 Duplicate Tailwind Configs

**`tailwind.config.js` and `tailwind.config.ts` both exist** and diverge in font declarations:
- `tailwind.config.ts` (TypeScript, likely active): `font-sans → Onest`, `font-display → Unbounded`
- `tailwind.config.js` (JavaScript): `font-sans → Montserrat`, `font-display → Montserrat`
- `globals.css` sets `--font-sans` and `--font-display` to Montserrat
- **Fix:** Delete `tailwind.config.js`; align `tailwind.config.ts` font fallbacks to `Montserrat` to match `globals.css`, or vice-versa.

### 6.2 Hardcoded Colors That Should Use CSS Vars

| File | Line(s) | Issue |
|---|---|---|
| `components/landingpage/Header.tsx` | 40 | `#ffbf00ff` — use `var(--olive)` |
| `components/landingpage/Header.tsx` | 33 | `#0D1E35` / `#E5EEFF` — use `var(--text)` |
| `components/dashboard/shared/TopNav.tsx` | 56, 44 | Same as Header.tsx above |
| `components/dashboard/shared/LogoLoader.tsx` | 33 | `#ffbf00` — use `var(--olive)` |
| `components/dashboard/overview/Overview.tsx` | 101 | `#ffbf00ff` — use `var(--olive)` |
| `components/landingpage/GlobeSection.tsx` | 230, 243–244, 251, 330, 377, 389, 403, 412, 465 | `#F5C518` / `#0d1e35` — use `var(--olive)` / `var(--bg)`. (GlobeSection is always dark; acceptable but inconsistent.) |
| `components/landingpage/GlobeSection.tsx` | 433 | `#0d1e35` inline on timeline button — use `var(--bg)` or `var(--text)` |
| `components/dashboard/settings/Settings.tsx` | 166, 169, 218 | `#e53535` — use `var(--destructive)` |
| `components/dashboard/shared/AvatarMenu.tsx` | 57 | `#e53535` — use `var(--destructive)` |
| `components/dashboard/voice/TranscriptPanel.tsx` | 110, 117 | `#e53535` — use `var(--destructive)` |
| `components/landingpage/FeatureVideoCall.tsx` | 27 | `#d06a4f` (end-call red) — define a `--destructive-alt` token or reuse `--destructive` |
| `components/landingpage/AuthOverlay.tsx` | 27, 37 | `bg-white`, `text-[#0d1e35]`, `text-gray-500`, `text-gray-600` — use `var(--surface)`, `var(--text)`, `var(--text-3)` |
| `components/landingpage/ResponsiveDesign.tsx` | 56–229 | Multiple hardcoded dark greens (`#0d1a14`, `#162418`, `#0e1714`, `#1a2a26`, `#1b2a26`, `#111c18`, `#1e2e2b`) — component uses a dark-green theme unrelated to the rest of the design system |
| `components/landingpage/AnimatedHero.tsx` | 292–293 | `bg-white text-black` on `Skiper39` — this component appears to be unused/prototype; confirm before removing |
| `components/dashboard/dict/Dictionary.tsx` | 288, 298 | `bg-black/50`, `bg-red-500/70` — use `var(--surface)` / `var(--destructive)` |

### 6.3 Logo Color Inconsistency

The "Sign" wordmark uses three different yellow values across components:
- `Header.tsx` and `TopNav.tsx`: `#ffbf00ff` (with explicit full alpha, non-standard syntax)
- `LogoLoader.tsx`: `#ffbf00`
- `Overview.tsx`: `#ffbf00ff`
- Design token `--olive` = `#F5C518` (HSL 47 92% 53%)

`#ffbf00` ≠ `#F5C518`. The logo yellow is slightly more saturated/warm than the design system olive. Either align the logo to `var(--olive)` or define a separate `--brand-gold: #ffbf00` token and use it consistently in all three locations.

### 6.4 `bridgeColor` Logic Duplicated

The pattern:
```ts
const bridgeColor = isDark ? "#E5EEFF" : "#0D1E35";
```
is copy-pasted in `Header.tsx` (line 33), `TopNav.tsx` (line 44), and `Overview.tsx` (line 77). Extract into a `useBridgeColor()` hook or replace with `var(--text)` which achieves the same semantic result.

### 6.5 Missing Dark Mode Handling

| File | Issue |
|---|---|
| `components/landingpage/AuthOverlay.tsx` | Modal card uses `bg-white`, `text-gray-600`, `text-gray-500` — these are hardcoded and invisible in dark mode context |
| `components/landingpage/ResponsiveDesign.tsx` | Entire component uses fixed dark-green hex colors with no light/dark conditional — breaks in light theme |
| `components/landingpage/GlobeSection.tsx` | Intentionally always-dark (black background section) — acceptable, but the floating white card (line 154) with `bg-white text-black` will look wrong if the section ever adapts to theme |

### 6.6 Typography Deviations

| File | Issue |
|---|---|
| `components/landingpage/ThreeModes.tsx` | H2 uses `md:text-5xl` (48px); other section H2s top out at `md:text-4xl` (38px) — inconsistent scale |
| `components/landingpage/GlobeSection.tsx` | H2 uses `font-black uppercase` with `fontSize: "clamp(30px,4vw,54px)"` — no `font-display` class applied |
| `components/landingpage/GlobeSection.tsx` | Year stamp `clamp(64px,11vw,160px)` decorative text — no `font-display` class |
| `components/landingpage/AnimatedHero.tsx` (Skiper39) | Uses Tailwind `text-black` directly — not themed |

### 6.7 Spacing Inconsistencies

| File | Issue |
|---|---|
| `components/landingpage/FeatureSignToVoice.tsx` | `md:px-16` padding vs. `md:px-8` in ThreeSteps — inconsistent horizontal rhythm across landing sections |
| `components/landingpage/FeatureVideoCall.tsx` | Same `md:px-16` — should standardize all landing sections to `px-4 md:px-8` or use the container class |
| `components/landingpage/ThreeModes.tsx` | Same `md:px-16` issue |
| `components/landingpage/Footer.tsx` | Applies both `lfooter` class (which sets `padding: 50px 32px`) AND `px-4 pb-8 pt-14 md:px-8` Tailwind classes — double padding application |

### 6.8 Accessibility Issues

| File | Line | Issue |
|---|---|---|
| `components/landingpage/Hero.tsx` | 77–119 | Decorative sibling images (`landing1.png`, `landing4.png`, `landing2.png`, `video.png`) have empty `alt=""` — correct for decorative images, but `landing3.png`/`landing4.png` (center images) have `alt="Sign Bridge"` which is the same as the logo alt — should be more descriptive |
| `components/landingpage/GlobeSection.tsx` | 281–295 | Back buttons have no `aria-label` on the pill-shaped "Дэлхий" button |
| `components/landingpage/GlobeSection.tsx` | 430–441 | Timeline buttons have no `aria-label` / no pressed state announced to screen readers |
| `components/landingpage/Header.tsx` | 45–49 | Nav links are plain `<a>` elements (not `<Link>`) without active state indication for screen readers |
| `components/landingpage/AuthOverlay.tsx` | 26–44 | Modal has no `role="dialog"`, no `aria-modal="true"`, and no focus trap — keyboard users can tab behind the modal |
| `components/dashboard/shared/TopNav.tsx` | 53 | Logo link `aria-label="Нүүр хуудас"` is good — but the `img` inside also has `alt="Sign Bridge"`, creating redundant announcement |
| `components/landingpage/AnimatedHero.tsx` | 299 | `CrowdCanvas` renders many `<img>` elements without any `alt` attribute — should be `alt=""` (decorative) |
| General | — | Color contrast: `var(--text-3)` on `var(--surface)` in dark mode (`#6080A0` on `#152332`) should be verified against WCAG AA (4.5:1 for normal text) |

### 6.9 Broken/Error-Prone Patterns

| File | Issue |
|---|---|
| `components/landingpage/ResponsiveDesign.tsx` | Injects `<style>` with `@keyframes lscan` which duplicates the same animation already defined in `globals.css` — will cause an animation naming conflict in the same page context |
| `components/landingpage/ResponsiveDesign.tsx` | `handy-mockup` and `handy-flex` CSS classes are defined in an inline `<style>` tag rather than in `globals.css` — breaks component isolation |
| `components/landingpage/GlobeSection.tsx` | `globeRef` is typed `any` (line 49) — loses TypeScript safety on the react-globe.gl ref API |
| `components/dashboard/shared/TopNav.tsx` / `Header.tsx` / `LogoLoader.tsx` | All three independently set up their own `MutationObserver` on `document.documentElement` to detect theme changes — should be a single shared hook (e.g., `useTheme()` from `next-themes` which is already installed) |
| `components/landingpage/AuthOverlay.tsx` | Reads `window.location.search` directly (line 11) outside a `useEffect` — will throw during SSR even though the `typeof window` guard exists, because the component is `"use client"` but Next.js pre-renders it |
