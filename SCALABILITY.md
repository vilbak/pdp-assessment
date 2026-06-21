# Task 4 — Scalability

How the page handles the features it will need next, and where new complexity should go.
Short version: most of these are small, contained changes, because each concern already
lives in its own layer.

## The six features

**Personalised recommendations.**
Recommendations are already their own piece (`useRecommendationsQuery` + the `Recommendations`
component). To personalise them, add the user — and their recently-viewed ids — to the query
key and the request; the ranking itself stays on the server. Nothing else has to change. That
contained blast radius is the whole point of keeping the section isolated.

**A/B testing.**
Decide the variant in one place (the screen hook or a context) and include it in the query
keys. Components don't know which variant they're in, so none of them get rewritten.

**Advanced analytics.**
Events already go through the api client (e.g. `trackProductView`). New events are added
there — not sprinkled across components.

**Multi-currency.**
`Currency` is a real type and `formatPrice` uses `Intl` with each item's own currency. This
already works: the currency comes from the data, never hardcoded.

**Internationalisation (i18n).**
All user-facing text lives in `config/strings.ts` and dates use `Intl`. Later you swap
`strings.ts` for i18next / react-intl — there's no hardcoded copy to hunt down first.

**Server-side rendering (SSR).**
The api layer is plain async + React Query, which can prefetch on the server. This is the one
that needs care: the Zustand stores are module singletons, so on the server they'd leak state
between users (you'd give each request its own store), and `persist` touches `localStorage`
(guard it on the server).

## Where new complexity should live

- **Server** — anything that must be trusted or is heavy: coupon validity + discount,
  the real cart/wishlist, recommendation ranking, A/B assignment, the final stock check.
- **Client** — presentation and short-lived UI state only.
- **In between (`api/` + `data/`)** — turning server responses into typed, cached hooks.

Rule of thumb: if getting it wrong costs money or trust, it belongs on the server.

## How the folders grow

Today it's one flat slice, which is right for a single feature. When one part grows its own
logic (say reviews or recommendations), split it into its own sub-folder. When something is
needed by other features (the base client, tokens, the stores), move it up to the app level.
Don't split early — only when a folder actually starts to hurt.
