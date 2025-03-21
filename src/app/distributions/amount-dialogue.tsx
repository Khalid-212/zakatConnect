'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateDistributionStatus } from './actions';
import { toast } from 'sonner';

interface AmountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaryId: string;
  beneficiaryName: string;
}

export function AmountDialog({
  isOpen,
  onClose,
  beneficiaryId,
  beneficiaryName,
}: AmountDialogProps) {
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('id', beneficiaryId);
      formData.append('status', 'approved');
      formData.append('amount', amount);

      const result = await updateDistributionStatus(formData);

      if (result.success) {
        toast.success(result.message);
        // Refresh the data if window.refreshDistributionsData exists
        if (window.refreshDistributionsData) {
          await window.refreshDistributionsData();
        }
        onClose();
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('An error occurred while updating the status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Distribution Amount</DialogTitle>
          <DialogDescription>
            Please enter the amount to be distributed to {beneficiaryName}.
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
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
