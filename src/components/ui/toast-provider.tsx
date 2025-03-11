'use client';

import { useToast } from '@/components/ui/use-toast';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function ToastProviderInner() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast({
        title: 'Success',
        description: success,
        variant: 'default',
      });
    }

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  return null;
}

export function ToastProvider() {
  return (
    <Suspense fallback={null}>
      <ToastProviderInner />
    </Suspense>
  );
}
