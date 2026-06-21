# Task 1 — Code Audit

Key issues found in the original `ProductPageClient.tsx`, before refactoring. Each is marked in place
with `// Issue N` and addressed in the `product-detail/` refactor — most are fully fixed; a few are
partial or remain known limitations (Issue 22 cart-vs-stock on repeated add, Issue 29 arrow-key tab
navigation, Issue 35 runtime schema validation). Issues 1–30 are the first pass; 31–35 came from a
second review.

Issue 1: One giant component does everything — data fetching, business logic, storage, analytics,
and UI. Nothing can be tested, reused, or changed on its own.

Issue 2: Server data is fetched directly inside useEffect (5 times), with no data layer — loading,
errors, caching, dedup, and cancellation are all hand-rolled.

Issue 3: Nothing is centralized — error handling, constants, styles, and user-facing text are all
inline and scattered.

Issue 4: Lots of copy-paste — the same fetch block five times, repeated price formatting, repeated
spacing.

Issue 5: Doesn't follow conventions — naming, types, and exports.

Issue 6: Type names (Item / R / Rec / CItem) that are hard to read. Should be
Product / Review / Recommendation / CartItem.

Issue 7: (nice-to-have) Each type is shaped on its own instead of derived from one Product. Not a
bug by itself — the real consequence is that Rec has no currency, which is Issue 30.

Issue 8: Uses `export default` instead of a named export.

Issue 9: About 20 useState, roughly half unneeded — server data and loading belong in a cache,
some values are derivable, and the analytics flag should be a ref.

Issue 10: The same hardcoded admin token is in every fetch, and the header is inverted (name
`Bearer`, value `Authorization …`), so it wouldn't even authenticate.

Issue 11: The product fetch has no cancellation (fast changes race each other) and lists `quantity`
in its dependencies, so editing the quantity refetches the whole product.

Issue 12: The reviews fetch uses `method: void 0` (dead code) and turns a failed request into an
empty list — you can't tell "no reviews" from "failed".

Issue 13: The recommendations effect depends on the whole product object and runs before `category`
is known, firing a useless `category=undefined` request.

Issue 14: The recently-viewed effect calls setState on a value it also depends on → infinite render
loop.

Issue 15: The cart is read from localStorage with `JSON.parse` and no try/catch — corrupt storage
crashes the page on mount.

Issue 16: A second effect saves the cart on mount with the empty initial value, overwriting the
saved cart before it has loaded.

Issue 17: The analytics request is fire-and-forget and marks "sent" even when it fails, so a failed
event is lost forever.

Issue 18: The delivery fetch uses an invalid method `GETTER` instead of `GET`; the server rejects
it, so delivery never loads.

Issue 19: Quantity is wired with `getElementById` + `addEventListener` instead of React, and the
input has no `onChange`, so it's effectively read-only.

Issue 20: `finalPrice` is a useMemo over trivial math; `||` treats a salePrice of 0 as "no sale",
and `quantity` is listed as a dependency it never uses.

Issue 21: Coupon codes and discounts are hardcoded on the client; `WELCOME10` sets a 100% discount.
This belongs on the server.

Issue 22: Add-to-cart doesn't merge by id (duplicate lines), writes twice (state + localStorage),
uses a blocking `alert()`, and never checks stock.

Issue 23: The wishlist toggle has no click guard, updates optimistically with no rollback (the UI
lies on failure), and never loads the real status from the server.

Issue 24: `renderStars` is a JSX-returning helper but should be a component.

Issue 25: Three near-identical `<main>` guard returns, and the error button does a full
`window.location.reload()` instead of a targeted retry.

Issue 26: Thumbnails render `<Image>`, which is never imported (crash); the main image uses `<img>`
(inconsistent); fixed pixel sizes and a desktop-only two-column layout.

Issue 27: The price markup is duplicated, and `.toFixed(2)` hardcodes two decimals (wrong for
currencies like JPY).

Issue 28: Coupon and delivery are the same "label + input + message" shape, not extracted into a
shared field.

Issue 29: Tabs are plain buttons with no ARIA roles or keyboard support, and there are no
empty/error states.

Issue 30: List cards navigate with `<a href>` (full page reload) instead of client routing, use a
fixed non-responsive grid, and show the recommendation price in the page's currency.

Issue 31: Responses are used without checking `res.ok` — an error response is treated as real data.

Issue 32: Clearing the coupon field and re-applying leaves the previous discount active (the empty
branch doesn't reset it).

Issue 33: JSON request bodies are sent without a `Content-Type: application/json` header.

Issue 34: Query params are interpolated into URLs without `encodeURIComponent` (e.g. `postcode`,
which is user input).

Issue 35: No runtime validation.
