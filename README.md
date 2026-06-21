# Product Detail Page — Architecture & Refactoring Assessment

A take-home exercise: a legacy 429-line React Product Detail Page was audited and refactored.
This repo holds the audit, the refactored code, and a short write-up for each task.

> **Mock / assessment artifact.** The APIs aren't real and the project isn't wired to run.
> `zustand` and `vitest` aren't installed, so a type-check shows missing-module errors — these
> are environmental, not bugs in the code (details in `REFACTOR.md` → "Type-check status").

## What to read, in order

1. **[REQUIREMENTS.md](./REQUIREMENTS.md)** — the original brief (the four tasks).
2. **[ProductPageClient.tsx](./ProductPageClient.tsx)** — the original component, with every problem
   marked in place as `// Issue N`. This is the "before".
3. **[AUDIT.md](./AUDIT.md)** — Task 1: every issue found (Issue 1–35), in plain language.
4. **[REFACTOR.md](./REFACTOR.md)** — Task 2 (architecture) and Task 3 (performance).
5. **[SCALABILITY.md](./SCALABILITY.md)** — Task 4: how the design scales.
6. **[product-detail/](./product-detail/)** — the refactored feature slice (the actual Task 2 code).

## How the tasks map to files

| Task | Where |
|---|---|
| 1 — Code audit | `AUDIT.md` + the `// Issue N` markers in `ProductPageClient.tsx` |
| 2 — Refactor architecture | `product-detail/` + `REFACTOR.md` |
| 3 — Performance | `REFACTOR.md` (Task 3 section) |
| 4 — Scalability | `SCALABILITY.md` |

## The refactored slice (`product-detail/`)

One feature, split by responsibility:

| Folder | Holds |
|---|---|
| `model/` | pure types + logic (pricing, cart, recently-viewed, rating) — no React |
| `config/` | design tokens + user-facing strings |
| `api/` | base client (`core/`) + auth (`auth/`) + product endpoints (`products/`) |
| `data/` | React Query hooks over the api (caching, cancellation, gating) |
| `store/` | Zustand + persist stores (cart, recently-viewed) |
| `components/` | presentational leaves + self-contained section components |
| `screen/` | thin shell + `useProductDetailScreen` orchestrator |

Entry point: `product-detail/index.ts` → `ProductDetailScreen`.
