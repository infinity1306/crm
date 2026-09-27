import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
        <WifiOff className="w-3.5 h-3.5 animate-pulse" />
        <span>Offline Mode — Actions will cache locally and sync automatically when internet is restored.</span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="bg-emerald-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md animate-in fade-in duration-300">
        <Wifi className="w-3.5 h-3.5" />
        <span>Connection Restored — Back online and synchronized with Star Chain Cloud.</span>
      </div>
    );
  }

  return null;
};
