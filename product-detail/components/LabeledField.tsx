import type { ReactNode } from 'react';
import { tokens } from '../config/tokens';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  message?: string;
  action?: ReactNode;
};

// Issue 28: shared "label + controlled input + message" shape for coupon and delivery.
export const LabeledField = ({ label, value, onChange, placeholder, message, action }: Props) => (
  <div style={styles.field}>
    <label>
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
    {action}
    {message && <p style={styles.message}>{message}</p>}
  </div>
);

const styles = {
  field: { marginTop: tokens.spacing.md },
  message: { color: tokens.colors.textMuted },
} as const;
