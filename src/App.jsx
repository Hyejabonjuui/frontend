import { BrowserRouter } from 'react-router-dom';

import AuthProvider from '@/contexts/AuthProvider';
import LoginDialogProvider from '@/contexts/LoginDialogProvider';
import ToastProvider from '@/contexts/ToastProvider';
import Router from '@/routes/Router';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LoginDialogProvider>
            <Router />
          </LoginDialogProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
