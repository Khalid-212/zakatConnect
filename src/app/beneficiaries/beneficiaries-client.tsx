'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { UserPlus, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
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
import { useTranslation } from '@/lib/translations/useTranslation';
import { languages, Language } from '@/lib/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Beneficiary {
  id: string;
  name: string;
  code?: string;
  status?: string;
  city?: string;
  region?: string;
  family_members?: number;
  mosque_id?: string;
}

interface BeneficiariesClientProps {
  beneficiaries: Beneficiary[];
  userRole: string;
  defaultMosqueId: string | null;
}

export default function BeneficiariesClient({
  beneficiaries,
  userRole,
  defaultMosqueId,
}: BeneficiariesClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAmountDialogOpen, setIsAmountDialogOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Use the translation hook
  const { t, language, changeLanguage } = useTranslation();

  // Filter beneficiaries based on search term
  const filteredBeneficiaries = beneficiaries.filter((beneficiary) =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApproveClick = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setIsAmountDialogOpen(true);
    setAmount('');
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error(t.common.invalidAmount);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('id', selectedBeneficiary?.id || '');
      formData.append('status', 'approved');
      formData.append('amount', amount);

      const response = await fetch('/api/beneficiaries/update-status', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setIsAmountDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || t.common.updateFailed);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t.common.errorOccurred);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <Select value={language} onValueChange={(value: Language) => changeLanguage(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t.common.language} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(languages).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">{t.beneficiaries.title}</h1>
              <p className="text-muted-foreground">{t.beneficiaries.subtitle}</p>
            </div>

            <Link href="/beneficiaries/new">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                {t.beneficiaries.addBeneficiary}
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="bg-white p-4 rounded-lg border mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder={t.beneficiaries.searchBeneficiaries}
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Beneficiaries List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
              <div>{t.beneficiaries.name}</div>
              <div>{t.common.id}</div>
              <div>{t.beneficiaries.address}</div>
              <div>{t.common.status}</div>
            </div>

            {filteredBeneficiaries.length > 0 ? (
              filteredBeneficiaries.map((beneficiary) => {
                const status = beneficiary.status || 'active';
                const statusColor =
                  status === 'approved'
                    ? 'bg-green-100 text-green-600'
                    : status === 'pending'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-blue-100 text-blue-600';

                return (
                  <div
                    key={beneficiary.id}
                    className="grid grid-cols-4 gap-4 p-4 border-b hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-md">
                        <UserPlus size={18} className="text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">{beneficiary.name}</span>
                        <div className="text-xs text-gray-500">
                          {t.beneficiaries.familySize}: {beneficiary.family_members || 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-600 font-medium">
                      {beneficiary.code ? (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                          {beneficiary.code}
                        </span>
                      ) : (
                        t.common.notAvailable
                      )}
                    </div>
                    <div className="text-gray-600">
                      {beneficiary.city}, {beneficiary.region}
                    </div>
                    <div>
                      <span className={`${statusColor} text-xs px-2 py-1 rounded-full`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">{t.beneficiaries.noData}</div>
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
            <DialogTitle>{t.beneficiaries.enterDistributionAmount}</DialogTitle>
            <DialogDescription>
              {t.beneficiaries.enterAmountPrompt} {selectedBeneficiary?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t.common.amount} (ETB)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.beneficiaries.enterAmount}
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
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? t.common.processing : t.common.approve}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
