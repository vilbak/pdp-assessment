# Product Detail Page — Architecture & Refactoring Assessment

A take-home: a legacy 479-line React Product Detail Page, audited and refactored. This repo has the
audit, the refactored code, and short notes for each task.



## How to read this repo

1. **[REQUIREMENTS.md](./REQUIREMENTS.md)** — the brief (the four tasks).
2. **[ProductPageClient.tsx](./ProductPageClient.tsx)** — the original component. Every problem is marked
   in place as `// Issue N`. This is the "before".
3. **[AUDIT.md](./AUDIT.md)** — Task 1: the list of issues (1–35).
4. **[SCALABILITY.md](./SCALABILITY.md)** — Task 4: how the design scales.
5. **[product-detail/](./product-detail/)** — Task 2: the refactored code.
6. Tasks 2 (architecture) and 3 (performance) are written up below.

## Architecture (Task 2)

The one big component becomes a feature slice — one job per folder:

| Folder | Holds |
|---|---|
| `model/` | pure types + logic (pricing, cart, recently-viewed, rating). No React. |
| `config/` | design tokens + user-facing text. |
| `api/` | the fetch client (`core/`), auth (`auth/`), and the product endpoints (`products/`). |
| `data/` | React Query hooks over the api (caching, cancellation, gating). |
| `store/` | Zustand + persist stores (cart, recently-viewed). |
| `components/` | presentational pieces, plus a few sections that own their own data. |
| `screen/` | a thin shell + the `useProductDetailScreen` hook that wires it together. |

Server data comes from React Query; client state (cart, recently-viewed) lives in Zustand. Components
read from those directly, so nothing passes server data down by hand. Entry point:
`product-detail/index.ts` → `ProductDetailScreen`.

## Performance (Task 3)

- **No refetch on quantity change (Issue 11).** The old fetch listed `quantity` in its deps, so editing
  the quantity refetched the product. The query key is now just the product id; quantity is local UI state.
- **No infinite loop (Issue 14).** The old recently-viewed effect set state it also depended on. It's now
  a plain function (prepend + dedup + cap) called from a store action, so it can't loop.
- **No needless memo (Issue 20).** `finalPrice` was a `useMemo` over trivial math whose deps changed every
  render. It's a plain value now. Memo would only help later — e.g. a list card, if the lists get long and
  profiling shows it's needed.
- **Cancellation, dedup, caching (Issue 11).** Each query passes React Query's `signal` to `fetch`, so a
  stale product request is cancelled when you switch products (no race). React Query also dedups identical
  in-flight requests and caches per key; the view-tracking query fires once via `staleTime: Infinity`.

## Decisions & trade-offs

- **React Query for server data** (over SWR / RTK Query): caching, cancellation, and request dedup out of
  the box, and it keeps fetching out of components. RTK Query would pull in Redux, which this page doesn't
  otherwise need.
- **Zustand for client state** (over Context / Redux): cart and recently-viewed are small and must survive
  reloads — Zustand + `persist` does that with almost no boilerplate. Context would re-render half the tree;
  Redux is too much for two slices of state.
- **Sections own their data** (Reviews, Delivery, Recommendations each run their own query) instead of the
  screen hook fetching everything: each section stays independent and the screen stays thin. The cost:
  query keys are spread across files and SSR prefetch has to know them. Acceptable at this size.
- **Named exports + barrels** (no default exports): greppable, stable identity, painless renames.

## Tasks → files

| Task | Where |
|---|---|
| 1 — Audit | `AUDIT.md` + `// Issue N` in `ProductPageClient.tsx` |
| 2 — Architecture | `product-detail/` + "Architecture" above |
| 3 — Performance | "Performance" above |
| 4 — Scalability | `SCALABILITY.md` |
