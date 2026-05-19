import React from 'react';

const HeroBanner = () => {
  return (
    <div style={{ background: 'var(--cdac-bg)', padding: '20px 10px' }}>
      <div className="container my-3 d-flex justify-content-center">
        <div
          style={{
            width: '100%',
            maxWidth: 1800,
            height: 'clamp(120px, 25vw, 260px)',
            borderRadius: 32,
            overflow: 'hidden',
            padding: 6,
            background: 'linear-gradient(135deg, #cbb6e9 0%, #a78bfa 50%, #93c5fd 100%)',
            boxShadow: '0 16px 40px rgba(124,92,255,0.25)',
          }}
        >
          <div
            style={{
              width: '100%', height: '100%',
              borderRadius: 26,
              background: 'var(--cdac-surface)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <img
              src="/cdac_logo.jpg" alt="C-DAC Delhi"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'left center',
                borderRadius: 26,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
