"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  LogOut,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = session?.user?.role;
  const basePath = `/dashboard/${role?.toLowerCase()}`;

  const getNavItems = (): NavItem[] => {
    if (role === "ADMIN") {
      return [
        { label: "Dashboard", href: `${basePath}`, icon: <LayoutDashboard size={20} /> },
        { label: "Kelola User", href: `${basePath}/users`, icon: <Users size={20} /> },
        { label: "Invoice", href: `${basePath}/invoices`, icon: <FileText size={20} /> },
        { label: "Undangan", href: `${basePath}/invitations`, icon: <Mail size={20} /> },
      ];
    }
    if (role === "USER") {
      return [
        { label: "Dashboard", href: `${basePath}`, icon: <LayoutDashboard size={20} /> },
        { label: "Client", href: `${basePath}/clients`, icon: <Users size={20} /> },
        { label: "Invoice", href: `${basePath}/invoices`, icon: <FileText size={20} /> },
        { label: "Undangan", href: `${basePath}/invitations`, icon: <Mail size={20} /> },
      ];
    }
    // CLIENT
    return [
      { label: "Dashboard", href: `${basePath}`, icon: <LayoutDashboard size={20} /> },
      { label: "Undangan Saya", href: `${basePath}/invitations`, icon: <Mail size={20} /> },
      { label: "RSVP", href: `${basePath}/rsvp`, icon: <Heart size={20} /> },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-purple-700">Undangan</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-purple-700">
                {session?.user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {role}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-gray-500">
            {session?.user?.email}
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
