"use client";

import { Button } from "@/components/ui/button";

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
  if (status === newStatus) {
    return null;
  }

  const handleSubmit = async (formData: FormData) => {
    formData.append("id", id);
    formData.append("status", newStatus);
    await action(formData);
  };

  return (
    <form action={handleSubmit}>
      <Button variant="outline" size="sm" className={className} type="submit">
        {label}
      </Button>
    </form>
  );
}
