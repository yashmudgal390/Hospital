"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Plus, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export type ServiceListType = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
};

export default function ServicesClient({ data }: { data: ServiceListType[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteService = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete service");
      
      toast.success("Service deleted");
      router.refresh();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<ServiceListType>[] = [
    {
      accessorKey: "sortOrder",
      header: "Order",
      cell: ({ row }) => <span className="font-mono text-brand-muted">{row.original.sortOrder}</span>,
    },
    {
      accessorKey: "name",
      header: "Service",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-brand-text flex items-center gap-2">
            {row.original.name}
            {row.original.isFeatured && <Star className="h-3 w-3 fill-amber-400 text-amber-500" />}
          </div>
          <div className="text-xs text-brand-muted font-mono">{row.original.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${row.original.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
          {row.original.isActive ? "Active" : "Hidden"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Added",
      cell: ({ row }) => <span className="text-sm font-medium">{format(new Date(row.original.createdAt), "MMM d, yyyy")}</span>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-brand-border rounded-xl">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/admin/services/${item.id}`}>
                  <Edit className="mr-2 h-4 w-4 text-brand-primary" /> Edit Service
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteService(item.id, item.name)} className="cursor-pointer text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">Medical Services</h1>
          <p className="text-brand-muted">Manage the services offered by your clinic.</p>
        </div>
        <Button asChild size="lg" className="rounded-pill bg-brand-primary shadow-button text-white hover:bg-brand-secondary whitespace-nowrap">
          <Link href="/admin/services/new">
            <Plus className="mr-2 h-4 w-4" /> Add New Service
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
