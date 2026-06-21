import { computeFinalPrice, formatPrice, type Product } from '../model';
import { tokens } from '../config/tokens';
import { strings } from '../config/strings';
import { RatingStars } from './RatingStars';
import { LabeledField } from './LabeledField';

type Props = {
  product: Product;
  discount: number;
  quantity: { value: number; set: (v: number) => void };
  coupon: {
    code: string;
    setCode: (v: string) => void;
    apply: () => void;
    message: string;
    isApplying: boolean;
  };
  canAddToCart: boolean;
  addToCart: () => void;
  wishlist: { isWishlisted: boolean; isToggling: boolean; toggle: () => void };
};

export const ProductInfo = ({
  product,
  discount,
  quantity,
  coupon,
  canAddToCart,
  addToCart,
  wishlist,
}: Props) => {
  const finalPrice = computeFinalPrice(product, discount); // Issue 20: plain value, no useMemo needed
  const isOnSale = finalPrice < product.price;
  const isInStock = product.stock > 0;
  const wishlistLabel = wishlist.isWishlisted ? strings.removeFromWishlist : strings.addToWishlist;

  return (
    <section style={styles.section}>
      <p style={styles.muted}>{product.category}</p>
      <h1 style={styles.title}>{product.name}</h1>
      <p style={styles.muted}>
        {strings.sku}: {product.sku}
      </p>

      <RatingStars rating={product.rating} reviewCount={product.reviewCount} />

      <div style={styles.block}>
        {isOnSale && <p style={styles.struck}>{formatPrice(product.price, product.currency)}</p>}
        <p style={styles.price}>{formatPrice(finalPrice, product.currency)}</p>
      </div>

      <p>{isInStock ? strings.inStock(product.stock) : strings.outOfStock}</p>

      <div style={styles.block}>
        <label>
          {strings.quantity}
          <input
            type="number"
            min={1}
            value={quantity.value}
            onChange={(e) => quantity.set(Number(e.target.value))}
          />
        </label>
      </div>

      <LabeledField
        label={strings.coupon}
        value={coupon.code}
        onChange={coupon.setCode}
        placeholder={strings.couponPlaceholder}
        message={coupon.message}
        action={
          <button type="button" onClick={coupon.apply} disabled={coupon.isApplying}>
            {strings.apply}
          </button>
        }
      />

      <div style={styles.block}>
        <button type="button" onClick={addToCart} disabled={!canAddToCart}>
          {strings.addToCart}
        </button>
        <button type="button" onClick={wishlist.toggle} disabled={wishlist.isToggling}>
          {wishlistLabel}
        </button>
      </div>

      <div style={styles.block}>
        <p>{strings.tags}:</p>
        {product.tags.map((tag) => (
          <span key={tag} style={styles.tag}>
            #{tag}
          </span>
        ))}
      </div>
    </section>
  );
};

const styles = {
  section: { width: '100%' },
  muted: { color: tokens.colors.textMuted },
  title: { fontSize: tokens.fontSize.title },
  block: { marginTop: tokens.spacing.md },
  struck: { textDecoration: 'line-through', color: tokens.colors.textMuted },
  price: { fontSize: tokens.fontSize.price },
  tag: { marginRight: tokens.spacing.xs },
} as const;
