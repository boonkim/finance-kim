'use client';

import { useState } from 'react';
import AccountBalanceList from '@/components/home/AccountBalanceList';
import CreditCardAdvisorWidget from '@/components/home/CreditCardAdvisorWidget';
import QuickRecordButtons from '@/components/home/QuickRecordButtons';
import RecentTransactions from '@/components/home/RecentTransactions';

export default function HomeLoggedIn() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <CreditCardAdvisorWidget />

      <div className="mt-6">
        <AccountBalanceList refreshKey={refreshKey} />
      </div>

      <QuickRecordButtons onRecorded={() => setRefreshKey((k) => k + 1)} />

      <RecentTransactions refreshKey={refreshKey} />
    </>
  );
}
