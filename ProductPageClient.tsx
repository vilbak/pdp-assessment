// Legacy product page — audited in place. Each problem is marked `// Issue N` right
// where it happens; Issues 1–30 are fixed in product-detail/. 31–35 are extra findings from a second review.
//
// General problems (the whole file, not one line):
//   Issue 1  — one giant component does everything: fetching, logic, storage, analytics, UI.
//   Issue 2  — data is loaded straight inside useEffect (5×), with no data layer.
//   Issue 3  — nothing is centralized: errors, constants, styles, and text are all inline.
//   Issue 4  — lots of copy-paste: the fetch block ×5, price formatting, spacing.
//   Issue 5  — doesn't follow naming/type/export conventions.
//   Issue 10 — the same hardcoded auth token in every fetch, and the header is back-to-front.

import React, { useEffect, useMemo, useState } from 'react';

// Issue 6 — unclear, cryptic type names (Item / R / Rec / CItem); hard to read.
//   Should be Product / Review / Recommendation / CartItem.
type Item = {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: string; // Issue 7/Issue 27 — untyped string; should be a Currency union
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
};

type R = {
  id: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
};

// Issue 7 (nice-to-have, not a bug) — each type is shaped on its own instead of derived
//   from one Product. The real consequence — Rec has no `currency` — is the bug in Issue 30.
type Rec = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type CItem = {
  productId: string;
  quantity: number;
  selectedImage: string;
};

