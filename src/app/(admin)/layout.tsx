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
  
  // We cannot use usePathname in a server component. 
  // We can loosely check if the current path is NOT login by examining headers if needed,
  // but a simpler approach is handling unprotected routes in middleware.
  // Our middleware already protects `/admin` routes.
  // However, `AdminLayout` wraps the ENTIRE `(admin)` group, which includes `/admin/login`.
  // We ONLY want to show the Sidebar if they are actually logged in.
  const pathname = headers().get("x-pathname") || "";
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center font-sans">
        {children}
      </div>
    );
  }

  // If not on login, enforce session presence just in case middleware fails
  if (!session?.isAdmin) {
    redirect("/admin/login");
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
