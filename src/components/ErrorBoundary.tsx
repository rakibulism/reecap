import React from 'react';

interface State { error: Error | null }

/**
 * Top-level error boundary. A crash in any view renders a friendly recovery
 * screen instead of a blank page — the editor state (photos/drafts) lives in
 * memory + IndexedDB, so a reload usually recovers cleanly.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface for debugging; no external reporting (privacy-first, no backend).
    console.error('Reecap crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'radial-gradient(1000px 500px at 80% -10%, rgba(255,61,3,0.15), transparent 60%), linear-gradient(160deg,#0c1224,#080810)',
          color: '#fff',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 460, textAlign: 'center' }}>
          <div
            style={{
              width: 56, height: 56, margin: '0 auto 20px', borderRadius: 16,
              background: 'rgba(255,61,3,0.12)', color: '#FF8A5C',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            }}
          >
            ⚠︎
          </div>
          <h1 style={{ fontSize: 26, margin: '0 0 10px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#9aa3b8', lineHeight: 1.55, margin: '0 0 24px' }}>
            The app hit an unexpected error. Your work is saved in this browser — reloading usually fixes it.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                height: 46, padding: '0 22px', borderRadius: 12, border: 0, cursor: 'pointer',
                background: '#FF3D03', color: '#fff', fontSize: 15, fontWeight: 700,
              }}
            >
              Reload
            </button>
            <a
              href="/home"
              style={{
                height: 46, padding: '0 20px', borderRadius: 12, display: 'inline-flex', alignItems: 'center',
                border: '1px solid #23232e', color: '#c7ccd9', fontSize: 15, fontWeight: 600, textDecoration: 'none',
              }}
            >
              Go to Home
            </a>
          </div>
          {this.state.error?.message && (
            <p style={{ marginTop: 22, fontSize: 12, color: '#5b6478', wordBreak: 'break-word' }}>
              {this.state.error.message}
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
