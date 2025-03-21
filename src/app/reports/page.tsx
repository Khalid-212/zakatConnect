import { redirect } from 'next/navigation';
import { createClient } from '../../../supabase/server';
import Sidebar from '@/components/sidebar';
import ReportsClient from './reports-client';
import { checkUserAccess } from '../auth/check-access';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  // Only super-admin and admin can access reports
  await checkUserAccess(['super-admin', 'admin']);

  const supabase = await createClient();

  // Fetch collections for report data
  const { data: collections, error } = await supabase
    .from('zakat_collections')
    .select('id, amount, collection_date, type, mosques(name)')
    .order('collection_date', { ascending: false })
    .limit(10);

  // Fetch distributions for report data
  const { data: distributions, error: distributionsError } = await supabase
    .from('zakat_distributions')
    .select('id, amount, distribution_date, type, status, beneficiaries(name)')
    .order('distribution_date', { ascending: false })
    .limit(10);

  if (error || distributionsError) {
    console.error('Error fetching data:', error || distributionsError);
    return <div>Error loading reports</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">Generate and download detailed reports</p>
          </div>

          <ReportsClient
            initialCollections={collections || []}
            initialDistributions={distributions || []}
          />
        </div>
      </main>
    </div>
  );
}
