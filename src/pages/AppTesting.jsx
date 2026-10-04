import { Link } from 'react-router-dom';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.buyselladda.app&hl=en_IN';

const AppTesting = () => (
  <div className="page-shell page-center" style={{ padding: '80px 24px' }}>
    <div className="content-card" style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
      <h1 style={{ fontSize: 36, marginBottom: 16, color: '#0F172A' }}>BuySellAdda App</h1>
      <p style={{ fontSize: 16, color: '#475569', marginBottom: 28 }}>
        Download the BuySellAdda Android app from Google Play to browse, post, and manage local listings.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/" className="button button-secondary">Back to Home</Link>
        <a href={PLAY_STORE_URL} className="button button-primary" target="_blank" rel="noopener noreferrer">Open Google Play</a>
      </div>
    </div>
  </div>
);

export default AppTesting;
