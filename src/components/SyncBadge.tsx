'use client';

import { useState, useEffect } from 'react';

export default function SyncBadge() {
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(
      new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
    );
  }, []);

  return (
    <div className="sync-badge">
      <span className="sync-dot" />
      {time ? `Synced ${time}` : 'Live'}
    </div>
  );
}
