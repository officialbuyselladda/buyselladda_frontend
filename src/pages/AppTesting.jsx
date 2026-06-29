import { Link } from 'react-router-dom';

const AppTesting = () => (
  <div className="page-shell page-center" style={{ padding: '80px 24px' }}>
    <div className="content-card" style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
      <h1 style={{ fontSize: 36, marginBottom: 16, color: '#0F172A' }}>App Testing</h1>
      <p style={{ fontSize: 16, color: '#475569', marginBottom: 28 }}>
        The mobile app is currently in testing and will be launching soon. Stay tuned for the official release!
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/" className="button button-secondary">Back to Home</Link>
        <Link to="/contact" className="button button-primary">Contact Support</Link>
      </div>
    </div>
  </div>
);

export default AppTesting;
