import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PolicyRow from '@/components/policy/PolicyRow';
import { EMPTY_MESSAGES } from '@/constants/messages';

function PolicyList({
  policies,
  isLoading = false,
  errorMessage = '',
  emptyMessage = EMPTY_MESSAGES.POLICY_LIST,
  page = 1,
  totalPages = 0,
  onPageChange,
  isFavorite,
  onToggleFavorite,
  onRetry,
}) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  if (policies.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <Box>
      {policies.map((policy) => (
        <PolicyRow
          key={policy.id}
          policy={policy}
          isFavorite={isFavorite?.(policy.id) ?? false}
          onToggleFavorite={onToggleFavorite}
        />
      ))}

      {totalPages > 1 && onPageChange && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={(event, value) => onPageChange(value)}
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}

export default PolicyList;
