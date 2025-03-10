"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

export function ProductDialog({
  createProductAction,
}: {
  createProductAction: any;
}) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    await createProductAction(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Product Type</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (ETB)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="Enter price"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
