import { useRecentlyViewedStore } from '../store';
import { tokens } from '../config/tokens';
import { strings } from '../config/strings';
import { ProductCard } from './ProductCard';

type Props = { onSelect?: (id: string) => void };

// Issue 30: reads the app-wide store directly; reuses ProductCard.
export const RecentlyViewed = ({ onSelect }: Props) => {
  const items = useRecentlyViewedStore((s) => s.items);
  const isEmpty = items.length === 0;
  if (isEmpty) return null;

  return (
    <section style={styles.section}>
      <h2>{strings.recentlyViewed}</h2>
      <div style={styles.list}>
        {items.map((item) => (
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