// Issue 8 — uses `export default` instead of a named export.
export default function ProductPageClient({ productId }: { productId: string }) {
  // Issue 9 — 20 useState, about half unneeded: server data + loading belong in a query cache,
  //   discount/messages are derivable, analyticsSent should be a ref.
  const [product, setProduct] = useState<Item | null>(null);
  const [reviews, setReviews] = useState<R[]>([]);
  const [recommendations, setRecommendations] = useState<Rec[]>([]);
  const [cart, setCart] = useState<CItem[]>([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [postcode, setPostcode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Item[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState('');
  const [analyticsSent, setAnalyticsSent] = useState(false);
  const [sortReviewsBy, setSortReviewsBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('description');

  // Issue 11 — two bugs in the product fetch: no request cancellation (rapid changes race),
  //   and `quantity` is in the deps, so editing the quantity refetches the whole product.
  useEffect(() => {
    setLoadingProduct(true);
    setError('');
    fetch(`/api/products/${productId}?quantity=${quantity}`, {
      headers: {
        'Bearer': 'Authorization admin_12345438905734895709' // Issue 10 — committed token, inverted header
      }
    })
      // Issue 31: response used without checking res.ok — an error response is treated as data
      //   (same in the reviews/recommendations fetches). Issue 35: `data` is trusted as typed, with no
      //   runtime validation, so a wrong shape (missing images, null price) crashes the render.
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setSelectedImage(data.images[0]);
        setLoadingProduct(false);
      })
      .catch(() => {
        setError('Could not load product');
        setLoadingProduct(false);
      });
  }, [productId, quantity]); // Issue 11 — `quantity` should not be a fetch input

  // Issue 12 — `method: void 0` does nothing (dead code), and a failed request becomes an empty list.
  useEffect(() => {
    setLoadingReviews(true);
    fetch(`/api/products/${productId}/reviews?sort=${sortReviewsBy}`, {
      method: void 0, // Issue 12
      headers: {
        'Bearer': 'Authorization admin_12345438905734895709' // Issue 10
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);
        setLoadingReviews(false);
      })
      .catch(() => {
        setReviews([]); // Issue 12 — a failed request looks exactly like "no reviews"
        setLoadingReviews(false);
      });
  }, [productId, sortReviewsBy]);

  // Issue 13 — re-runs on every new `product` object and fires before `category` is known,
  //   sending a useless `category=undefined` request.
  useEffect(() => {
    setLoadingRecommendations(true);
    fetch(`/api/recommendations?productId=${productId}&category=${product?.category}`, {
      method: undefined,
      headers: {
        Bearer: 'Authorization admin_12345438905734895709' // Issue 10
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data);
        setLoadingRecommendations(false);
      })
      .catch(() => {
        setRecommendations([]);
        setLoadingRecommendations(false);
      });
  }, [productId, product]); // Issue 13 — object dep + premature run

  // Issue 14 — infinite render loop: the effect updates `recentlyViewed` while depending on it.
  useEffect(() => {
    if (!product) return;
    const next = [product, ...recentlyViewed].slice(0, 5);
    setRecentlyViewed(next);
    localStorage.setItem('recentlyViewed', JSON.stringify(next));
  }, [product, recentlyViewed]); // Issue 14 — `recentlyViewed` dep + setRecentlyViewed

  // Issue 15 — reads the cart with JSON.parse and no try/catch; broken storage crashes on mount.
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      setCart(JSON.parse(saved)); // Issue 15
    }
  }, []);

  // Issue 16 — runs on mount with the empty cart and overwrites the saved cart before it loads.
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart)); // Issue 16
  }, [cart]);

  // Issue 17 — fire-and-forget request; marks analytics "sent" even when it fails, so the event is lost.
  useEffect(() => {
    if (!product || analyticsSent) return;
    fetch('/api/analytics/product-view', {
      method: 'POST',
      headers: {
        Bearer: 'Authorization admin_12345438905734895709' // Issue 10
      },
      // Issue 33: JSON body sent with no `Content-Type: application/json` (same on the wishlist POST/DELETE).
      body: JSON.stringify({
        productId: product.id,
        name: product.name,
        category: product.category,
        viewedAt: new Date().toISOString()
      })
    }); // Issue 17 — no .then/.catch
    setAnalyticsSent(true); // Issue 17 — set even if the request fails
  }, [product, analyticsSent]);

  // Issue 18 — `GETTER` isn't a real HTTP method (should be `GET`); the server rejects it, delivery never loads.
  useEffect(() => {
    if (!postcode) {
      setDeliveryMessage('');
      return;
    }
    // Issue 34: query params interpolated without encodeURIComponent — `postcode` is user input
    //   that could contain spaces/&/? and break the URL (same pattern in the other fetches).
    fetch(`/api/delivery/estimate?postcode=${postcode}&productId=${productId}`, {
      method: 'GETTER', // Issue 18
      headers: {
        Bearer: 'Authorization admin_12345438905734895709' // Issue 10
      }
    })
      .then(async (res) => {
        const r = await res.json();
        if (!res.ok) {
          throw new Error(r.message || 'Failed to check delivery');
        }
        return r;
      })
      .then((data) => {
        setDeliveryMessage(`Delivery available in ${data.days} days`);
      })
      .catch(() => {
        setDeliveryMessage('Could not check delivery right now');
      });
  }, [postcode, productId]);

  // Issue 20 — `||` treats a salePrice of 0 as "no sale"; plus a pointless useMemo with a `quantity` dep it never uses.
  const finalPrice = useMemo(() => {
    if (!product) return 0; // Issue 20 — 0 sentinel
    const basePrice = product.salePrice || product.price; // Issue 20 — `||` drops salePrice===0
    return basePrice - basePrice * discount;
  }, [product, discount, quantity]); // Issue 20 — `quantity` unused here

  // Issue 19 — quantity wired via getElementById instead of React; the input has no onChange, so it's read-only.
  useEffect(() => {
    const quantityInput = document.getElementById('quantity');
    quantityInput?.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const value = parseInt(target.value, 10);
      setQuantity(Number(isNaN(value) || value < 1 ? 1 : value));
    });
  }, []); // Issue 19

  // Issue 22 — adds to cart without merging by id (duplicate lines), writes twice, blocking alert(), no stock check.
  function addToCart() {
    if (!product) return;
    const newItem = {
      productId: product.id,
      quantity,
      selectedImage
    };
    setCart([...cart, newItem]); // Issue 22 — closure read + no merge
    localStorage.setItem('cart', JSON.stringify([...cart, newItem])); // Issue 22 — double write
    alert('Added to cart'); // Issue 22 — blocking alert
  }

  // Issue 21 — coupon codes and discounts are hardcoded on the client; WELCOME10 sets discount = 1 → 100% off.
  //   This belongs on the server.
  function apply() {
    if (couponCode === 'WELCOME10') {
      setDiscount(1); // Issue 21 — 100% off bug
      setCouponMessage('Coupon applied');
      return;
    }
    if (couponCode === 'SAVE20') {
      setDiscount(0.2); // Issue 21 — catalog hardcoded on client
      setCouponMessage('Coupon applied');
      return;
    }
    if (couponCode.trim().length === 0) {
      // Issue 32: returns without resetting `discount` — clearing the field after a coupon leaves the old discount active.
      setCouponMessage('Enter a coupon code');
      return;
    }
    setDiscount(0);
    setCouponMessage('Invalid coupon');
  }

  // Issue 23 — wishlist toggle: no click guard, no rollback on failure (UI lies), never loads the real status.
  function toggle() {
    if (!product) return;
    setIsWishlisted(!isWishlisted); // Issue 23 — optimistic, no rollback
    fetch('/api/wishlist', {
      method: isWishlisted ? 'DELETE' : 'POST',
      body: JSON.stringify({ productId: product.id }),
      headers: {
        Bearer: 'Authorization admin_12345438905734895709' // Issue 10
      }
    }).catch(() => {
      console.log('Wishlist request failed'); // Issue 23 — no user feedback, no revert
    });
  }

  // Issue 24 — renderStars is a JSX helper (should be a component), and `'☆'.repeat(5 - rounded)` crashes for rating > 5.
  function renderStars(rating: number) {
    const rounded = Math.round(rating);
    return (
      <span aria-label={`${rating} out of 5 stars`}>
        {'★'.repeat(rounded)}
        {'☆'.repeat(5 - rounded)}
      </span>
    );
  }

  // Issue 25 — three near-identical <main> guards, and the error button does a full window.location.reload() instead of a retry.
  if (loadingProduct) {
    return (
      <main style={{ padding: 32 }}>
        <p>Loading product...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Something went wrong</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload page</button>{/* Issue 25 */}
      </main>
    );
  }

  if (!product) {
    return (
      <main style={{ padding: 32 }}>
        <p>No product found.</p>
      </main>
    );
  }

  // Issue 26 — thumbnails use <Image>, which is never imported (crashes); the main image uses <img> (inconsistent),
  //   with fixed pixel sizes and a desktop-only two-column layout (not responsive).
  return (
    <main style={{ padding: 32 }}>
      <div style={{ display: 'flex', gap: 32 }}>
        <section style={{ width: '50%' }}>
          <div>
            <img src={selectedImage} alt={product.name} width={600} height={600} />{/* Issue 26 — <img> here, <Image> below */}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {product.images.map((image) => (
              <button
                key={image}
                onClick={() => setSelectedImage(image)}
                style={{
                  border: image === selectedImage ? '2px solid black' : '1px solid #ccc'
                }}
              >
                <Image src={image} alt="" width={80} height={80} />{/* Issue 26 — Image not imported */}
              </button>
            ))}
          </div>
        </section>
        <section style={{ width: '50%' }}>
          <p>{product.category}</p>
          <h1>{product.name}</h1>
          <p>SKU: {product.sku}</p>
          <div>
            {renderStars(product.rating)}
            <span> ({product.reviewCount} reviews)</span>
          </div>
          {/* Issue 27 — duplicated price markup; `.toFixed(2)` hardcodes 2 decimals (wrong for e.g. JPY). */}
          <div style={{ marginTop: 24 }}>
            {product.salePrice ? (
              <>
                <p style={{ textDecoration: 'line-through' }}>
                  {product.currency} {product.price.toFixed(2)}
                </p>
                <p style={{ fontSize: 28 }}>
                  {product.currency} {finalPrice.toFixed(2)}
                </p>
              </>
            ) : (
              <p style={{ fontSize: 28 }}>
                {product.currency} {finalPrice.toFixed(2)}
              </p>
            )}
          </div>
          <p>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>{/* Issue 27 — hardcoded copy */}
          {/* Issue 28 — coupon and delivery are the same "label + input + message" shape, not extracted into a shared field. */}
          <div style={{ marginTop: 24 }}>
            <label>
              Quantity
              <input type="number" value={quantity} id="quantity" min={1} />{/* Issue 19 — no onChange */}
            </label>
          </div>
          <div style={{ marginTop: 24 }}>
            <label>
              Coupon
              <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Enter coupon" />
            </label>
            <button onClick={apply}>Apply</button>
            <p>{couponMessage}</p>
          </div>
          <div style={{ marginTop: 24 }}>
            <label>
              Check delivery
              <input value={postcode} onChange={(event) => setPostcode(event.target.value)} placeholder="Postcode" />
            </label>
            <p>{deliveryMessage}</p>
          </div>
          <div style={{ marginTop: 24 }}>
            <button disabled={product.stock === 0} onClick={addToCart}>
              Add to cart
            </button>
            <button onClick={toggle}>{isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}</button>
          </div>
          <div style={{ marginTop: 24 }}>
            <p>Tags:</p>
            {product.tags.map((tag) => (
              <span key={tag} style={{ marginRight: 8 }}>
                #{tag}
              </span>
            ))}
          </div>
        </section>
      </div>
      {/* Issue 29 — tabs are plain buttons: no ARIA roles, no keyboard nav, no empty/error states. */}
      <section style={{ marginTop: 48 }}>
        <button onClick={() => setActiveTab('description')}>Description</button>
        <button onClick={() => setActiveTab('reviews')}>Reviews</button>
        <button onClick={() => setActiveTab('delivery')}>Delivery</button>
        {activeTab === 'description' && (
          <div>
            <h2>Description</h2>
            <p>{product.description}</p>
          </div>
        )}
        {activeTab === 'reviews' && (
          <div>
            <h2>Reviews</h2>
            <label>
              Sort by
              <select value={sortReviewsBy} onChange={(event) => setSortReviewsBy(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </label>
            {loadingReviews && <p>Loading reviews...</p>}
            {!loadingReviews &&
              reviews.map((review) => (
                <article key={review.id} style={{ borderTop: '1px solid #ddd' }}>
                  <h3>{review.author}</h3>
                  {renderStars(review.rating)}
                  <p>{review.body}</p>
                  <small>{review.createdAt}</small>
                </article>
              ))}
          </div>
        )}
        {activeTab === 'delivery' && (
          <div>
            <h2>Delivery and returns</h2>
            <p>Delivery estimates are calculated based on stock availability and your postcode.</p>
          </div>
        )}
      </section>
      {/* Issue 30 — cards use <a href> (full reload) instead of client routing, a fixed non-responsive grid,
          and show the recommendation price in the page's currency (the live Issue 7 bug). */}
      <section style={{ marginTop: 48 }}>
        <h2>You may also like</h2>
        {loadingRecommendations && <p>Loading recommendations...</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {recommendations.map((item) => (
            <article key={item.id}>
              <img src={item.image} alt={item.name} width={200} height={200} />
              <h3>{item.name}</h3>
              <p>
                {product.currency} {item.price.toFixed(2)}{/* Issue 30 — page product's currency */}
              </p>
              <a href={`/products/${item.id}`}>View product</a>{/* Issue 30 — full reload */}
            </article>
          ))}
        </div>
      </section>
      <section style={{ marginTop: 48 }}>
        <h2>Recently viewed</h2>
        {recentlyViewed.map((item) => (
          <article key={item.id}>
            <h3>{item.name}</h3>
            <p>
              {item.currency} {item.price.toFixed(2)}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
