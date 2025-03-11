import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Package, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createProduct, deleteProduct } from "./actions";
import { ProductDialog } from "./product-dialog";

import { checkUserAccess } from "../auth/check-access";

export default async function ProductsPage() {
  // Only super-admin and admin can access product management
  await checkUserAccess(["super-admin", "admin"]);

  const supabase = await createClient();

  // Fetch products
  const { data: products, error } = await supabase
    .from("product_types")
    .select("*")
    .order("name");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">
              Manage zakat product types and their prices
            </p>
          </div>

          {/* Product Prices */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Product Prices</h2>
              <ProductDialog createProductAction={createProduct} />
            </div>

            {products && products.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-4 font-medium text-sm text-gray-500 border-b">
                  <div>Product Name</div>
                  <div>Type</div>
                  <div>Price (ETB)</div>
                  <div>Actions</div>
                </div>

                {products.map((product) => (
                  <div
                    key={product.id}
                    className="grid grid-cols-4 gap-4 p-4 border-b hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-md">
                        <Package size={18} className="text-primary" />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="text-gray-600">{product.type}</div>
                    <div className="font-medium">{product.price} ETB</div>
                    <div className="flex gap-2">
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          type="submit"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No products found. Add one to get started.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
