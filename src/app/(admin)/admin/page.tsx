import { Metadata } from "next";
import { db, isDbConfigured } from "@/db";
import { appointments, contactMessages, services } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { CalendarCheck, MessageSquare, Users, Stethoscope, BookOpen, Image as ImageIcon, Settings, Database, AlertCircle } from "lucide-react";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Admin Dashboard | Hospital Website",
};

export default async function AdminDashboardPage() {
  let pendingApts = 0;
  let unreadMsgs = 0;
  let totalServices = 0;
  let recentApts: any[] = [];

  if (isDbConfigured) {
    try {
      const stats = await Promise.all([
        db
          .select({ value: count() })
          .from(appointments)
          .where(eq(appointments.status, "pending")),
        db
          .select({ value: count() })
          .from(contactMessages)
          .where(eq(contactMessages.status, "unread")),
        db
          .select({ value: count() })
          .from(services)
          .where(eq(services.isActive, true)),
        db
          .select()
          .from(appointments)
          .orderBy(desc(appointments.createdAt))
          .limit(5)
      ]);

      pendingApts = stats[0][0]?.value || 0;
      unreadMsgs = stats[1][0]?.value || 0;
      totalServices = stats[2][0]?.value || 0;
      recentApts = stats[3];
    } catch (err) {
      console.warn("[AdminDashboard] DB error:", (err as Error).message);
    }
  }

  const stats = [
    {
      label: "Pending Appointments",
      value: pendingApts,
      icon: CalendarCheck,
      color: "text-amber-600",
      bg: "bg-amber-100",
      link: "/admin/appointments",
    },
    {
      label: "Unread Messages",
      value: unreadMsgs,
      icon: MessageSquare,
      color: "text-red-600",
      bg: "bg-red-100",
      link: "/admin/messages",
    },
    {
      label: "Active Services",
      value: totalServices,
      icon: Stethoscope,
      color: "text-brand-primary",
      bg: "bg-brand-100",
      link: "/admin/services",
    },
    {
      label: "Total Patients Served",
      value: "850+",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      link: "#",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2">Dashboard Overview</h1>
        <p className="text-brand-muted">Welcome back to your hospital administration panel.</p>
      </div>

      {!isDbConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
             <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-amber-900 mb-1">Database Not Configured</h3>
            <p className="text-amber-800 text-sm leading-relaxed">
              Your <code>DATABASE_URL</code> is still using placeholder values. Stats and database-driven content 
              will not be displayed until you connect a real <b>Neon PostgreSQL</b> database in your <code>.env.local</code> file.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.link}
            className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-brand-border hover:shadow-card hover:-translate-y-1 transition-all"
          >
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <div className="text-3xl font-heading font-bold text-brand-text">{stat.value}</div>
              <div className="text-sm font-medium text-brand-muted">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border overflow-hidden">
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-brand-text">Recent Appointments</h2>
            <Link href="/admin/appointments" className="text-sm font-medium text-brand-primary hover:text-brand-secondary">
              View All
            </Link>
          </div>
          <div className="p-0">
            {recentApts.length === 0 ? (
              <div className="p-8 text-center text-brand-muted">No recent appointments.</div>
            ) : (
              <ul className="divide-y divide-brand-border">
                {recentApts.map((apt) => (
                  <li key={apt.id} className="p-6 hover:bg-brand-50 transition-colors flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-brand-text mb-1">{apt.patientName}</div>
                      <div className="text-sm text-brand-muted flex items-center gap-2">
                        <span>{apt.patientPhone}</span>
                        <span className="w-1 h-1 rounded-full bg-brand-border" />
                        <span>{apt.preferredDate}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        apt.status === "pending" ? "bg-amber-100 text-amber-700" :
                        apt.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                        apt.status === "completed" ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions (Static for now) */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-6">
           <h2 className="text-xl font-heading font-bold text-brand-text mb-6">Quick Actions</h2>
           <div className="grid grid-cols-2 gap-4">
             <Link href="/admin/blog/new" className="p-4 rounded-xl border border-brand-border bg-brand-50 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors group flex flex-col items-center justify-center text-center gap-2">
                <BookOpen className="h-8 w-8 text-brand-primary group-hover:text-white" />
                <span className="font-medium">Write Blog Post</span>
             </Link>
             <Link href="/admin/services/new" className="p-4 rounded-xl border border-brand-border bg-brand-50 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors group flex flex-col items-center justify-center text-center gap-2">
                <Stethoscope className="h-8 w-8 text-brand-primary group-hover:text-white" />
                <span className="font-medium">Add Service</span>
             </Link>
             <Link href="/admin/gallery" className="p-4 rounded-xl border border-brand-border bg-brand-50 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors group flex flex-col items-center justify-center text-center gap-2">
                <ImageIcon className="h-8 w-8 text-brand-primary group-hover:text-white" />
                <span className="font-medium">Upload Photo</span>
             </Link>
             <Link href="/admin/settings" className="p-4 rounded-xl border border-brand-border bg-brand-50 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors group flex flex-col items-center justify-center text-center gap-2">
                <Settings className="h-8 w-8 text-brand-primary group-hover:text-white" />
                <span className="font-medium">Update Hospital Info</span>
             </Link>
           </div>
        </div>

      </div>
    </div>
  );
}
