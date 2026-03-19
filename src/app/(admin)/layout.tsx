export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/session";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Admin Dashboard | Hospital Website",
  description: "Secure admin panel for hospital management.",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();
  
  // Resilient check: We only want to show the Sidebar if they are actually logged in.
  // We can skip the sidebar and layout structure if they are on the login form.
  if (!session?.isAdmin) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden overflow-y-auto w-full max-w-[100vw] lg:max-w-none">
        <div className="max-w-6xl mx-auto pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
