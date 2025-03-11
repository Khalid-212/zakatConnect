'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Building2 as Mosque, Phone } from 'lucide-react';

interface MosqueRegistrationDialogProps {
  children: React.ReactNode;
}

export function MosqueRegistrationDialog({ children }: MosqueRegistrationDialogProps) {
  const phoneNumber = '+251985216795';

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mosque className="h-5 w-5 text-primary" />
            Register Your Mosque
          </DialogTitle>
          <DialogDescription>
            Join our platform to efficiently manage zakat collection and distribution.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4 text-sm">
            <p>
              Register your mosque with ZakatConnect to access our comprehensive zakat management
              system. Our platform provides:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Secure zakat collection tracking</li>
              <li>Beneficiary management</li>
              <li>Distribution planning</li>
              <li>Detailed reporting and analytics</li>
              <li>Role-based access for your staff</li>
            </ul>
            <p className="pt-2">
              To register or learn more, you can call our support team directly.
            </p>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="sm:w-auto w-full flex gap-2 items-center"
            onClick={handleCall}
          >
            <Phone className="h-4 w-4" />
            Call {phoneNumber}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
