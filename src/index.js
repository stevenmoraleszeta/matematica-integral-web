import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n'; // Inicializar i18n
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/auth';
import { ThemeProvider } from './contexts/theme';
import { LanguageProvider } from './contexts/language';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>
);

reportWebVitals();
