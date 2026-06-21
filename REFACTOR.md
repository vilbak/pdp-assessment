# Product Detail — Refactor notes (Tasks 2–4)

Companion to the Task-1 audit (`AUDIT.md`, findings Issue 1–Issue 35). This is a **mock / assessment
artifact**: APIs are not real, the project is not wired to run. It targets its own future repo, so a
few things below are *assumed* rather than installed.

## Assumed dependencies

Used by the refactor; must be installed in the real repo (only `@tanstack/react-query` exists in the
host `package.json` today — `zustand` does **not**, so a scoped `tsc` against the host fails on the
store imports until it's added):

- `react`, `react-dom`
- `@tanstack/react-query` — server state (queries/mutations, cache, cancellation)
- `zustand` (+ `zustand/middleware` `persist`) — app-wide client state (cart, recently-viewed)
- dev: `vitest` (unit tests), `@testing-library/react` (component tests, Tier 2)

**Type-check status (deps intentionally NOT installed — left as-is for the mock).** `tsc` on the slice
reports 18 errors, **all environmental — zero real type bugs in the slice's own code**:
- 8× TS2307 (cannot find module): `zustand` + `zustand/middleware` (×4) and `vitest` (×4) — missing deps.
- 10× TS7006 (implicit any): `set`/`state`/selectors in both stores, `useProductDetailScreen`, and
  `RecentlyViewed` — **all cascade from `zustand` being unresolved** (`create`/`persist` fall back to `any`).

Installing `zustand` alone clears **14 of 18** (`CartState`/`RecentlyViewedState` are already typed, so
inference returns); `vitest` clears the other 4. The slice has **no literal `any`**.

---

## Task 2 — Architecture (summary)

429-line God component → a feature slice. Layers, each one responsibility:

| Layer | Owns | Key findings fixed |
|---|---|---|
| `config/` | tokens, strings | Issue 3, Issue 26, Issue 27 |
| `model/` | pure types + logic (pricing, cart, recently-viewed, rating) | Issue 6, Issue 7, Issue 14, Issue 19, Issue 20, Issue 22, Issue 24 |
| `api/core/` + `api/auth/` | **app-level** base client + auth (`core/httpClient`, `auth/auth`) — mirrors `src/api/core` + `src/api/auth` | Issue 10, Issue 12/Issue 18 |
| `api/products/` | product **domain** endpoints (`productsApi`) — mirrors `src/api/<domain>/<domain>Api` (e.g. `ums/umsApi`) | — |
| `data/` | React Query hooks wrapping the api | Issue 11, Issue 13, Issue 17, Issue 18, Issue 21, Issue 23 |
| `store/` | Zustand+persist stores (cart, recently-viewed) | Issue 14, Issue 15, Issue 16, Issue 22 |
| `components/` | presentational leaves (props-only) **+** self-contained section components (own their query/state) | Issue 23–Issue 30 |
| `screen/` | thin shell + `useProductDetailScreen` orchestrator (Facade) | Issue 1, Issue 8, Issue 9 |

Data flow: **components/screen subscribe to the React Query cache and Zustand stores; nothing passes
server data by hand.** The orchestrator composes sub-hooks + holds ~3 genuine UI states; peripheral
sections (reviews, delivery, recommendations, tabs) are self-contained.

**Two kinds in `components/` (not all are "dumb"):** *presentational leaves* (props only —
`RatingStars`, `ProductCard`, `LabeledField`, `ScreenState`, `ProductGallery`, `ProductInfo`) and
*self-contained section components* that own their query/state (`Reviews`, `DeliveryEstimate`,
`Recommendations`, `RecentlyViewed` use a query/store; `ProductTabs` owns UI state). The orchestrator
owns the **shared** buy-box data; **isolated** sections own theirs (colocate-first).

**API layering (ownership split — deliberate, not a dumping ground).** Three concerns, three owners:
1. **App-level base client + auth** (`api/core/httpClient.ts` + `api/auth/auth.ts`): request, auth
   header, parsing, shared errors. Mirrors cvMobile `src/api/core` (`authenticatedFetch`) + `src/api/auth`
   — app-level infrastructure (stand-in, simplified).
2. **Domain endpoints** (`api/products/productsApi.ts`): product / reviews / recommendations / delivery /
   coupon / wishlist — raw, no React. Mirrors cvMobile `src/api/<domain>/<domain>Api.ts` (e.g. `ums/umsApi.ts`).
3. **Data orchestration** (`data/`): React Query hooks — query keys, `enabled`, cache/invalidation,
   cancellation.

> `api/` mirrors cvMobile's app-level api layer (`src/api/{core, auth, <domain>}`): `core/` base client,
> `auth/`, `products/` domain endpoints. The feature's `data/` owns the React Query hooks that wrap it.
> In a real multi-feature app this whole `api/` lives at `src/api/`, shared across features.

So `api/` separates transport/endpoints from React data orchestration — intentional layering, not overengineering.

---

## Task 3 — Performance

**Unnecessary fetching**
- *Product refetch on quantity change* (Issue 11): the old effect depended on `quantity`, so changing it
  refetched the product. Now `useProductQuery` is keyed on `['pdp','product',productId]` only — quantity
  is local UI state, never a fetch input.
- *Recommendations cascade* (Issue 13): the old effect depended on the whole `product` object (new reference
  each fetch) and fired before `category` existed. Now keyed on the **primitive** `category` with
  `enabled: Boolean(category)` — no `category=undefined` request, no object-reference re-runs.

**Infinite-loop risk** (Issue 14): the old `recentlyViewed` effect did `setState([product, ...list])` while
depending on `list` → infinite. Now it's a **Zustand action called on the product-load event** (a pure
prepend+dedup+cap), so there is no self-referential effect — the loop is structurally impossible.

