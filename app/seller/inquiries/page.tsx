"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getInquiries } from '@/app/lib/api';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import Toast from '@/app/components/ui/Toast';

export default function SellerInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [skip, setSkip] = useState(0);
  const limit = 20;
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);

  useEffect(() => {
    fetchInquiries();
  }, [search, status, sort, skip]);

  async function fetchInquiries() {
    try {
      setLoading(true);
      const res = await getInquiries({ search, status, sort, skip, limit });
      setInquiries(res?.inquiries || []);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Inquiries</h1>
        <Link href="/seller/inquiry/new" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
          New Inquiry
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          placeholder="Search ID, Customer, Email..." 
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
          className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
        />
        <select 
          value={status} 
          onChange={(e) => { setStatus(e.target.value); setSkip(0); }}
          className="rounded-md border border-gray-300 p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Contacted">Contacted</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select 
          value={sort} 
          onChange={(e) => { setSort(e.target.value); setSkip(0); }}
          className="rounded-md border border-gray-300 p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="recently_updated">Recently Updated</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Inquiry ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && inquiries.length === 0 ? (
                <tr><td colSpan={5}><LoadingSpinner /></td></tr>
              ) : inquiries.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No inquiries found</td></tr>
              ) : (
                inquiries.map((inq: any) => (
                  <tr key={inq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inq.inquiry_ref_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inq.customer?.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={inq.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(inq.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link href={`/seller/inquiries/${inq.id}`} className="text-orange-600 hover:text-orange-900">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button 
            disabled={skip === 0} 
            onClick={() => setSkip(skip - limit)}
            className="px-4 py-2 border rounded text-sm disabled:opacity-50"
          >Previous</button>
          <span className="text-sm text-gray-500">Showing page {skip / limit + 1}</span>
          <button 
            disabled={inquiries.length < limit} 
            onClick={() => setSkip(skip + limit)}
            className="px-4 py-2 border rounded text-sm disabled:opacity-50"
          >Next</button>
        </div>
      </div>
    </div>
  );
}
