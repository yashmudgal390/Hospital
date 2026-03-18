"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MailOpen, Archive, Star, Mail, Trash2 } from "lucide-react";
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

export type ContactMessage = {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  isStarred: boolean;
  createdAt: Date;
};

export default function MessagesClient({ data }: { data: ContactMessage[] }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateMessage = async (id: string, updates: Partial<ContactMessage>) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/contact/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update message");
      
      router.refresh();
      toast.success("Message updated");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this message?")) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete message");
      
      router.refresh();
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: ColumnDef<ContactMessage>[] = [
    {
      id: "isStarred",
      header: "",
      cell: ({ row }) => (
        <button 
          onClick={() => updateMessage(row.original.id, { isStarred: !row.original.isStarred })}
          disabled={isUpdating}
          className="p-1 hover:bg-brand-100 rounded-full transition-colors disabled:opacity-50"
        >
          <Star className={`h-4 w-4 ${row.original.isStarred ? "fill-amber-400 text-amber-500" : "text-brand-border"}`} />
        </button>
      ),
    },
    {
      accessorKey: "senderName",
      header: "Sender",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-brand-text">{row.original.senderName}</div>
          <div className="text-xs text-brand-muted">{row.original.senderEmail}</div>
          {row.original.senderPhone && <div className="text-xs text-brand-muted">{row.original.senderPhone}</div>}
        </div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject / Message",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <div className={`font-medium ${row.original.status === 'unread' ? 'text-brand-text' : 'text-brand-muted'}`}>
            {row.original.subject}
          </div>
          <div className="text-xs text-brand-muted truncate" title={row.original.message}>
            {row.original.message}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Received",
      cell: ({ row }) => (
        <div className="text-sm font-medium whitespace-nowrap">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={
            status === "unread" ? "bg-red-100 text-red-700 hover:bg-red-200" :
            status === "read" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
            status === "replied" ? "bg-green-100 text-green-700 hover:bg-green-200" :
            "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const msg = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-brand-border rounded-xl">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => window.location.href = `mailto:${msg.senderEmail}?subject=Re: ${msg.subject}`} className="cursor-pointer">
                <Mail className="mr-2 h-4 w-4 text-brand-primary" /> Reply via Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {msg.status !== "unread" && (
                <DropdownMenuItem onClick={() => updateMessage(msg.id, { status: "unread" })} className="cursor-pointer">
                  <Mail className="mr-2 h-4 w-4 text-red-600" /> Mark Unread
                </DropdownMenuItem>
              )}
              {msg.status !== "read" && (
                <DropdownMenuItem onClick={() => updateMessage(msg.id, { status: "read" })} className="cursor-pointer">
                  <MailOpen className="mr-2 h-4 w-4 text-blue-600" /> Mark Read
                </DropdownMenuItem>
              )}
              {msg.status !== "archived" && (
                <DropdownMenuItem onClick={() => updateMessage(msg.id, { status: "archived" })} className="cursor-pointer text-gray-600">
                   <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => deleteMessage(msg.id)} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                 <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">Inbox & Messages</h1>
        <p className="text-brand-muted">View general inquiries from the contact form.</p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
