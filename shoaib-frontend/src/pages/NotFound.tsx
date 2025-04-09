import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn" style={{ marginTop: '2rem' }}>
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;