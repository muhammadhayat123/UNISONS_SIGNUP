"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getCustomer,
  updateCustomer,
  addPersonnel,
  updatePersonnel,
  deletePersonnel,
  getCustomerInquiries,
} from "@/app/lib/api";
import { getStoredUser } from "@/app/lib/auth";
import Toast from "@/app/components/ui/Toast";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { ConfirmModal } from "@/app/components/ui/ConfirmModal";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

interface Personnel {
  id: number;
  personnel_ref_id: string;
  concerned_person: string;
  department?: string;
  designation?: string;
  email?: string;
  phone?: string;
}

interface Customer {
  id: number;
  customer_ref_id: string;
  customer_name: string;
  sector?: string;
  phone?: string;
  email?: string;
  website?: string;
  factory_address?: string;
  ho_address?: string;
  inquiry_date?: string;
  personnel: Personnel[];
}

interface Inquiry {
  id: number;
  inquiry_ref_id: string;
  status: string;
  created_at: string;
  seller?: { username: string };
}

interface ToastState { message: string; type: "success" | "error"; }

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

export default function AdminCustomerDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  // Edit customer
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);

  // Personnel modal
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [personnelForm, setPersonnelForm] = useState({ concerned_person: "", department: "", designation: "", email: "", phone: "" });
  const [savingPersonnel, setSavingPersonnel] = useState(false);

  // Delete personnel
  const [deletePersonnelTarget, setDeletePersonnelTarget] = useState<Personnel | null>(null);
  const [deletingPersonnel, setDeletingPersonnel] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) { router.replace("/login"); return; }
    if (user.designation !== "admin") { router.replace("/seller/dashboard"); return; }
    loadData();
  }, [customerId]);

  async function loadData() {
    setLoading(true);
    try {
      const [cust, inqRes] = await Promise.all([
        getCustomer(customerId),
        getCustomerInquiries(customerId),
      ]);
      setCustomer(cust);
      setEditData({
        customer_name: cust.customer_name,
        sector: cust.sector,
        phone: cust.phone,
        email: cust.email,
        website: cust.website,
        factory_address: cust.factory_address,
        ho_address: cust.ho_address,
      });
      setInquiries(inqRes.inquiries || []);
    } catch {
      setToast({ message: "Failed to load customer", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCustomer() {
    setSaving(true);
    try {
      await updateCustomer(customerId, editData);
      setToast({ message: "Customer updated", type: "success" });
      setEditMode(false);
      loadData();
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Failed to update", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function openAddPersonnel() {
    setEditingPersonnel(null);
    setPersonnelForm({ concerned_person: "", department: "", designation: "", email: "", phone: "" });
    setShowPersonnelModal(true);
  }

  function openEditPersonnel(p: Personnel) {
    setEditingPersonnel(p);
    setPersonnelForm({ concerned_person: p.concerned_person, department: p.department || "", designation: p.designation || "", email: p.email || "", phone: p.phone || "" });
    setShowPersonnelModal(true);
  }

  async function handleSavePersonnel() {
    if (!personnelForm.concerned_person.trim()) {
      setToast({ message: "Contact person name is required", type: "error" });
      return;
    }
    setSavingPersonnel(true);
    try {
      if (editingPersonnel) {
        await updatePersonnel(customerId, editingPersonnel.id, personnelForm);
        setToast({ message: "Personnel updated", type: "success" });
      } else {
        await addPersonnel(customerId, personnelForm);
        setToast({ message: "Personnel added", type: "success" });
      }
      setShowPersonnelModal(false);
      loadData();
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Failed to save", type: "error" });
    } finally {
      setSavingPersonnel(false);
    }
  }

  async function handleDeletePersonnel() {
    if (!deletePersonnelTarget) return;
    setDeletingPersonnel(true);
    try {
      await deletePersonnel(customerId, deletePersonnelTarget.id);
      setToast({ message: "Personnel removed", type: "success" });
      setDeletePersonnelTarget(null);
      loadData();
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Failed to delete", type: "error" });
    } finally {
      setDeletingPersonnel(false);
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;
  if (!customer) return <div className="flex-1 flex items-center justify-center text-gray-500">Customer not found.</div>;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}

      {/* Delete Personnel Confirm */}
      {deletePersonnelTarget && (
        <ConfirmModal
          isOpen={!!deletePersonnelTarget}
          title="Remove Personnel"
          message={`Remove ${deletePersonnelTarget.concerned_person} from this customer?`}
          onConfirm={handleDeletePersonnel}
          onCancel={() => setDeletePersonnelTarget(null)}
          isLoading={deletingPersonnel}
        />
      )}

      {/* Personnel Modal */}
      {showPersonnelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{editingPersonnel ? "Edit Personnel" : "Add Personnel"}</h2>
            <div className="space-y-3">
              {[["Contact Person*", "concerned_person", "text"], ["Department", "department", "text"], ["Designation/Title", "designation", "text"], ["Email", "email", "email"], ["Phone", "phone", "tel"]].map(([lbl, key, type]) => (
                <div key={key}>
                  <label className={labelCls}>{lbl}</label>
                  <input type={type} value={personnelForm[key as keyof typeof personnelForm]} onChange={e => setPersonnelForm(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowPersonnelModal(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSavePersonnel} disabled={savingPersonnel} className="flex-1 rounded-lg bg-orange-600 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-60">
                {savingPersonnel ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-orange-400">
          ← Back
        </button>
        <div>
          <p className="text-xs text-gray-500 font-medium">{customer.customer_ref_id}</p>
          <h1 className="text-2xl font-bold text-gray-900">{customer.customer_name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Customer Details */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Customer Details</h2>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="text-xs font-semibold text-orange-600 hover:underline">Edit</button>
              )}
            </div>
            {editMode ? (
              <div className="space-y-3">
                {[["Customer Name*", "customer_name"], ["Sector", "sector"], ["Phone", "phone"], ["Email", "email"], ["Website", "website"]].map(([lbl, key]) => (
                  <div key={key}>
                    <label className={labelCls}>{lbl}</label>
                    <input value={(editData as Record<string, string>)[key] || ""} onChange={e => setEditData(d => ({ ...d, [key]: e.target.value }))} className={inputCls} />
                  </div>
                ))}
                <div>
                  <label className={labelCls}>Factory Address</label>
                  <textarea value={editData.factory_address || ""} onChange={e => setEditData(d => ({ ...d, factory_address: e.target.value }))} className={inputCls} rows={2} />
                </div>
                <div>
                  <label className={labelCls}>HO Address</label>
                  <textarea value={editData.ho_address || ""} onChange={e => setEditData(d => ({ ...d, ho_address: e.target.value }))} className={inputCls} rows={2} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditMode(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700">Cancel</button>
                  <button onClick={handleSaveCustomer} disabled={saving} className="flex-1 rounded-lg bg-orange-600 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
                </div>
              </div>
            ) : (
              <dl className="space-y-3">
                {[["Ref ID", customer.customer_ref_id], ["Sector", customer.sector], ["Phone", customer.phone], ["Email", customer.email], ["Website", customer.website], ["Factory Address", customer.factory_address], ["HO Address", customer.ho_address]].map(([label, value]) => value ? (
                  <div key={label as string}>
                    <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</dt>
                    <dd className="text-sm font-medium text-gray-800 mt-0.5">{value as string}</dd>
                  </div>
                ) : null)}
              </dl>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          {/* Personnel */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-800">Personnel / Contacts</h2>
              <button onClick={openAddPersonnel} className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700">
                + Add Person
              </button>
            </div>
            {customer.personnel.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400">No personnel added yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>{["Ref ID", "Name", "Department", "Designation", "Email", "Phone", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customer.personnel.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500">{p.personnel_ref_id}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800">{p.concerned_person}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.department || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.designation || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.email || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditPersonnel(p)} className="text-xs font-semibold text-orange-600 hover:underline">Edit</button>
                            <button onClick={() => setDeletePersonnelTarget(p)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inquiry History */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-800">Inquiry History ({inquiries.length})</h2>
            </div>
            {inquiries.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400">No inquiries for this customer yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>{["Inquiry ID", "Status", "Date", "Action"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">{inq.inquiry_ref_id}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={inq.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(inq.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/inquiries/${inq.id}`} className="text-xs font-semibold text-orange-600 hover:underline">View →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
