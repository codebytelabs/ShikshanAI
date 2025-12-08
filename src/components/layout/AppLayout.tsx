import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { OfflineBanner } from '@/components/pwa/OfflineBanner';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export function AppLayout() {
  const { isOnline, pendingCount } = useOfflineSync();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Offline banner - Req 4.4, 5.4, 6.2 */}
      <OfflineBanner isOffline={!isOnline} pendingSyncCount={pendingCount} />
      <Outlet />
      <BottomNav />
    </div>
  );
}
