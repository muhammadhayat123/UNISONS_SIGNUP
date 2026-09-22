"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, getStoredUser } from "@/app/lib/auth";
import { useEffect, useRef, useState } from "react";

interface SidebarProps {
  role: "admin" | "seller";
  isOpen: boolean;
  onClose: () => void;
}

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/admin/customers", label: "Company Profiles", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/admin/sellers", label: "Sellers", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/admin/admins", label: "Admins", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

const sellerLinks = [
  { href: "/seller/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/seller/inquiries", label: "Inquiries", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/seller/customers", label: "Company Profiles", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/seller/inquiry/new", label: "New Inquiry", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email: string; designation: string } | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser({ username: stored.username, email: stored.email, designation: stored.designation });
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const links = role === "admin" ? adminLinks : sellerLinks;

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const NavContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo + App Name */}
      <div className="flex flex-col items-center px-6 pt-6 pb-5 border-b border-gray-100">
        <Image
          src="/logo.png"
          alt="Unisons Logo"
          width={140}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
        <div className="mt-3 text-center">
          <p className="text-xs font-bold tracking-widest uppercase leading-none">
  <span className="text-gray-400">Inquiry</span>{" "}
  <span className="text-orange-600">Management</span>
          </p>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase leading-none mt-0.5">System</p>
        </div>
        <div className="mt-3 w-full h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-orange-50 text-orange-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
              }`}
            >
              <svg
                className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? "text-orange-600" : "text-gray-400 group-hover:text-orange-500"}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              <span>{link.label}</span>
              {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-orange-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-gray-100 p-4 space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase">
              {user.username?.[0] ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">{user.username}</p>
              <p className="truncate text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Mobile/Tablet Drawer Overlay (< lg) ─── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 transform shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          aria-label="Close sidebar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <NavContent />
      </div>

      {/* ─── Desktop Fixed Sidebar (>= lg) ─── */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:shadow-sm">
        <NavContent />
      </div>
    </>
  );
}
