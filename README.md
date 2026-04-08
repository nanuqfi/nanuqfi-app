<div align="center">

```
 _   _    _    _   _ _   _  ___  _____ ___      _    ____  ____
| \ | |  / \  | \ | | | | |/ _ \|  ___|_ _|    / \  |  _ \|  _ \
|  \| | / _ \ |  \| | | | | | | | |_   | |    / _ \ | |_) | |_) |
| |\  |/ ___ \| |\  | |_| | |_| |  _|  | |   / ___ \|  __/|  __/
|_| \_/_/   \_\_| \_|\___/ \__\_\_|   |___| /_/   \_\_|   |_|
```

**Yield Dashboard + Marketing**

Glassmorphism design system. Deposit/withdraw. AI transparency. Every decision visible.

[![CI/Deploy](https://github.com/nanuqfi/nanuqfi-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/nanuqfi/nanuqfi-app/actions/workflows/deploy.yml)
![Tests](https://img.shields.io/badge/tests-26-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)

</div>

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Marketing homepage -- hero, how-it-works, tier showcase, AI transparency, performance proof |
| `/strategy` | Hackathon strategy documentation -- pitch-style, judges read this |
| `/app` | Dashboard -- portfolio summary, yield chart, vault cards, AI decisions feed |
| `/app/vaults` | Vault explorer -- 3-column comparison table with protocol allocation |
| `/app/vaults/[riskLevel]` | Vault detail -- deposit/withdraw + protocol split + AI reasoning |
| `/app/activity` | AI activity log -- keeper stats, filterable decision feed + detail panel |

Marketing lives at `/` (standalone layout). App behind `/app` (shared layout with nav + wallet + status bar). Strategy at `/strategy` (standalone).

---

## Design System

| Token | Value |
|---|---|
| Background | `#080B11` (near-black) |
| Glassmorphism | `bg rgba(15,23,42,0.6)` + `backdrop-blur-xl` + `border rgba(148,163,184,0.1)` |
| Conservative | Emerald |
| Moderate | Cyan / Sky |
| Aggressive | Amber |
| Body font | Inter |
| Financial data | Geist Mono |
| Motion | 150ms micro-interactions, 300ms layout transitions |

CSS utilities in `globals.css`: `.glass`, `.glass-elevated`, `.tabular-nums`

---

## Component Architecture

```
src/components/
  ui/        -- 8 shared primitives (GlassCard, Button, Badge, Toast, etc.)
  app/       -- 12 app components (Nav, PortfolioSummary, DepositForm, etc.)
  marketing/ -- 7 marketing sections (Hero, TierShowcase, PerformanceProof, etc.)
```

27 components total, all custom -- zero UI libraries.

---

## Features

- **On-chain transactions** -- deposit/withdraw wired to allocator program via wallet adapter
- **Toast notifications** -- success, error, info with auto-dismiss
- **Keeper health monitoring** -- real-time system status in nav bar
- **Protocol allocation** -- visual breakdown with expandable AI reasoning
- **Decision feed** -- full AI reasoning panels for every keeper action
- **Devnet banner** -- onboarding guide for testers with faucet links
- **Data cascade** -- on-chain > keeper API > mock fallback (always renders)

---

## Quick Start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build (standalone output)
pnpm test         # 26 tests (Vitest + jsdom)
pnpm lint         # ESLint
```

---

## Deployment

| | |
|---|---|
| Runtime | Docker (standalone Next.js) |
| Port | 9001 |
| Domains | `nanuqfi.com` (primary) + `app.nanuqfi.com` (alias) |
| CI/CD | GitHub Actions -> GHCR -> VPS auto-deploy on push to main |

`nanuqfi-web` (former marketing site) is retired and archived. Marketing is consolidated into this repository at `/`.

---

## Ecosystem

| Repository | Purpose |
|---|---|
| [nanuqfi](https://github.com/nanuqfi/nanuqfi) | Core monorepo -- SDK packages + Anchor program |
| [nanuqfi-keeper](https://github.com/nanuqfi/nanuqfi-keeper) | AI Keeper -- strategy bot with algorithm engine + Claude AI |
| [nanuqfi-app](https://github.com/nanuqfi/nanuqfi-app) | **This repo** -- dashboard + marketing frontend |

---

## License

Proprietary. All rights reserved.
