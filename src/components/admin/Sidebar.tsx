"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  Image as ImageIcon,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarCheck },
  { name: "Services", href: "/admin/services", icon: Stethoscope },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Blog Posts", href: "/admin/blog", icon: BookOpen },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      toast.success("Logged out successfully");
    } catch (e) {
      toast.error("Error logging out");
    }
  }

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
              isActive
                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                : "text-brand-muted hover:bg-brand-50 hover:text-brand-primary"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-brand-muted group-hover:text-brand-primary"
              )}
            />
            {item.name}
          </Link>
        );
      })}
      
      <div className="pt-8 mt-8 border-t border-brand-border">
        <button
          onClick={() => {
            onClick?.();
            handleLogout();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors group"
        >
          <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Nav */}
      <div className="lg:hidden flex items-center justify-between border-b border-brand-border bg-white px-4 py-3 sticky top-0 z-40 shadow-sm">
        <Link href="/admin" className="font-heading font-bold text-xl text-brand-primary">
          Hospital<span className="text-brand-text">Admin</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-brand-muted hover:text-brand-primary">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-white border-r border-brand-border p-6 shadow-sidebar">
            <div className="font-heading font-bold text-2xl text-brand-primary mb-8 px-4">
              Hospital<span className="text-brand-text">Admin</span>
            </div>
            <NavLinks />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-72 bg-white border-r border-brand-border min-h-screen p-6 shadow-sidebar sticky top-0 h-screen overflow-y-auto">
        <Link href="/admin" className="font-heading font-bold text-2xl text-brand-primary mb-8 px-4 flex items-center gap-2">
          <Stethoscope className="h-8 w-8" />
          <span>Hospital<span className="text-brand-text">Admin</span></span>
        </Link>
        <NavLinks />
      </div>
    </>
  );
}
