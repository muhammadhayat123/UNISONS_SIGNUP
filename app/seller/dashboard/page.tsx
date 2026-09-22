"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getInquiries } from '@/app/lib/api';
import { getStoredUser } from '@/app/lib/auth';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

export default function SellerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const inqRes = await getInquiries({ limit: 100 }).catch(() => ({ inquiries: [] }));
      setInquiries(inqRes?.inquiries || []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner /></div>;

  // KPI Calculations
  const total = inquiries.length;
  const inProgress = inquiries.filter(i => i.status === 'In Progress' || i.status === 'Pending' || i.status === 'Contacted').length;
  const completed = inquiries.filter(i => i.status === 'Completed').length;
  const cancelled = inquiries.filter(i => i.status === 'Cancelled' || i.status === 'Rejected').length;

  // Pie Chart Data
  const pieData = [
    { name: 'In Progress', value: inProgress, color: '#f59e0b' },
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Cancelled', value: cancelled, color: '#ef4444' },
    { name: 'New/Other', value: total - inProgress - completed - cancelled, color: '#6b7280' }
  ].filter(d => d.value > 0);

  // Bar Chart Data
  const monthlyData: Record<string, number> = {};
  [...inquiries].reverse().forEach(inq => {
    const d = new Date(inq.created_at);
    const month = d.toLocaleString('default', { month: 'short' });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  const barData = Object.keys(monthlyData).map(k => ({ name: k, inquiries: monthlyData[k] })).slice(-6);

  // Recent Inquiries
  const recentInquiries = inquiries.slice(0, 7);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.username}</h1>
        <Link href="/seller/inquiry/new" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 shadow-sm text-center">
          + New Inquiry
        </Link>
      </div>

      {/* Top Row: KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Inquiries" value={total} subtitle="All time submissions" 
          color="text-blue-600" bg="bg-blue-50"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
        />
        <MetricCard 
          title="In Progress" value={inProgress} subtitle="Currently active" 
          color="text-yellow-600" bg="bg-yellow-50"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
        />
        <MetricCard 
          title="Completed" value={completed} subtitle="Successfully closed" 
          color="text-green-600" bg="bg-green-50"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
        />
        <MetricCard 
          title="Cancelled / Rejected" value={cancelled} subtitle="Action required" 
          color="text-red-600" bg="bg-red-50"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} 
        />
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Status Breakdown</h2>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Monthly Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} allowDecimals={false} />
                <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="inquiries" fill="#ea580c" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Inquiries */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Your Recent Inquiries</h2>
          <Link href="/seller/inquiries" className="text-sm font-medium text-orange-600 hover:text-orange-800 bg-orange-50 px-3 py-1.5 rounded-md">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submission Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recentInquiries.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No inquiries found. Create one to get started!</td></tr>
              ) : (
                recentInquiries.map((inq: any) => (
                  <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{inq.inquiry_ref_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{inq.customer?.customer_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(inq.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={inq.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/seller/inquiries/${inq.id}`} className="text-orange-600 hover:text-orange-900 bg-orange-50 px-3 py-1.5 rounded-md inline-block">View Details</Link>
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
