'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import OverViewPage from './_components/overview';

// export default function page() {
//   const { session, isLoading } = useAuth();
//   return <OverViewPage />;
// }

export default function OverviewPage() {
  return <div>This is a test page.</div>; // Simple test content
}
