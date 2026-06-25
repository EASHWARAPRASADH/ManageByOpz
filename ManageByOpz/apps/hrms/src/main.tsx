import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './app/store';
import { router } from './app/router';
import { ThemeProvider } from './app/ThemeContext';
import './index.css';

// SSO Session Ingestion from Enterprise Workspace Portal
(function handleSSO() {
  const params = new URLSearchParams(window.location.search);
  const ssoUserStr = params.get('sso_user');
  const ssoToken = params.get('sso_token');
  
  if (ssoUserStr && ssoToken) {
    try {
      const ssoUser = JSON.parse(ssoUserStr);
      localStorage.setItem('accessToken', ssoToken);
      localStorage.setItem('refreshToken', ssoToken);
      localStorage.setItem('role', ssoUser.role || 'ROLE_USER');
      localStorage.setItem('tenant', ssoUser.tenantId || 'default');
      localStorage.setItem('user', JSON.stringify({
        id: ssoUser.uid || ssoUser.id,
        name: ssoUser.name,
        email: ssoUser.email,
        role: ssoUser.role || 'ROLE_USER',
        tenantId: ssoUser.tenantId || 'default',
        permissions: ssoUser.permissions || [],
      }));
      localStorage.setItem('permissions', JSON.stringify(ssoUser.permissions || []));
      
      // Clean query parameters from URL
      params.delete('sso_user');
      params.delete('sso_token');
      const newSearch = params.toString();
      const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    } catch (e) {
      console.error('SSO Ingestion failed:', e);
    }
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
