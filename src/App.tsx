import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { LoginForm } from './components/auth/LoginForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { MainPortal } from './components/portal/MainPortal';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'forgot'>('login');

  if (!user) {
    return (
      <>
        {authView === 'login' && (
          <LoginForm onForgotPassword={() => setAuthView('forgot')} />
        )}
        {authView === 'forgot' && (
          <ForgotPasswordForm onBack={() => setAuthView('login')} />
        )}
      </>
    );
  }

  return <MainPortal />;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;