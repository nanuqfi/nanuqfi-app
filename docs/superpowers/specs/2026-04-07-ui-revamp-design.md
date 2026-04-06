# NanuqFi UI Revamp — Design Spec

**Date:** 2026-04-07
**Status:** Approved
**References:** Pendle Finance (visual language), Ethena Finance (data UX)

---

## Decisions

- **Scope:** Full rebuild — all pages, from scratch
- **Consolidation:** Merge `nanuqfi-web` (marketing) into `nanuqfi-app`. Kill `nanuqfi-web` after migration. One app, one domain, one codebase.
- **Audience:** DeFi-native. Data density, no hand-holding, power-user-first.
- **AI Transparency:** Woven throughout. Yield numbers are the hero, AI intelligence is embedded in every data point — not a dedicated section dominating the layout.
- **Visual Strategy:** Pendle skin + Ethena brain. Marketing pages = dramatic (glassmorphism, gradients, animations). App pages = data-dense and functional. Same design tokens, different volume.

---

## Design System

### Color Palette

**Base:**
- Background: `#080B11` (near-black)
- Surface 1: `rgba(15, 23, 42, 0.6)` + `backdrop-blur-xl` (glassmorphism cards)
- Surface 2: `rgba(30, 41, 59, 0.4)` (nested cards, inputs)
- Border: `rgba(148, 163, 184, 0.1)` (subtle glass edges)

**Risk Tier Accents (each tier owns a color family):**
- Conservative: `#10B981` emerald — safe, growth
- Moderate: `#0EA5E9` sky/cyan — balanced, primary brand accent
- Aggressive: `#F59E0B` amber — high reward, caution

**Semantic:**
- Profit: `#10B981` (emerald-500)
- Loss/Error: `#EF4444` (red-500)
- Warning: `#F59E0B` (amber-500)

### Typography

- Headlines: Inter 700-800, tracking `-0.02em`
- Body: Inter 400-500
- Financial data: Geist Mono (all numbers, APY, TVL, addresses, percentages)
- Marketing display: Inter 800 at 4rem+ with gradient text fills

### Card System (Glassmorphism)

```css
/* Base card */
background: rgba(15, 23, 42, 0.6);
backdrop-filter: blur(16px);
border: 1px solid rgba(148, 163, 184, 0.1);
border-radius: 16px;

/* Elevated (hover/focus) */
border: 1px solid rgba(148, 163, 184, 0.2);
box-shadow: 0 0 30px rgba(14, 165, 233, 0.05);

/* Risk-tinted */
border-left: 2px solid rgba({tier-color}, 0.4);
```

### Motion

- Micro-interactions: 150ms ease-out (buttons, hover)
- Layout transitions: 300ms ease-out (panels, modals)
- Marketing animations: 600-800ms with stagger (hero entrance, counters)
- Chart transitions: 200ms ease-in-out
- Principle: Deliberate, never bouncy. Arctic precision.

### Spacing

- 4px base grid
- Content max-width: 1280px (marketing), 1440px (dashboard)
- Page padding: `px-6` mobile, `px-8` tablet, `px-12` desktop

---

## Route Structure

```
/                       -> Marketing homepage
/app                    -> Dashboard (portfolio overview)
/app/vaults             -> Vault explorer (tier comparison)
/app/vaults/[riskLevel] -> Vault detail (deposit/withdraw)
/app/activity           -> AI decision log
```

- Marketing at `/`, app behind `/app` prefix
- `(app)` route group with shared layout (nav, status bar, wallet context)
- Marketing layout = standalone (no persistent nav)

### Navigation

**Marketing (`/`):** No persistent nav. Floating header with logo + "Launch App" CTA appears on scroll.

**App (`/app/*`):** Fixed top nav (h-16):
- Left: NanuqFi logo + wordmark
- Center: Dashboard | Vaults | Activity (pill-style active indicator)
- Right: System status dot (expandable) + Wallet button
- Style: `bg-slate-900/80 backdrop-blur-xl border-b border-white/5`

---

## Page Designs

### Marketing Homepage (`/`)

