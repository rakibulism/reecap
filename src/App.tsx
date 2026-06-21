import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useReecapStore } from './store/reecapStore';
import Landing from './pages/Landing';
import Editor from './pages/Editor';

function App() {
  const { theme } = useReecapStore();

  useEffect(() => {
    let activeTheme = theme;
    if (theme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [theme]);

  // Sync system theme changes
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Editor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
