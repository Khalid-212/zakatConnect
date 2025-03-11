'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

function NotFoundContent() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <Link href="/">
        <Button className="mt-4">Return Home</Button>
      </Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
