"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/DataTable";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check, Clock, X, PhoneCall } from "lucide-react";
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

// Define the shape of our data
export type Appointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  serviceName: string | null;
  preferredDate: string;
  preferredTime: string | null;
  reasonForVisit: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
  isCallbackRequest: boolean;
};

export default function AppointmentsClient({ data }: { data: Appointment[] }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (id: string, status: Appointment["status"]) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Appointment marked as ${status}`);
      router.refresh();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete appointment");
      
      toast.success("Appointment deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Error deleting appointment");
    } finally {
      setIsUpdating(false);
    }
  };

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "patientName",
      header: "Patient",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-brand-text">{row.original.patientName}</div>
          <div className="text-xs text-brand-muted">{row.original.patientPhone}</div>
          {row.original.patientEmail && <div className="text-xs text-brand-muted">{row.original.patientEmail}</div>}
        </div>
      ),
    },
    {
      accessorKey: "serviceName",
      header: "Service",
      cell: ({ row }) => (
        <span className="text-brand-text/90">{row.original.serviceName || "General / None"}</span>
      ),
    },
    {
      accessorKey: "preferredDate",
      header: "Requested Date/Time",
      cell: ({ row }) => (
        <div>
           <div className="font-medium">{format(new Date(row.original.preferredDate), "MMM d, yyyy")}</div>
           {row.original.preferredTime && <div className="text-xs text-brand-muted">{row.original.preferredTime}</div>}
        </div>
      ),
    },
    {
      accessorKey: "reasonForVisit",
      header: "Reason",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-brand-muted" title={row.original.reasonForVisit}>
          {row.original.reasonForVisit}
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={
            status === "pending" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
            status === "confirmed" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
            status === "completed" ? "bg-green-100 text-green-700 hover:bg-green-200" :
            "bg-red-100 text-red-700 hover:bg-red-200"
          }>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const apt = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-brand-border rounded-xl">
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {apt.status !== "pending" && (
                <DropdownMenuItem onClick={() => updateStatus(apt.id, "pending")} className="cursor-pointer">
                  <Clock className="mr-2 h-4 w-4 text-amber-600" /> Pending
                </DropdownMenuItem>
              )}
              {apt.status !== "confirmed" && (
                <DropdownMenuItem onClick={() => updateStatus(apt.id, "confirmed")} className="cursor-pointer">
                  <Check className="mr-2 h-4 w-4 text-blue-600" /> Confirm
                </DropdownMenuItem>
              )}
              {apt.status !== "completed" && (
                <DropdownMenuItem onClick={() => updateStatus(apt.id, "completed")} className="cursor-pointer">
                   <PhoneCall className="mr-2 h-4 w-4 text-green-600" /> Mark Completed
                </DropdownMenuItem>
              )}
              {apt.status !== "cancelled" && (
                <DropdownMenuItem onClick={() => updateStatus(apt.id, "cancelled")} className="cursor-pointer text-red-600 focus:text-red-600">
                  <X className="mr-2 h-4 w-4" /> Cancel
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => deleteAppointment(apt.id)} 
                className="cursor-pointer text-red-600 focus:text-red-600 font-medium"
              >
                <X className="mr-2 h-4 w-4" /> Delete Appointment
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
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">Appointments</h1>
        <p className="text-brand-muted">Manage patient appointment and callback requests.</p>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
