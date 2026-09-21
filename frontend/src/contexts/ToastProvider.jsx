import { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { ToastContext } from '@/contexts/ToastContext';
import { RADIUS } from '@/styles/theme';

const AUTO_HIDE_DURATION = 3000;

const ICON_BY_SEVERITY = {
  success: { symbol: '✓', color: 'success.main' },
  error: { symbol: '!', color: 'error.main' },
  warning: { symbol: 'i', color: 'warning.main' },
};

function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ message, severity });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({
      showToast,
      showSuccess: (message) => showToast(message, 'success'),
      showError: (message) => showToast(message, 'error'),
      showInfo: (message) => showToast(message, 'warning'),
    }),
    [showToast],
  );

  const icon = toast ? ICON_BY_SEVERITY[toast.severity] : null;

  return (
    <ToastContext.Provider value={value}>
      {children}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={AUTO_HIDE_DURATION}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert
            onClose={hideToast}
            severity={toast.severity}
            icon={
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'common.white',
                }}
              >
                {icon.symbol}
              </span>
            }
            sx={{
              width: 420,
              maxWidth: '90vw',
              alignItems: 'center',
              borderRadius: `${RADIUS.toast}px`,
              backgroundColor: 'text.primary',
              color: 'common.white',
              boxShadow: 6,
              '& .MuiAlert-icon': {
                p: 0,
                mr: 1.25,
                backgroundColor: icon.color,
                borderRadius: '50%',
              },
              '& .MuiAlert-action': { color: 'grey.400', pt: 0 },
            }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
