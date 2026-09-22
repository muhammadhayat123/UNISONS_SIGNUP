"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCustomers, deleteCustomer } from '@/app/lib/api';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { ConfirmModal } from '@/app/components/ui/ConfirmModal';
import Toast from '@/app/components/ui/Toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const limit = 20;
  
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: 0, isLoading: false });

  useEffect(() => {
    fetchCustomers();
  }, [search, skip]);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const res = await getCustomers({ search, skip, limit });
      setCustomers(res?.customers || []);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      await deleteCustomer(confirmModal.id);
      setToast({ message: 'Customer deleted successfully', type: 'success' });
      setConfirmModal({ isOpen: false, id: 0, isLoading: false });
      fetchCustomers();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This will also remove all their inquiries and personnel."
        isLoading={confirmModal.isLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: 0, isLoading: false })}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Company Profiles</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <input 
          type="text" 
          placeholder="Search by name, ID, phone, email..." 
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
          className="w-full max-w-md rounded-md border border-gray-300 p-2 text-sm focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sector</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && customers.length === 0 ? (
                <tr><td colSpan={5}><LoadingSpinner /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No customers found</td></tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.customer_ref_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.sector || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{c.email || '-'}</div>
                      <div>{c.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link href={c.latest_inquiry_id ? `/admin/inquiries/${c.latest_inquiry_id}` : `#`} className="text-orange-600 hover:text-orange-900">View Details</Link>
                      <button onClick={() => setConfirmModal({ isOpen: true, id: c.id, isLoading: false })} className="text-red-600 hover:text-red-900">Delete</button>
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
            disabled={customers.length < limit} 
            onClick={() => setSkip(skip + limit)}
            className="px-4 py-2 border rounded text-sm disabled:opacity-50"
          >Next</button>
        </div>
      </div>
    </div>
  );
}
