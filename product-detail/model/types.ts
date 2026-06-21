// Domain types. Issue 6: real names (was Item/R/Rec/CItem). Issue 7: one Product; list types derive from it.

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY'; // Issue 27: was an untyped `string`

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  salePrice?: number;
  currency: Currency;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
}

// Issue 7: a product as shown in a list — derived from Product so it can't drift.
export type ProductSummary = Pick<Product, 'id' | 'name' | 'price' | 'currency' | 'images'>;

export type Recommendation = ProductSummary; // Issue 7: was Rec (no currency → the Issue 30 bug)

export interface Review {
  id: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedImageUrl: string;
}

// Issue 29: typed unions instead of magic strings.
export type TabKey = 'description' | 'reviews' | 'delivery';
export type ReviewSort = 'newest' | 'highest' | 'lowest';

// Issue 21: comes from the server (discount is a fraction, e.g. 0.1).
export interface CouponResult {
  valid: boolean;
  discount: number; // fraction 0..1
  message: string;
}

// Issue 18: from the server.
export interface DeliveryEstimate {
  days: number;
}
