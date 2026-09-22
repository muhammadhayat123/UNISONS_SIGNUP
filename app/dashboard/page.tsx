"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.designation === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/seller/dashboard');
    }
  }, [router]);

  return (
    <div className="page-bg flex h-screen items-center justify-center">
      <svg className="h-8 w-8 animate-spin text-orange-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  );
}
