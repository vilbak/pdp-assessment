import type { CSSProperties } from 'react';
import { tokens } from '../config/tokens';
import { strings } from '../config/strings';

type Props = {
  images: string[];
  selected: string;
  select: (image: string) => void;
  name: string;
};

// Issue 26: single <img>
export const ProductGallery = ({ images, selected, select, name }: Props) => (
  <section style={styles.section}>
    <img src={selected} alt={name} style={styles.mainImage} />
    <div style={styles.thumbs}>
      {images.map((image, index) => {
        const isSelected = image === selected;
        return (
          <button
            key={image}
            type="button"
            onClick={() => select(image)}
            aria-label={strings.imageLabel(index + 1)}
            aria-pressed={isSelected}
            style={isSelected ? styles.thumbSelected : styles.thumb}
          >
            <img src={image} alt="" width={80} height={80} />
          </button>
        );
      })}
    </div>
  </section>
);

const thumbBase: CSSProperties = {
  borderStyle: 'solid',
  borderWidth: tokens.borderWidth.thin,
  borderColor: tokens.colors.border,
  borderRadius: tokens.radius.sm,
  padding: 0,
};

const styles = {
  section: { width: '100%' },
  mainImage: { width: '100%', height: 'auto', borderRadius: tokens.radius.md },
  thumbs: { display: 'flex', gap: tokens.spacing.xs, marginTop: tokens.spacing.sm },
  thumb: thumbBase,
  thumbSelected: {
    ...thumbBase,
    borderWidth: tokens.borderWidth.thick,
    borderColor: tokens.colors.borderStrong,
  },
} as const;
