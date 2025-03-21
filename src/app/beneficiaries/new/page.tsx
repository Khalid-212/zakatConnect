'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { createBeneficiary } from './actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '../../../../supabase/client';
import { useTranslation } from '@/lib/translations/useTranslation';
import { languages, Language } from '@/lib/translations';
import Loading from '@/app/loading';

interface Mosque {
  id: string;
  name: string;
}

interface MosqueAdmin {
  mosque_id: string;
  mosques: {
    id: string;
    name: string;
  };
}

export const dynamic = 'force-dynamic';

export default function NewBeneficiaryPage() {
  const router = useRouter();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wheatPrice, setWheatPrice] = useState<number>(0);
  const [familyMembers, setFamilyMembers] = useState<number>(1);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  const [beneficiaryCode, setBeneficiaryCode] = useState<string>('');
  const supabase = createClient();

  const { t, language, changeLanguage } = useTranslation();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate a unique beneficiary code
  const generateBeneficiaryCode = useCallback(async () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const code = `BEN-${timestamp}-${randomPart}`;

    // Check if code already exists
    const { data } = await supabase.from('beneficiaries').select('id').eq('code', code).single();

    if (data) {
      // Code exists, try again
      return generateBeneficiaryCode();
    }

    return code;
  }, [supabase]);

  // Calculate donation amount based on family members and wheat price
  useEffect(() => {
    const amount = familyMembers * 2.5 * wheatPrice;
    setCalculatedAmount(amount);
  }, [familyMembers, wheatPrice]);

  useEffect(() => {
    async function loadData() {
      try {
        // Generate unique code
        const code = await generateBeneficiaryCode();
        setBeneficiaryCode(code);

        // Get wheat price
        const { data: wheatProduct } = await supabase
          .from('product_types')
          .select('price')
          .eq('name', 'Wheat')
          .single();

        if (wheatProduct) {
          setWheatPrice(wheatProduct.price);
        }

        // Get user role
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData) {
          setUserRole(userData.role);
        }

        // If super-admin, fetch all mosques
        if (userData?.role === 'super-admin') {
          const { data: mosquesData } = await supabase
            .from('mosques')
            .select('id, name')
            .order('name');

          if (mosquesData) {
            setMosques(mosquesData);
          }
        } else {
          // For other roles, get their associated mosque
          const { data: mosqueAdmin } = (await supabase
            .from('mosque_admins')
            .select('mosque_id, mosques:mosques(id, name)')
            .eq('user_id', user.id)
            .single()) as { data: MosqueAdmin | null };

          if (mosqueAdmin) {
            setSelectedMosqueId(mosqueAdmin.mosque_id);
            if (mosqueAdmin.mosques) {
              setMosques([
                {
                  id: mosqueAdmin.mosques.id,
                  name: mosqueAdmin.mosques.name,
                },
              ]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(t.common.errorOccurred);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [generateBeneficiaryCode]);

  async function handleSubmit(formData: FormData) {
    // Create a new FormData object
    const updatedFormData = new FormData();

    // Copy all existing form data
    Array.from(formData.entries()).forEach(([key, value]) => {
      updatedFormData.append(key, value);
    });

    // Add the beneficiary code and calculated amount
    updatedFormData.append('code', beneficiaryCode);
    updatedFormData.append('amount', calculatedAmount.toString());

    if (userRole === 'super-admin') {
      const selectedMosque = formData.get('mosque_id');
      if (!selectedMosque) {
        toast.error(t.givers.selectMosque);
        return;
      }
    } else if (selectedMosqueId) {
      updatedFormData.set('mosque_id', selectedMosqueId);
    }

    const result = await createBeneficiary(updatedFormData);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
      router.push('/beneficiaries');
    }
  }

  if (!isClient || isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-3xl mx-auto">
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
          <div className="flex items-center gap-4 mb-8">
            <Link href="/beneficiaries">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{t.beneficiaries.addBeneficiary}</h1>
              <p className="text-muted-foreground">{t.beneficiaries.subtitle}</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg border p-6">
            <form action={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userRole === 'super-admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="mosque_id">{t.givers.selectMosque} *</Label>
                    <Select name="mosque_id" required>
                      <SelectTrigger>
                        <SelectValue placeholder={t.givers.selectMosque} />
                      </SelectTrigger>
                      <SelectContent>
                        {mosques.map((mosque) => (
                          <SelectItem key={mosque.id} value={mosque.id}>
                            {mosque.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">{t.beneficiaries.name} *</Label>
                  <Input id="name" name="name" placeholder={t.beneficiaries.name} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">{t.common.status} *</Label>
                  <Select name="region" required>
                    <SelectTrigger>
                      <SelectValue placeholder={t.common.status} />
                    </SelectTrigger>
                    <SelectContent className="h-40 overflow-scroll">
                      <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                      <SelectItem value="Afar">Afar</SelectItem>
                      <SelectItem value="Amhara">Amhara</SelectItem>
                      <SelectItem value="Benishangul-Gumuz">Benishangul-Gumuz</SelectItem>
                      <SelectItem value="Central Ethiopia">Central Ethiopia</SelectItem>
                      <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                      <SelectItem value="Gambella">Gambella</SelectItem>
                      <SelectItem value="Harari">Harari</SelectItem>
                      <SelectItem value="Oromia">Oromia</SelectItem>
                      <SelectItem value="Sidama">Sidama</SelectItem>
                      <SelectItem value="Somali">Somali</SelectItem>
                      <SelectItem value="South Ethiopia">South Ethiopia</SelectItem>
                      <SelectItem value="Southern Nations, Nationalities, and Peoples'">
                        Southern Nations, Nationalities, and Peoples&apos;
                      </SelectItem>
                      <SelectItem value="South West Ethiopia Peoples'">
                        South West Ethiopia Peoples&apos;
                      </SelectItem>
                      <SelectItem value="Tigray">Tigray</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">{t.beneficiaries.address} *</Label>
                  <Input id="city" name="city" placeholder={t.beneficiaries.address} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sub_city">{t.beneficiaries.address} *</Label>
                  <Input
                    id="sub_city"
                    name="sub_city"
                    placeholder={t.beneficiaries.address}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="woreda">{t.beneficiaries.address} *</Label>
                  <Input id="woreda" name="woreda" placeholder={t.beneficiaries.address} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t.givers.phone} *</Label>
                  <Input id="phone" name="phone" placeholder={t.givers.phone} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="family_members">{t.beneficiaries.familySize} *</Label>
                  <Input
                    id="family_members"
                    name="family_members"
                    type="number"
                    placeholder={t.beneficiaries.familySize}
                    required
                    defaultValue="1"
                    onChange={(e) => setFamilyMembers(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calculated_amount">{t.common.amount} (ETB)</Label>
                  <Input
                    id="calculated_amount"
                    value={calculatedAmount.toFixed(2)}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.beneficiaries.familySize}: {familyMembers} x 2.5 x {wheatPrice}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beneficiary_code">{t.common.id}</Label>
                  <Input
                    id="beneficiary_code"
                    value={beneficiaryCode}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="remark">{t.beneficiaries.notes}</Label>
                  <Textarea
                    id="remark"
                    name="remark"
                    placeholder={t.beneficiaries.notes}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Link href="/beneficiaries">
                  <Button variant="outline" type="button">
                    {t.common.cancel}
                  </Button>
                </Link>
                <Button type="submit">{t.common.save}</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
