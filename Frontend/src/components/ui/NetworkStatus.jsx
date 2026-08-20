import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import websocketClient from '../../websocket/websocketClient';

const NetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wsState, setWsState] = useState(websocketClient.getState());

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = websocketClient.onConnectionStateChange((state) => {
      setWsState(state === 'connected' ? 'CONNECTED' : (state === 'disconnected' ? 'DISCONNECTED' : 'CONNECTING'));
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  if (!isOffline && wsState === 'CONNECTED') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 text-sm font-medium">
        {isOffline ? (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <span>You are offline</span>
          </>
        ) : wsState !== 'CONNECTED' ? (
          <>
            <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
            <span>Reconnecting...</span>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default NetworkStatus;
