import { formatPrice, type ProductSummary } from '../model';
import { tokens } from '../config/tokens';
import { strings } from '../config/strings';

type Props = { product: ProductSummary; onSelect?: (id: string) => void };

// Issue 30: one shared card for recommendations + recently-viewed; item's OWN currency; client-side nav.
export const ProductCard = ({ product, onSelect }: Props) => {
  const cover = product.images[0];

  return (
    <article>
      {cover && <img src={cover} alt={product.name} style={styles.image} />}
      <h3 style={styles.name}>{product.name}</h3>
      <p>{formatPrice(product.price, product.currency)}</p>
      {onSelect && (
        <button type="button" onClick={() => onSelect(product.id)}>
          {strings.viewProduct}
        </button>
      )}
    </article>
  );
};

const styles = {
  image: { width: '100%', height: 'auto' },
  name: { fontSize: tokens.fontSize.md },
} as const;
