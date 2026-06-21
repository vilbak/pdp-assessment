import { tokens } from '../config/tokens';
import { strings } from '../config/strings';

type Props = {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

// Issue 25: one shared loading/error/empty (was 3 duplicated guards); retry refetches, no reload.
export const ScreenState = ({ isLoading, isError, onRetry }: Props) => {
  if (isLoading) {
    return <p style={styles.loading}>{strings.loadingProduct}</p>;
  }
  if (isError) {
    return (
      <div>
        <h1>{strings.somethingWrong}</h1>
        <button type="button" onClick={onRetry}>
          {strings.retry}
        </button>
      </div>
    );
  }
  return <p>{strings.noProduct}</p>;
};

const styles = {
  loading: { color: tokens.colors.textMuted },
} as const;
