# CLAUDE.md - NanuqFi App

> **Ecosystem Hub:** See [nanuqfi/CLAUDE.md](https://github.com/nanuqfi/nanuqfi/blob/main/CLAUDE.md) for full ecosystem context

**Repository:** https://github.com/nanuqfi/nanuqfi-app
**Purpose:** Frontend dashboard — deposit/withdraw, vault transparency, keeper decision visibility

---

## Quick Reference

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS 4, TypeScript
**Deployment:** Docker → VPS reclabs3, port 9001, app.nanuqfi.com
**Tests:** 12 passing (error mapping)

**Key Commands:**
```bash
pnpm dev                        # local dev server (http://localhost:3000)
pnpm build                      # production build (standalone for Docker)
pnpm test                       # run tests
pnpm lint                       # ESLint
```

---

## Key Files

| Path | Description |
|------|-------------|
| `src/components/` | Custom component system (Button, Card, Badge, ProgressBar, Stat, Nav) |
| `src/providers/solana-provider.tsx` | Wallet adapter + connection provider |
| `src/hooks/use-allocator.ts` | On-chain data hooks (PDAs, balances, positions) |
| `src/hooks/use-keeper-api.ts` | Keeper REST API polling hooks |
| `src/lib/transactions.ts` | Transaction builders (deposit, request_withdraw, withdraw) |
| `src/lib/errors.ts` | Anchor error code → human message mapping |
| `src/lib/mock-data.ts` | Mock data + formatting utilities (formatUsd, formatApy) |
| `src/app/page.tsx` | Dashboard — real TVL, APY from on-chain + keeper API |
| `src/app/vaults/page.tsx` | Vault list with real data |
| `src/app/vaults/[riskLevel]/page.tsx` | Vault detail — deposit/withdraw + transparency layer |
| `src/app/activity/page.tsx` | Keeper decision timeline (real keeper API) |
| `docs/brand-guidelines.md` | Brand colors, typography, spacing, motion, voice |

---

## Brand Guidelines

**CRITICAL:** Read `docs/brand-guidelines.md` before any UI work.

- **Dark mode default** — slate-900 background, slate-50 text
- **Risk colors:** Conservative = emerald, Moderate = sky, Aggressive = amber
- **Data is the hero** — `font-mono` for all numbers (APY, TVL, addresses)
- **No decoration without purpose** — every visual element carries information

---

## Repo-Specific Guidelines

**DO:**
- Build ALL components from scratch — custom only
- Follow brand guidelines for every visual decision
- Use `font-mono` for all numeric values
- Format APY as percentage (18.4%), TVL with $ and commas ($320,000)
- Progressive disclosure — overview → detail

**DON'T:**
- Import shadcn, Radix, Chakra, or any UI component library
- Use generic themes — every color must come from brand guidelines
- Skip loading states or error states
- Put strategy logic in the frontend — frontend is a thin display layer

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard — total TVL, weighted APY, vault cards |
| `/vaults` | Vault list — 3 risk tiers with allocation bars |
| `/vaults/[riskLevel]` | Vault detail — transparency layer (allocations, guardrails, keeper decisions, history) |
| `/activity` | Keeper decision timeline with AI involvement badges |

---

**Last Updated:** 2026-03-15
