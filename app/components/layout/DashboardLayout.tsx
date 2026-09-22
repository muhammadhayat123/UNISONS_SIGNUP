"use client";
import React, { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "admin" | "seller";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (manages its own desktop fixed + mobile drawer) */}
      <Sidebar role={role} isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* ─── Mobile / Tablet Top Navbar (< lg) ─── */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label="Open navigation"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Center: App name on mobile bar */}
        <div className="flex flex-col items-center leading-none">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Inquiry Management</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600">System</span>
        </div>

        {/* Right: Role badge */}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${role === "admin" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
          {role === "admin" ? "Admin" : "Seller"}
        </span>
      </div>

      {/* ─── Main Content ─── */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
