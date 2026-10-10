import React from 'react';

export const AdminLogo: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 0' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/seven-lands-mark.png"
        alt="Seven Lands"
        style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--theme-elevation-800, #061428)', lineHeight: 1.2 }}>
          سفن لاند
        </span>
        <span style={{ fontWeight: 600, fontSize: '11px', letterSpacing: '0.05em', color: 'var(--theme-elevation-500, #577083)' }}>
          SEVEN LANDS
        </span>
      </div>
    </div>
  );
};
