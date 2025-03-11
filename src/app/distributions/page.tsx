import { redirect } from 'next/navigation';
import { createClient } from '../../../supabase/server';
import DistributionsClient from './distributions-client';

export default async function DistributionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  // Get user role and associated mosque
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();

  // Only super-admin and admin roles can access distributions
  if (userData?.role !== 'super-admin' && userData?.role !== 'admin') {
    return redirect('/dashboard?error=You do not have permission to access distributions');
  }

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

  // Fetch all mosques for filtering (if super-admin)
  const { data: mosques } = await supabase.from('mosques').select('id, name').order('name');

  // Fetch distributions with related data
  const distributionsQuery = supabase
    .from('zakat_distributions')
    .select(
      `
      id,
      amount,
      distribution_date,
      mosque_id,
      beneficiary_id,
      mosques (
        id,
        name
      ),
      beneficiaries (
        id,
        name,
        code
      )
    `
    )
    .order('distribution_date', { ascending: false });

  // If not super-admin, filter by mosque
  if (defaultMosqueId) {
    distributionsQuery.eq('mosque_id', defaultMosqueId);
  }

  const { data: distributions, error: distributionsError } = await distributionsQuery;

  if (distributionsError) {
    console.error('Error fetching distributions:', distributionsError);
  }

  // Fetch beneficiaries for the form
  const beneficiariesQuery = supabase.from('beneficiaries').select('*').order('name');

  // If not super-admin, filter by mosque
  if (defaultMosqueId) {
    beneficiariesQuery.eq('mosque_id', defaultMosqueId);
  }

  const { data: beneficiaries } = await beneficiariesQuery;

  return (
    <DistributionsClient
      distributions={
        distributions?.map((d) => ({
          ...d,
          mosques: d.mosques?.[0] || { id: 'unknown', name: 'Unknown Mosque' },
          beneficiaries: d.beneficiaries?.[0] || {
            id: 'unknown',
            name: 'Unknown Beneficiary',
            code: 'N/A',
          },
        })) || []
      }
      beneficiaries={beneficiaries || []}
      mosques={mosques || []}
      userRole={userData?.role}
      defaultMosqueId={defaultMosqueId}
    />
  );
}
