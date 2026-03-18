"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Plus, Clock } from "lucide-react";
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
import { formatRelativeTime } from "@/lib/utils";

export type BlogListType = {
  id: string;
  title: string;
  slug: string;
  category: string;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
};

export default function BlogClient({ data }: { data: BlogListType[] }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete post");
      
      toast.success("Blog post deleted");
      router.refresh();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<BlogListType>[] = [
    {
      accessorKey: "title",
      header: "Article Title",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-brand-text truncate max-w-[300px]">
            {row.original.title}
          </div>
          <div className="text-xs text-brand-muted font-mono">{row.original.slug}</div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.category}</span>,
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => {
        const isPub = row.original.isPublished;
        const pubDate = row.original.publishedAt;
        const isScheduled = isPub && pubDate && new Date(pubDate) > new Date();

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isScheduled ? "bg-blue-100 text-blue-700" :
            isPub ? "bg-green-100 text-green-700" : 
            "bg-amber-100 text-amber-700"
          }`}>
            {isScheduled ? "Scheduled" : isPub ? "Published" : "Draft"}
          </span>
        );
      },
    },
    {
      accessorKey: "publishedAt",
      header: "Publish Date",
      cell: ({ row }) => {
        if (!row.original.publishedAt) return <span className="text-brand-muted text-sm">-</span>;
        return (
          <div>
            <div className="text-sm font-medium">{format(new Date(row.original.publishedAt), "MMM d, yyyy")}</div>
            <div className="text-xs text-brand-muted flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatRelativeTime(row.original.publishedAt)}
            </div>
          </div>
        );
      },
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
                <Link href={`/admin/blog/${item.id}`}>
                  <Edit className="mr-2 h-4 w-4 text-brand-primary" /> Edit Article
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deletePost(item.id, item.title)} className="cursor-pointer text-red-600 focus:text-red-600">
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
          <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">Blog Posts</h1>
          <p className="text-brand-muted">Manage your clinic's health and wellness articles.</p>
        </div>
        <Button asChild size="lg" className="rounded-pill bg-brand-primary shadow-button text-white hover:bg-brand-secondary whitespace-nowrap">
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" /> Write New Article
          </Link>
        </Button>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
