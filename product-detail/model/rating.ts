
export const clampRating = (rating: number): number =>
  Math.min(5, Math.max(0, Math.round(rating)));
