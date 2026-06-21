import { useRecommendationsQuery } from '../data';
import { tokens } from '../config/tokens';
import { strings } from '../config/strings';
import { ProductCard } from './ProductCard';

type Props = { productId: string; category?: string; onSelect?: (id: string) => void };

// Issue 30: reuses ProductCard; responsive flex-wrap instead of a fixed 4-column grid.
export const Recommendations = ({ productId, category, onSelect }: Props) => {
  const recommendations = useRecommendationsQuery(productId, category);

  return (
    <section style={styles.section}>
      <h2>{strings.youMayAlsoLike}</h2>
      {recommendations.isLoading && <p>{strings.loadingRecommendations}</p>}
      <div style={styles.list}>
        {recommendations.data?.map((item) => (
          <ProductCard key={item.id} product={item} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
};

const styles = {
  section: { marginTop: tokens.spacing.xl },
  list: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacing.sm },
} as const;
