"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getInquiries, getSellers, getAdmins } from '@/app/lib/api';
import { getStoredUser } from '@/app/lib/auth';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [inqRes, sellerRes, adminRes] = await Promise.all([
        getInquiries({ limit: 100 }).catch(() => ({ inquiries: [] })),
        getSellers().catch(() => []),
        getAdmins().catch(() => [])
      ]);
      setInquiries(inqRes?.inquiries || []);
      setSellers(sellerRes || []);
      setAdmins(adminRes || []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner /></div>;

  // KPI Calculations
  const totalInquiries = inquiries.length;
  const inProgress = inquiries.filter(i => ['In Progress', 'Pending', 'Contacted'].includes(i.status)).length;
  const completed = inquiries.filter(i => i.status === 'Completed').length;
  const totalSellers = sellers.length;
  const totalAdmins = admins.length;

  // Pie Chart Data
  const pieData = [
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Cancelled', value: inquiries.filter(i => ['Cancelled', 'Rejected'].includes(i.status)).length, color: '#ef4444' },
    { name: 'New/Other', value: totalInquiries - inProgress - completed - inquiries.filter(i => ['Cancelled', 'Rejected'].includes(i.status)).length, color: '#6b7280' }
  ].filter(d => d.value > 0);

  // Bar Chart Data (Seller Performance)
  const sellerPerformance: Record<string, number> = {};
  inquiries.forEach(inq => {
    const sellerName = inq.seller?.username || 'Unassigned';
    sellerPerformance[sellerName] = (sellerPerformance[sellerName] || 0) + 1;
  });
  const barData = Object.keys(sellerPerformance)
    .map(k => ({ name: k, inquiries: sellerPerformance[k] }))
    .sort((a, b) => b.inquiries - a.inquiries)
    .slice(0, 6); // Top 6 sellers

  // Recent Inquiries
  const recentInquiries = inquiries.slice(0, 7);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <Link href="/admin/inquiry/new" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 shadow-sm text-center">
          + New Inquiry
        </Link>
      </div>

      {/* Top Row: KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <MetricCard 
          title="Total Inquiries" value={totalInquiries} subtitle="All time" 
          color="text-blue-600" bg="bg-blue-50"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
        />
        <MetricCard 
          title="In Progress" value={inProgress} subtitle="Active work" 
          color="text-yellow-600" bg="bg-yellow-50"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
        />
        <MetricCard 
          title="Completed" value={completed} subtitle="Closed deals" 
          color="text-green-600" bg="bg-green-50"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
        />
        <MetricCard 
          title="Total Sellers" value={totalSellers} subtitle="Active teams" 
          color="text-indigo-600" bg="bg-indigo-50"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
        />
        <MetricCard 
          title="Total Admins" value={totalAdmins} subtitle="System admins" 
          color="text-purple-600" bg="bg-purple-50"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} 
        />
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Inquiry Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Seller Performance (Top 6)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} allowDecimals={false} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#374151', fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="inquiries" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Inquiries */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Recent Inquiries Overview</h2>
          <Link href="/admin/inquiries" className="text-sm font-medium text-orange-600 hover:text-orange-800 bg-orange-50 px-3 py-1.5 rounded-md">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentInquiries.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No inquiries found in the system.</td></tr>
              ) : (
                recentInquiries.map((inq: any) => (
                  <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{inq.inquiry_ref_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{inq.customer?.customer_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inq.seller?.username || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(inq.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={inq.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/inquiries/${inq.id}`} className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1.5 rounded-md inline-block">View Details</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, color, bg }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
