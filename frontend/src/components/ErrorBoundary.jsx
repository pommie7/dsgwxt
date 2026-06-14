import { Component } from 'react';

/**
 * Error boundary — catches render errors and displays a fallback UI.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#636e72',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2>页面出现异常</h2>
          <p style={{ marginTop: 8, fontSize: 14, color: '#b2bec3' }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              marginTop: 20,
              background: '#0984e3',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: 6,
            }}
          >
            返回首页
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
