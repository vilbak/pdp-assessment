# Product Detail Page — Architecture & Refactoring Assessment

A take-home: a legacy 429-line React Product Detail Page, audited and refactored. This repo has the
audit, the refactored code, and short notes for each task.

> Mock: the APIs aren't real and the project doesn't run. `zustand` and `vitest` aren't installed, so a
> type-check shows missing-module errors. Those come from the missing packages, not from bugs in the code.

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

React Query also gives request cancellation, per-key caching, and dedup with no extra code.

## Known limitations (honest)

- **Cart vs stock (Issue 22):** quantity is clamped on input, but re-adding the same product keeps adding
  up with no cap. The client cart is optimistic; stock is checked on the server at checkout.
- **Keyboard tabs (Issue 29):** the tabs have ARIA roles but not full arrow-key navigation yet.
- **No runtime validation (Issue 35):** responses are trusted as typed. A schema check (e.g. zod) would
  close this.
- **Deps not installed:** `zustand` and `vitest` aren't in `package.json` here, so a type-check is red.
  Installing them clears it; there are no real type errors in the code.

## Tests

The pure `model/` logic is unit-tested (cart, pricing, recently-viewed, rating).
Run with `npm i -D vitest && npx vitest`.

## Tasks → files

| Task | Where |
|---|---|
| 1 — Audit | `AUDIT.md` + `// Issue N` in `ProductPageClient.tsx` |
| 2 — Architecture | `product-detail/` + "Architecture" above |
| 3 — Performance | "Performance" above |
| 4 — Scalability | `SCALABILITY.md` |
