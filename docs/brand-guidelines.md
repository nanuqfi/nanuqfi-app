# NanuqFi Brand Guidelines

## Identity

**Name:** NanuqFi (nanuq = Inuit for polar bear + fi = finance)
**Tagline:** "Yield, Routed."
**Personality:** Resilient, precise, calm under pressure — like the arctic bear navigating harsh terrain with purpose.

## Color Palette

### Primary
- **Ice Blue** `#0EA5E9` — Primary action, links, active states (sky-500)
- **Polar White** `#F8FAFC` — Background, cards (slate-50)
- **Deep Arctic** `#0F172A` — Primary text, dark surfaces (slate-900)

### Secondary
- **Frost** `#E2E8F0` — Borders, dividers, subtle backgrounds (slate-200)
- **Glacier** `#1E293B` — Dark card backgrounds, secondary surfaces (slate-800)
- **Snow** `#F1F5F9` — Hover states, subtle highlights (slate-100)

### Semantic
- **Aurora Green** `#10B981` — Positive/profit, success states (emerald-500)
- **Warning Amber** `#F59E0B` — Warnings, moderate risk (amber-500)
- **Danger Red** `#EF4444` — Errors, high risk, losses (red-500)

### Risk Tier Colors
- **Conservative** `#10B981` — Emerald (safe, growth)
- **Moderate** `#0EA5E9` — Sky blue (balanced, primary)
- **Aggressive** `#F59E0B` — Amber (caution, high reward)

## Typography

- **Display/Headlines:** `font-sans` (Inter/system) — bold, tight tracking
- **Body:** `font-sans` — regular weight, relaxed line height
- **Mono/Data:** `font-mono` (Fira Code/system) — for numbers, addresses, APY values
- **Scale:** text-xs (12), text-sm (14), text-base (16), text-lg (18), text-xl (20), text-2xl (24), text-4xl (36)

## Spacing

4px base grid. Use Tailwind spacing scale: 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px).

## Border Radius

- **Components:** rounded-xl (12px) — cards, modals
- **Buttons:** rounded-lg (8px)
- **Badges/Pills:** rounded-full
- **Inputs:** rounded-lg (8px)

## Motion

- **Duration:** 150ms for micro-interactions, 300ms for layout transitions
- **Easing:** ease-out for entrances, ease-in for exits
- **Principle:** Motion should feel deliberate, never bouncy. Arctic precision.

## Component Design Principles

1. **Data-first:** Numbers are the hero. Large, mono-spaced, high contrast.
2. **Progressive disclosure:** Overview → Detail. Don't overwhelm on first view.
3. **Transparency as UX:** Every allocation, every decision, every guardrail is visible.
4. **Dark mode native:** Design for dark first (Glacier/Deep Arctic backgrounds). Light mode is secondary.
5. **No decoration without purpose:** Every visual element carries information.

## Iconography

Minimal, line-based icons. Use Lucide React (consistent with Next.js ecosystem). No filled icons except for active states.

## Voice & Tone

- **Direct:** "Your USDC earns 18.4% APY" not "We help optimize your yield"
- **Transparent:** Show the math, show the logic, show the risk
- **Confident but humble:** State facts, acknowledge uncertainty (Wallahu a'lam)
