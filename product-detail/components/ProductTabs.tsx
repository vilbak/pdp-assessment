import { useState } from 'react';
import type { TabKey } from '../model';
import { tokens } from '../config/tokens';
import { strings } from '../config/strings';
import { Reviews } from './Reviews';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'description', label: strings.description },
  { key: 'reviews', label: strings.reviews },
  { key: 'delivery', label: strings.delivery },
];

type Props = { productId: string; description: string };

// Issue 29: proper tabs — ARIA roles + aria-selected, buttons built from a list (no magic strings).
export const ProductTabs = ({ productId, description }: Props) => {
  const [active, setActive] = useState<TabKey>('description');

  return (
    <section style={styles.section}>
      <div role="tablist">
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {active === 'description' && (
          <div>
            <h2>{strings.description}</h2>
            <p>{description}</p>
          </div>
        )}
        {active === 'reviews' && <Reviews productId={productId} />}
        {active === 'delivery' && (
          <div>
            <h2>{strings.deliveryAndReturns}</h2>
            <p>{strings.deliveryInfo}</p>
          </div>
        )}
      </div>
    </section>
  );
};

const styles = {
  section: { marginTop: tokens.spacing.xl },
} as const;
