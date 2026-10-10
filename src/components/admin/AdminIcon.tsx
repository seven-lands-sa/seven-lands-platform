import React from 'react';

export const AdminIcon: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/seven-lands-mark.png"
        alt="Seven Lands"
        style={{ height: '26px', width: 'auto', objectFit: 'contain' }}
      />
    </div>
  );
};