**Expensive / harmful memoization** (Issue 20): `finalPrice` was a `useMemo` over trivial arithmetic whose
deps changed almost every render → pure overhead. Now a plain derived value (`computeFinalPrice`).
- *Where memo would help (not yet added — measure first):* `ProductCard` under `React.memo` if the
  recommendation / recently-viewed lists grow large and profiling shows render pressure.
- *Where it's harmful/unnecessary:* wrapping trivial derivations or always-changing values (the Issue 20 case).
  No `React.memo`/`useMemo`/`useCallback` is added speculatively.

**React Query gains for free:** request **cancellation** via `{ signal }` (race fix, Issue 11/Issue 18), per-key
**caching** (e.g. reviews cached per sort), **dedup** of identical in-flight requests, and
`enabled`-gating.

---

## Task 4 — Scalability

See **[`SCALABILITY.md`](./SCALABILITY.md)** — the six features the page must support (personalised
recommendations, A/B testing, analytics, multi-currency, i18n, SSR), where new complexity should live
(client / server / in between), and how the folders grow.

---

## Known limitations (honest)

- **`zustand` not declared** in the host `package.json` (assumed dep; install in the real repo).
- **Cart can exceed stock on repeated add:** `clampQuantity` bounds the *input*, but `addItemToCart`
  merges `line.quantity + item.quantity` with no upper cap. Decision: the client cart is optimistic and
  **stock is enforced server-side at checkout** (standard); if a client cap is wanted, pass available
  stock into `addItemToCart`. (Documented, not silent.)
- **Wishlist has no optimistic update/rollback** — deliberately simplified to mutate + invalidate-on-
  success (`isToggling` still guards double-clicks). Optimistic+rollback is an optional enhancement.
- **API client always calls `res.json()`** — would mis-handle a real `204 No Content` for the
  `Promise<void>` calls (`setWishlist`, `trackProductView`). Trivial guard (check 204 / content-length);
  left for real-API integration (mock here).
- **`formatPrice` not unit-tested** — locale-dependent `Intl`; better as a snapshot/integration test.

---

## Tests

- **Tier 1 (done):** pure `model/` units — `cart`, `pricing`, `recentlyViewed`, `rating`. No mocks;
  assert Issue 14/Issue 19/Issue 20/Issue 22/Issue 24. Run: `pnpm add -D vitest && vitest run` (**not yet executed** — no runner here).
- **Tier 2 (planned):** component render tests (React Testing Library) — sale price vs struck original,
  add-to-cart disabled when out of stock, wishlist label toggles, tab `aria-selected`.
- **Tier 3 (planned, lower value):** data hooks with a `QueryClient` wrapper + mocked `fetch`; mostly
  exercises React Query behaviour, little unique logic.
