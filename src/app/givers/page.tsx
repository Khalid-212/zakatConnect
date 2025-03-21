import { redirect } from 'next/navigation';
import { createClient } from '../../../supabase/server';
import GiversClient from './givers-client';

interface Dictionary<T> {
  [key: string]: T;
}

export default async function GiversPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  // Get user role and associated mosque
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();

  // Get mosque admin's mosque if not super-admin
  let defaultMosqueId = null;
  if (userData?.role !== 'super-admin') {
    const { data: mosqueAdmin } = await supabase
      .from('mosque_admins')
      .select('mosque_id')
      .eq('user_id', user.id)
      .single();
    defaultMosqueId = mosqueAdmin?.mosque_id;
  }

  // Fetch givers from database
  const giversQuery = supabase.from('givers').select('*').order('created_at', { ascending: false });

  // If not super-admin, filter by mosque
  if (defaultMosqueId) {
    giversQuery.eq('mosque_id', defaultMosqueId);
  }

  const { data: givers, error } = await giversQuery;

  if (error) {
    console.error('Error fetching givers:', error);
  }

  // Fetch total donations for each giver
  const giverIds = givers?.map((giver) => giver.id) || [];
  const donationsQuery = supabase
    .from('zakat_collections')
    .select('giver_id, amount')
    .in('giver_id', giverIds);

  // If not super-admin, filter by mosque
  if (defaultMosqueId) {
    donationsQuery.eq('mosque_id', defaultMosqueId);
  }

  const { data: donations } = await donationsQuery;

  // Calculate total donations per giver
  const totalDonations: Dictionary<number> = {};
  donations?.forEach((donation) => {
    if (donation.giver_id) {
      totalDonations[donation.giver_id] =
        (totalDonations[donation.giver_id] || 0) + donation.amount;
    }
  });

  return (
    <GiversClient
      givers={givers || []}
      totalDonations={totalDonations}
      userRole={userData?.role}
      defaultMosqueId={defaultMosqueId}
    />
  );
}
