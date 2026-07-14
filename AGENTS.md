<!-- Satellite context file — extends the global hub (~/.claude/CLAUDE.md | ~/.pi/agent/AGENTS.md). Host-neutral; project-specific only. Do not duplicate hub standards here. -->

# NanuqFi App

> Consolidated frontend — marketing homepage, yield dashboard, vault management, AI activity log, strategy documentation.

**Ecosystem hub:** See [nanuqfi/nanuqfi/AGENTS.md](https://github.com/nanuqfi/nanuqfi/blob/main/AGENTS.md) for full ecosystem context.

## Quick Reference

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript, Vitest
**Deployment:** Vercel (`rectors-projects/nanuqfi-app`) — auto-deploy on push to `main` via GitHub App
**Domains:** `nanuqfi.com` (apex, primary) + `www.nanuqfi.com` (308 → apex) + `app.nanuqfi.com` (308 → `nanuqfi.com/app`, path preserved)
**Tests:** 165 passing — 141 unit (Vitest + jsdom) + 24 E2E (Playwright)
**Design System:** Pendle glassmorphism + Ethena data UX hybrid (spec: `docs/superpowers/specs/2026-04-07-ui-revamp-design.md`)

**Key Commands:**
```bash
pnpm dev          # local dev server (http://localhost:3000)
pnpm build        # production build
pnpm test         # run unit tests (141 tests, Vitest + jsdom)
pnpm test:e2e     # run E2E tests (24 tests, Playwright)
pnpm lint         # ESLint
```

## Route Structure

| Route | Purpose |
|---|---|
| `/` | Marketing homepage — hero, how-it-works, tier showcase, AI transparency, performance proof, trust bar |
| `/strategy` | Hackathon strategy documentation — pitch-style, judges read this |
| `/app` | Dashboard — portfolio summary, yield chart, vault cards, AI decisions feed |
| `/app/vaults` | Vault explorer — 3-column comparison table, protocol allocation map, guardrails |
| `/app/vaults/[riskLevel]` | Vault detail — 2-column layout: yield chart + protocol split + decisions (left), deposit form + guardrails (right, sticky) |
| `/app/activity` | AI activity log — keeper stats, filterable decision feed + detail panel |

**Architecture:** Marketing at `/` (standalone layout), app behind `/app` (shared layout with nav + wallet + status bar). Strategy at `/strategy` (standalone).

## Component Architecture

```
src/components/
  ui/                     # Shared design system primitives
    glass-card.tsx        # Glassmorphism card (tier tint, elevated variant)
    button.tsx            # 4 variants (primary/secondary/ghost/danger), 3 sizes
    badge.tsx             # Risk tier badges (emerald/cyan/amber + icons)
    confidence-bar.tsx    # Horizontal fill bar with percentage
    animated-counter.tsx  # Count-up animation for metrics
    fade-in.tsx           # Scroll-triggered entrance animation
    time-range-selector.tsx  # 1W/1M/3M/1Y/All pill tabs
    toast.tsx             # Toast notification system (success/error/info)
  app/                    # App-specific components
    nav.tsx · system-status.tsx · portfolio-summary.tsx · yield-estimator.tsx
    vault-card.tsx · yield-chart.tsx · protocol-bar.tsx · deposit-form.tsx
    guardrail-card.tsx · decision-feed-item.tsx · decision-detail.tsx
    keeper-stats-bar.tsx · ai-context.tsx · onboarding-guide.tsx · devnet-banner.tsx · wallet-guard.tsx
  marketing/              # Marketing homepage sections
    hero.tsx · how-it-works.tsx · tier-showcase.tsx · ai-transparency.tsx
    performance-proof.tsx · trust-bar.tsx · footer.tsx
```

## Design System

**Background:** `#080B11` (near-black)
**Glassmorphism:** `bg rgba(15,23,42,0.6) backdrop-blur-xl border rgba(148,163,184,0.1) rounded-2xl`
**Risk Tier Colors:** Conservative = emerald, Moderate = sky/cyan, Aggressive = amber
**Typography:** Inter (text), Geist Mono (all financial data)
**Motion:** 150ms micro-interactions, 300ms layout, deliberate not bouncy

CSS utilities defined in `globals.css`: `.glass`, `.glass-elevated`, `.tabular-nums`

## Key Files

| Path | Description |
|------|-------------|
| `src/providers/solana-provider.tsx` | Wallet adapter + connection provider |
| `src/hooks/use-allocator.ts` | On-chain data hooks (PDAs, balances, positions) |
| `src/hooks/use-keeper-api.ts` | Keeper REST API polling hooks |
| `src/lib/transactions.ts` | Transaction builders (deposit, request_withdraw, withdraw) |
| `src/lib/errors.ts` | Anchor error code → human message + wallet rejection detection |
| `src/lib/mock-data.ts` | Mock data + formatting utilities (formatUsd, formatApy) |
| `src/app/globals.css` | Design system tokens + glassmorphism utilities + animations |
| `src/app/api/airdrop/route.ts` | Test USDC faucet for devnet (judge onboarding) |
| `src/app/api/rpc/route.ts` | Server-side RPC proxy (hides Helius API key) |
| `e2e/` | Playwright E2E suite (10 spec files, 24 tests) |
| `docs/brand-guidelines.md` | Brand colors, typography, spacing, motion, voice |

## Transaction Flow

Deposit/withdraw is fully wired:
1. User enters amount in DepositForm → clicks "Confirm Deposit"
2. `buildDepositInstruction()` from `src/lib/transactions.ts` builds the instruction
3. Wallet adapter `sendTransaction()` submits to Solana
4. `confirmTransaction()` waits for confirmation
5. Success/error toast via `useToast()` from toast provider
6. `onSuccess` callback refreshes on-chain data

Withdraw uses two-phase: `buildRequestWithdrawInstruction` → `buildWithdrawInstruction` (chained on devnet where redemption period = 0).

## Repo-Specific Guidelines

**DO:**
- Build ALL components from scratch — custom only
- Follow glassmorphism design system (`.glass` cards, tier colors)
- Use `font-mono` for all numeric values
- Progressive disclosure — overview → detail
- Data cascade: on-chain > keeper API > mock fallback

**DON'T:**
- Import shadcn, Radix, Chakra, or any UI component library
- Use generic themes — every color from design system
- Skip loading states or error states
- Put strategy logic in frontend — frontend is a thin display layer