"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ApprovalButton({
  status,
  action,
  id,
  newStatus,
  label,
  className,
}: {
  status: string;
  action: any;
  id: string;
  newStatus: string;
  label: string;
  className: string;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // If status is already approved, don't show any button regardless of newStatus
  if (status === "approved") {
    return null;
  }

  // For other statuses, if it matches the newStatus, don't show the button
  if (status === newStatus) {
    return null;
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      formData.append("id", id);
      formData.append("status", newStatus);
      const result = await action(formData);

      if (result.success) {
        // Show success toast
        toast({
          title: "Success",
          description:
            result.message ||
            `Beneficiary ${newStatus === "approved" ? "approved" : "rejected"} successfully`,
          variant: newStatus === "approved" ? "default" : "destructive",
        });

        // Refresh the page to reflect the new status
        router.refresh();

        // If we're in a client component with a refresh function, call it
        if (window.refreshDistributionsData) {
          window.refreshDistributionsData();
        }
      } else {
        // Show error toast with the returned message
        toast({
          title: "Error",
          description:
            result.message ||
            `Failed to ${newStatus === "approved" ? "approve" : "reject"} beneficiary`,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Show error toast for exceptions
      toast({
        title: "Error",
        description: `Failed to ${newStatus === "approved" ? "approve" : "reject"} beneficiary`,
        variant: "destructive",
      });
      console.error("Error updating status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit}>
      <Button
        variant="outline"
        size="sm"
        className={className}
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : label}
      </Button>
    </form>
  );
}