**Section 1 — Hero (full viewport):**
- Deep dark background with radial gradient glow (cyan center fading to dark)
- Display text: "Yield, Routed." (Inter 800, 5rem, gradient text fill cyan to white)
- Subtitle: "AI-powered yield routing across Solana DeFi. Deposit USDC. Pick your risk. Let the protocol work."
- 3 animated counter stats: TVL | Weighted APY | Protocols
- CTAs: "Launch App" (glassmorphism, cyan glow) + "View on GitHub" (ghost)
- Subtle animated grid/mesh CSS background

**Section 2 — How It Works (3-step):**
- 3 glassmorphism cards: Deposit -> Pick Risk -> Auto-Route
- Connected by animated dotted line
- Scannable in 5 seconds

**Section 3 — Risk Tiers (product showcase):**
- 3 cards side-by-side, each tier-colored (emerald/cyan/amber glow)
- Each: current APY, strategy description, protocol logos
- Subtle left-border glow per tier

**Section 4 — AI Transparency (differentiator):**
- Headline: "Every decision, explained."
- Mock keeper decision card: action, reasoning, confidence, timestamp
- AI indicator pulsing

**Section 5 — Performance Proof:**
- Backtest chart: NanuqFi router vs single-protocol over 2.5 years
- Metrics row: CAGR, Sharpe, Sortino, Max Drawdown
- Data from `backtest-results.json`
- Time-range selector

**Section 6 — Trust Bar:**
- Single row: "526 tests" | "27 on-chain instructions" | "Open source" | Protocol logos

**Section 7 — Footer:**
- Links: GitHub, Docs, X/Twitter
- "Built on Solana" badge

**Marketing Animations:**
- Hero counters: staggered entrance (200ms delay), count-up
- Section fade-in on scroll (IntersectionObserver, 300ms)
- CSS grid background animation (no JS)

---

### Dashboard (`/app`)

**Portfolio Summary** — full-width glassmorphism hero card:
- Total deposited value (large, mono)
- Daily earnings in dollars (hero metric, Ethena pattern)
- Weighted APY across all positions
- AI Pulse: colored dot + "Active Xm ago"

**Yield Chart** — Ethena-style:
- Time-range selector: 1W | 1M | 3M | 1Y | All
- Cumulative earnings line chart with protocol-colored area fills
- Crosshair hover with daily breakdown tooltip

**Vault Cards** — 3-column grid, Pendle-style:
- Each card: tier accent glow (emerald/cyan/amber left border)
- APY, daily earnings, deposited amount, AI confidence
- No position: "Deposit ->" CTA. Has position: "Details ->"
- Glassmorphism card, subtle hover elevation

**Recent AI Decisions** — compact feed (3 max):
- Icon + action + one-line reasoning + time + confidence
- "View all decisions ->" links to Activity page

---

### Vault Explorer (`/app/vaults`)

**Comparison Table** — 3-column, side-by-side:
- Column per risk tier, tier-colored headers
- Rows: APY, daily earnings, TVL, max drawdown, AI confidence
- Protocol allocation breakdown per vault
- Deposit CTA at bottom of each column

**Protocol Allocation Map** — Ethena Ecosystem Balance pattern:
- Horizontal stacked bars: aggregate capital across all protocols
- Protocol-colored, dollar amount + percentage
- Caption: "Where your capital lives across all vaults"

**Guardrails Summary** — 3 cards:
- Max drawdown per tier, rebalance frequency, deposit cap
- Tagline: "On-chain enforced. Not promises -- code."
- Program ID linked to source

---

### Vault Detail (`/app/vaults/[riskLevel]`)

**Layout:** 2-column (60/40 split). Left: data. Right: action panel (sticky).

**Vault Header:**
- Tier badge with glow, APY + daily earnings + TVL inline

**Yield Chart** (left):
- Time-range selector
- Multi-line per protocol, colored consistently
- Optional overlay: NanuqFi blended rate vs individual protocols

**Protocol Split** (left):
- Horizontal bars per protocol with percentage + current APY
- Expandable "why X%?" tooltip per protocol showing AI reasoning
- Core "woven AI" component

**Deposit/Withdraw Form** (right, sticky):
- Tab toggle: Deposit / Withdraw
- Amount input with max button, wallet balance
- Preview: estimated daily earnings at deposit amount
- AI context: one-line reasoning beneath CTA
- Glassmorphism card

