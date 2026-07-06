import React from 'react';
import { Helmet } from 'react-helmet-async';

const Maintenance = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
    }}>
      <Helmet>
        <title>Deployment Paused</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <p style={{
        color: '#ededed',
        fontSize: '18px',
        fontWeight: '400',
        letterSpacing: '0.01em',
        margin: 0,
      }}>
        This deployment is temporarily paused
      </p>

      <p style={{
        position: 'absolute',
        bottom: '24px',
        color: '#666',
        fontSize: '12px',
        fontWeight: '400',
        letterSpacing: '0.02em',
        margin: 0,
      }}>
        cdg1::mtzvp-1782719188673-c1765112703e
      </p>
    </div>
  );
};

export default Maintenance;
