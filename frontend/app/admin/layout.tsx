"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Sparkles,
  Users2,
  FileSpreadsheet,
  Image as ImageIcon,
  ShieldAlert,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  PlusCircle,
} from "lucide-react";
import { apiService } from "@/services/api";
import { User } from "@/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      return;
    }

    const token = localStorage.getItem("pavilion_access_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    const storedUser = localStorage.getItem("pavilion_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {}
    }

    apiService.auth
      .getMe()
      .then((res) => {
        if (res.success) {
          setCurrentUser(res.data);
          localStorage.setItem("pavilion_user", JSON.stringify(res.data));
        }
      })
      .catch(() => {
        router.push("/admin/login");
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await apiService.auth.logout();
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono tracking-wider">Authenticating Pavilion CMS...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Projects CMS", href: "/admin/projects", icon: Building2 },
    { name: "Add Project", href: "/admin/projects/new", icon: PlusCircle },
    { name: "Leads / CRM", href: "/admin/leads", icon: FileSpreadsheet },
    { name: "Locations", href: "/admin/locations", icon: MapPin },
    { name: "Amenities & Types", href: "/admin/amenities", icon: Sparkles },
    { name: "Users & RBAC", href: "/admin/users", icon: Users2 },
    { name: "Audit Trail", href: "/admin/audit-logs", icon: ShieldAlert },
    { name: "Website Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-base font-bold font-serif text-white tracking-wider block">
                  PAVILION
                </span>
                <span className="text-[10px] text-amber-400 tracking-widest uppercase font-mono block -mt-1">
                  CMS ADMIN
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-200px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href) && item.href !== "/admin/projects/new");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Bottom */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
              {currentUser?.first_name?.[0] || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.first_name} {currentUser?.last_name}
              </p>
              <p className="text-[10px] text-amber-400 capitalize truncate">
                {currentUser?.role?.name || "Administrator"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 text-center py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>View Site</span>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-400 border border-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Pavilion Realty Enterprise CMS v1.0
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production API Active</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-900 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
