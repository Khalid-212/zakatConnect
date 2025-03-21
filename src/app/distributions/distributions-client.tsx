'use client';

import Sidebar from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Package, Plus, Search, Filter, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { updateDistributionStatus } from './actions';
import { ApprovalButton } from './approval-button';
import { createClient } from '../../../supabase/client';
import { User } from '@supabase/supabase-js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Add this at the top of the file
declare global {
  interface Window {
    refreshDistributionsData?: () => Promise<void>;
  }
}

interface Distribution {
  id: string;
  amount: number;
  distribution_date: string;
  mosque_id: string;
  beneficiary_id: string;
  mosques: {
    id: string;
    name: string;
  };
  beneficiaries: {
    id: string;
    name: string;
    code: string;
  };
}

interface Beneficiary {
  id: string;
  name: string;
  code: string;
  family_members?: number;
  city?: string;
  region?: string;
  status?: string;
  mosque_id: string;
}

interface Mosque {
  id: string;
  name: string;
}

interface DistributionsClientProps {
  distributions: Distribution[];
  beneficiaries: Beneficiary[];
  mosques: Mosque[];
  userRole: string;
  defaultMosqueId: string | null;
}

export default function DistributionsClient({
  distributions: initialDistributions,
  beneficiaries: initialBeneficiaries,
  mosques,
  userRole,
  defaultMosqueId,
}: DistributionsClientProps) {
  const [searchCode, setSearchCode] = useState('');
  const [distributions, setDistributions] = useState<Distribution[]>(initialDistributions);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries);
  const [filteredBeneficiaries, setFilteredBeneficiaries] =
    useState<Beneficiary[]>(initialBeneficiaries);
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(defaultMosqueId);
  const [isAmountDialogOpen, setIsAmountDialogOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setSearchCode(code);

    if (code.length > 2) {
      const supabase = createClient();
      const query = supabase
        .from('beneficiaries')
        .select('*')
        .ilike('code', `%${code}%`)
        .order('created_at', { ascending: false });

      if (selectedMosqueId) {
        query.eq('mosque_id', selectedMosqueId);
      }

      const { data } = await query;
      setFilteredBeneficiaries((data || []) as Beneficiary[]);
    } else {
      setFilteredBeneficiaries(beneficiaries);
    }
  };

  // Refresh data when needed
  const refreshData = async () => {
    const supabase = createClient();

    const distributionsQuery = supabase
      .from('zakat_distributions')
      .select(
        `
        id,
        amount,
        distribution_date,
        mosque_id,
        beneficiary_id,
        mosques:mosques (
          id,
          name
        ),
        beneficiaries:beneficiaries (
          id,
          name,
          code
        )
      `
      )
      .order('distribution_date', { ascending: false });

    if (selectedMosqueId) {
      distributionsQuery.eq('mosque_id', selectedMosqueId);
    }

    const { data: newDistributions } = await distributionsQuery;

    if (newDistributions) {
      const typedDistributions = newDistributions.map((d: any) => ({
        ...d,
        mosques: d.mosques?.[0] || { id: 'unknown', name: 'Unknown Mosque' },
        beneficiaries: d.beneficiaries?.[0] || {
          id: 'unknown',
          name: 'Unknown Beneficiary',
          code: 'N/A',
        },
      }));
      setDistributions(typedDistributions as Distribution[]);
    }

    const beneficiariesQuery = supabase
      .from('beneficiaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (selectedMosqueId) {
      beneficiariesQuery.eq('mosque_id', selectedMosqueId);
    }

    const { data: newBeneficiaries } = await beneficiariesQuery;

    if (newBeneficiaries) {
      setBeneficiaries(newBeneficiaries as Beneficiary[]);
      setFilteredBeneficiaries(newBeneficiaries as Beneficiary[]);
    }
  };

  // Initialize filtered beneficiaries and set up global refresh function
  useEffect(() => {
    setFilteredBeneficiaries(beneficiaries);

    // Add a global refresh function that can be called from other components
    window.refreshDistributionsData = refreshData;

    return () => {
      // Clean up when component unmounts
      delete window.refreshDistributionsData;
    };
  }, [beneficiaries]);

  const handleApproveClick = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsAmountDialogOpen(true);
    setAmount('');
  };

  console.log(selectedBeneficiary);

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Update the beneficiary's status
      const { error: updateError } = await supabase
        .from('beneficiaries')
        .update({ status: 'approved' })
        .eq('id', selectedBeneficiary?.id);

      if (updateError) {
        throw updateError;
      }

      // Insert a new record into the zakat_distributions table
      const { error: insertError } = await supabase.from('zakat_distributions').insert({
        mosque_id: selectedBeneficiary?.mosque_id,
        beneficiary_id: selectedBeneficiary?.id,
        amount: parseFloat(amount),
        distribution_date: new Date().toISOString(),
        status: 'approved',
        type: 'cash',
        distributed_by: user?.id,
        description: 'Zakat distribution to ' + selectedBeneficiary?.name,
      });

      console.log({
        mosque_id: selectedBeneficiary?.mosque_id,
        beneficiary_id: selectedBeneficiary?.id,
        amount: parseFloat(amount),
        distribution_date: new Date().toISOString(),
        status: 'approved',
        // distributed_by: userRole.id,
        description: 'Zakat distribution to ' + selectedBeneficiary?.name,
        type: 'cash',
        distributed_by: user?.id,
      });

      if (insertError) {
        throw insertError;
      }

      toast.success('Beneficiary approved and distribution recorded successfully!');
      setIsAmountDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating status or inserting distribution:', error);
      toast.error('An error occurred while processing the request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Zakat Distributions</h1>
              <p className="text-muted-foreground">Manage zakat distributions to beneficiaries</p>
            </div>
            <div className="flex gap-3">
              {userRole !== 'clerk' && (
                <Link href="/distributions/new">
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Distribution
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg border mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input placeholder="Search distributions..." className="pl-10 w-full" />
              </div>
              {userRole === 'super-admin' && (
                <Select
                  value={selectedMosqueId || 'all'}
                  onValueChange={(value) => {
                    setSelectedMosqueId(value === 'all' ? null : value);
                    refreshData();
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Mosque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mosques</SelectItem>
                    {mosques.map((mosque) => (
                      <SelectItem key={mosque.id} value={mosque.id}>
                        {mosque.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filter
              </Button>
            </div>
          </div>

          {/* Distribution Approval Section */}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Beneficiary Approval</h2>
            <p className="text-muted-foreground mb-4">
              Approve beneficiaries to receive zakat distributions
            </p>

            <form className="relative mb-4">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Search by beneficiary code"
                className="pl-10 w-full"
                name="code"
                value={searchCode}
                onChange={handleSearchChange}
              />
              <Button type="submit" className="absolute right-1 top-1 h-8">
                Search
              </Button>
            </form>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
                <div>Name</div>
                <div>Code</div>
                <div>Family Size</div>
                <div>Location</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {filteredBeneficiaries && filteredBeneficiaries.length > 0 ? (
                filteredBeneficiaries.map((beneficiary) => {
                  const status = beneficiary.status || 'pending';
                  const statusColor =
                    status === 'approved'
                      ? 'bg-green-100 text-green-600'
                      : status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600';

                  return (
                    <div
                      key={beneficiary.id}
                      className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-md">
                          <UserPlus size={18} className="text-primary" />
                        </div>
                        <span className="font-medium">{beneficiary.name}</span>
                      </div>
                      <div className="text-gray-600 font-medium">{beneficiary.code}</div>
                      <div className="text-gray-600">{beneficiary.family_members || 1}</div>
                      <div className="text-gray-600">
                        {beneficiary.city}, {beneficiary.region}
                      </div>
                      <div>
                        <span className={`${statusColor} text-xs px-2 py-1 rounded-full`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {status == 'pending' && (
                          <div className="border-red-500 bg-white text-green-600 hover:bg-green-50">
                            <Button onClick={() => handleApproveClick(beneficiary)}>Approve</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No beneficiaries found. Add beneficiaries to get started.
                </div>
              )}
            </div>
          </div>

          {/* Distributions List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
              <div>ID</div>
              <div>Date</div>
              <div>Mosque</div>
              <div>Beneficiary</div>
              <div>Amount</div>
              <div>Actions</div>
            </div>

            {distributions && distributions.length > 0 ? (
              distributions.map((distribution) => (
                <div
                  key={distribution.id}
                  className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <Package size={18} className="text-primary" />
                    </div>
                    <span className="font-medium">#{distribution.id}</span>
                  </div>
                  <div className="text-gray-600">
                    {new Date(distribution.distribution_date).toLocaleDateString()}
                  </div>
                  <div className="text-gray-600">
                    {distribution.mosques?.name || 'Unknown Mosque'}
                  </div>
                  <div className="text-gray-600">
                    {distribution.beneficiaries?.name || 'Unknown'} (
                    {distribution.beneficiaries?.code || 'N/A'})
                  </div>
                  <div className="text-gray-600">{distribution.amount.toFixed(2)} ETB</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No distributions found. Add distributions to get started.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Amount Dialog */}
      <Dialog
        open={isAmountDialogOpen}
        onOpenChange={(open) => !open && setIsAmountDialogOpen(false)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Distribution Amount</DialogTitle>
            <DialogDescription>
              Please enter the amount to be distributed to {selectedBeneficiary?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETB)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAmountDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
