import { clampRating } from '../model';
import { tokens } from '../config/tokens';
import { strings } from '../config/strings';

type Props = { rating: number; reviewCount?: number };

// Issue 24: was the `renderStars` helper → a real component;
export const RatingStars = ({ rating, reviewCount }: Props) => {
  const rounded = clampRating(rating);
  const hasCount = reviewCount !== undefined;

  return (
    <span role="img" aria-label={strings.ratingLabel(rating)} style={styles.stars}>
      {'★'.repeat(rounded)}
      {'☆'.repeat(5 - rounded)}
      {hasCount && <span style={styles.count}> ({reviewCount})</span>}
    </span>
  );
};

const styles = {
  stars: { color: tokens.colors.text },
  count: { color: tokens.colors.textMuted },
} as const;