**Decision History** (left):
- Vertical timeline, glassmorphism event cards
- Each: timestamp, action, weight change, one-line reasoning
- Last 10, "View all ->" to Activity

**Guardrails** (right):
- Max drawdown, rebalance frequency, deposit cap, keeper status
- Program ID (truncated, links to Solscan)

**Responsive:** Mobile = single column, form becomes sticky bottom sheet.

---

### Activity (`/app/activity`)

**Keeper Stats Bar** — full-width glassmorphism:
- Total decisions (30d), success rate, avg confidence, uptime (7d)

**Layout:** 2-column (60/40). Left: decision feed. Right: detail panel (sticky).

**Decision Feed** (left):
- Filters: action type (Rebalance/Hold/Alert) + risk tier dropdown
- Each entry: timestamp, action type, tier-colored dot, weight change shorthand, confidence
- Selected entry: tier-colored left border highlight
- Infinite scroll with "Load more"

**Detail Panel** (right, sticky):
- Appears when decision selected (default: latest)
- Full AI reasoning text
- Market snapshot: rates per protocol at decision time
- Confidence bar (visual)
- On-chain TX link (Solscan)
- Weight change visualization (before -> after)

**Responsive:** Mobile = single column, detail panel = slide-up sheet on tap.

---

## Component Inventory

### Shared (used across marketing + app)
- `GlassCard` — base glassmorphism card with optional tier-color tint
- `Button` — primary (cyan glow), secondary (glass), ghost, danger. 3 sizes.
- `Badge` — risk tier badges (emerald/cyan/amber)
- `AnimatedCounter` — count-up animation for metrics

### App Components
- `Nav` — fixed glassmorphism top bar with pill-style active state
- `SystemStatus` — collapsible status dot in nav
- `PortfolioSummary` — hero card (total value, daily earnings, APY, AI pulse)
- `YieldChart` — time-range line chart with protocol colors (3 variants: cumulative earnings on dashboard, APY-over-time on vault detail, router-vs-single on marketing)
- `VaultCard` — tier-colored card (APY, daily earnings, deposited, confidence)
- `ProtocolBar` — horizontal allocation bar with expandable AI reasoning
- `DepositForm` — tab toggle deposit/withdraw with daily earnings preview
- `GuardrailCard` — on-chain limit display with program link
- `DecisionFeedItem` — compact timeline entry
- `DecisionDetail` — full reasoning panel
- `KeeperStatsBar` — aggregate performance metrics
- `ConfidenceBar` — visual confidence percentage
- `AIContext` — inline one-liner reasoning (used beneath CTAs, next to allocations)

### Marketing Components
- `Hero` — full viewport with gradient, counters, CTAs
- `HowItWorks` — 3-step connected cards
- `TierShowcase` — 3 tier cards side-by-side
- `AITransparency` — mock decision card
- `PerformanceProof` — backtest chart + metrics
- `TrustBar` — stats + logos row
- `FadeIn` — scroll-based entrance animation wrapper

---

## Data Flow (unchanged architecture, new presentation)

- **On-chain:** `use-allocator.ts` — PDAs, positions, balances
- **Keeper API:** `use-keeper-api.ts` — vault data, decisions, AI insights
- **Backtest:** `backtest-results.json` — historical performance data
- **Fallback:** `fallback-keeper-data.json` + `mock-data.ts` — offline/demo mode

No new data sources required. All components consume existing hooks.

---

## Migration Plan (high-level)

1. Create new route structure (`/`, `/app/*`)
2. Build design system (tokens, GlassCard, Button, Badge, typography)
3. Build marketing homepage (7 sections)
4. Build app shell (nav, status, layout)
5. Build dashboard page
6. Build vault explorer
7. Build vault detail
8. Build activity page
9. Remove old components and `/pitch` route
10. Remove `nanuqfi-web` repo (after verifying nanuqfi.com DNS points to nanuqfi-app)
11. Update Docker/deploy config for consolidated app

---

## AI Designer MCP Usage

After spec approval, use AI Designer to generate Tailwind HTML mockups for:
1. Marketing hero section
2. Dashboard layout
3. Vault detail (2-column with deposit form)
4. Activity page (feed + detail panel)

Iterate on visuals, then use approved mockups as implementation reference.
