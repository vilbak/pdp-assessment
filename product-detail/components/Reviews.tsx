import { useState } from 'react';
import { useReviewsQuery } from '../data';
import type { ReviewSort } from '../model';
import { tokens } from '../config/tokens';
import { strings } from '../config/strings';
import { RatingStars } from './RatingStars';

const SORTS: ReviewSort[] = ['newest', 'highest', 'lowest'];

type Props = { productId: string };

// Issue 29: owns its sort + query, with loading / empty / error states.
export const Reviews = ({ productId }: Props) => {
  const [sort, setSort] = useState<ReviewSort>('newest');
  const reviews = useReviewsQuery(productId, sort);
  const isEmpty = reviews.data?.length === 0;

  return (
    <div>
      <h2>{strings.reviews}</h2>
      <label>
        {strings.sortBy}
        <select value={sort} onChange={(e) => setSort(e.target.value as ReviewSort)}>
          {SORTS.map((option) => (
            <option key={option} value={option}>
              {strings.sortOption[option]}
            </option>
          ))}
        </select>
      </label>

      {reviews.isLoading && <p>{strings.loadingReviews}</p>}
      {reviews.isError && <p>{strings.reviewsError}</p>}
      {isEmpty && <p>{strings.noReviews}</p>}

      {reviews.data?.map((review) => (
        <article key={review.id} style={styles.review}>
          <h3>{review.author}</h3>
          <RatingStars rating={review.rating} />
          <p>{review.body}</p>
          <small>{new Date(review.createdAt).toLocaleDateString()}</small>
        </article>
      ))}
    </div>
  );
};

const styles = {
  review: { borderTop: `${tokens.borderWidth.thin}px solid ${tokens.colors.divider}` },
} as const;
