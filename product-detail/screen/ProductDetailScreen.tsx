import { tokens } from '../config/tokens';
import {
  DeliveryEstimate,
  ProductGallery,
  ProductInfo,
  ProductTabs,
  RecentlyViewed,
  Recommendations,
  ScreenState,
} from '../components';
import { useProductDetailScreen } from './useProductDetailScreen';

type Props = { productId: string; onSelectProduct?: (id: string) => void };

// Issue 1: the original 479-line god component, split into this thin shell + slice.
// Issue 8: named export (no export default).
export const ProductDetailScreen = ({ productId, onSelectProduct }: Props) => {
  const vm = useProductDetailScreen(productId);
  const product = vm.product.data;

  if (vm.product.isLoading || vm.product.isError || !product) {
    return (
      <main style={styles.page}>
        <ScreenState
          isLoading={vm.product.isLoading}
          isError={vm.product.isError}
          onRetry={vm.product.refetch}
        />
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.row}>
        <ProductGallery {...vm.gallery} name={product.name} />
        <div style={styles.buyBox}>
          <ProductInfo
            product={product}
            discount={vm.discount}
            quantity={vm.quantity}
            coupon={vm.coupon}
            canAddToCart={vm.canAddToCart}
            addToCart={vm.addToCart}
            wishlist={vm.wishlist}
          />
          <DeliveryEstimate productId={product.id} />
        </div>
      </div>

      <ProductTabs productId={product.id} description={product.description} />
      <Recommendations
        productId={product.id}
        category={product.category}
        onSelect={onSelectProduct}
      />
      <RecentlyViewed onSelect={onSelectProduct} />
    </main>
  );
};

const styles = {
  page: { padding: tokens.spacing.lg },
  row: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.lg },
  buyBox: { flex: 1 },
} as const;
