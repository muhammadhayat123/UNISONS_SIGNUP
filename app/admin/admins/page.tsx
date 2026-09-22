"use client";
import React, { useEffect, useState } from 'react';
import { getAdmins, createAdmin, updateAdmin, toggleAdmin, deleteAdmin } from '@/app/lib/api';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { ConfirmModal } from '@/app/components/ui/ConfirmModal';
import Toast from '@/app/components/ui/Toast';

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: 0, username: '', email: '', phone: '', password: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: 0, isLoading: false });

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);
      const res = await getAdmins();
      setAdmins(res || []);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (admin?: any) => {
    if (admin) {
      setForm({ id: admin.id, username: admin.username, email: admin.email, phone: admin.phone || '', password: '' });
    } else {
      setForm({ id: 0, username: '', email: '', phone: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) {
        const payload: any = { username: form.username, email: form.email, phone: form.phone };
        if (form.password) payload.password = form.password;
        await updateAdmin(form.id, payload);
        setToast({ message: 'Admin updated successfully', type: 'success' });
      } else {
        await createAdmin({ username: form.username, email: form.email, phone: form.phone, password: form.password });
        setToast({ message: 'Admin created successfully', type: 'success' });
      }
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleAdmin(id);
      fetchAdmins();
      setToast({ message: 'Admin status updated', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    try {
      await deleteAdmin(confirmModal.id);
      setToast({ message: 'Admin deleted successfully', type: 'success' });
      setConfirmModal({ isOpen: false, id: 0, isLoading: false });
      fetchAdmins();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This action cannot be undone."
        isLoading={confirmModal.isLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: 0, isLoading: false })}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admins</h1>
        <button onClick={() => handleOpenModal()} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
          Add Admin
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No admins found</td></tr>
              ) : (
                admins.map((admin: any) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => handleToggle(admin.id)} className="text-blue-600 hover:text-blue-900">Toggle</button>
                      <button onClick={() => handleOpenModal(admin)} className="text-orange-600 hover:text-orange-900">Edit</button>
                      <button onClick={() => setConfirmModal({ isOpen: true, id: admin.id, isLoading: false })} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">{form.id ? 'Edit Admin' : 'Add Admin'}</h3>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password {form.id && '(Leave blank to keep)'}</label>
                <input required={!form.id} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
