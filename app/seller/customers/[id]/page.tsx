"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getCustomer, getCustomerInquiries } from "@/app/lib/api";
import { getStoredUser } from "@/app/lib/auth";
import Toast from "@/app/components/ui/Toast";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
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
  personnel: Personnel[];
}

interface Inquiry {
  id: number;
  inquiry_ref_id: string;
  status: string;
  created_at: string;
}

interface ToastState { message: string; type: "success" | "error"; }

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-medium text-gray-800 mt-0.5">{String(value)}</dd>
    </div>
  );
}

export default function SellerCustomerDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const customerId = Number(id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) { router.replace("/login"); return; }
    if (user.designation !== "seller") { router.replace("/admin/dashboard"); return; }
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
      setInquiries(inqRes.inquiries || []);
    } catch {
      setToast({ message: "Failed to load customer", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;
  if (!customer) return <div className="flex-1 flex items-center justify-center text-gray-500">Customer not found.</div>;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}

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
        {/* Customer Details — Read Only */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">Customer Details</h2>
            <dl className="space-y-3">
              <InfoRow label="Ref ID" value={customer.customer_ref_id} />
              <InfoRow label="Customer Name" value={customer.customer_name} />
              <InfoRow label="Sector" value={customer.sector} />
              <InfoRow label="Phone" value={customer.phone} />
              <InfoRow label="Email" value={customer.email} />
              <InfoRow label="Website" value={customer.website} />
              <InfoRow label="Factory Address" value={customer.factory_address} />
              <InfoRow label="HO Address" value={customer.ho_address} />
            </dl>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          {/* Personnel — Read Only */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-800">Personnel / Contacts</h2>
            </div>
            {customer.personnel.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-400">No personnel on record.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>{["Ref ID", "Name", "Department", "Designation", "Email", "Phone"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customer.personnel.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500">{p.personnel_ref_id}</td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{p.concerned_person}</td>
                        <td className="px-4 py-3 text-gray-600">{p.department || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{p.designation || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{p.email || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{p.phone || "—"}</td>
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
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>{["Inquiry ID", "Status", "Date", "Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inquiries.map(inq => (
                      <tr key={inq.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">{inq.inquiry_ref_id}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={inq.status} /></td>
                        <td className="px-4 py-3 text-gray-600">{new Date(inq.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <Link href={`/seller/inquiries/${inq.id}`} className="text-xs font-semibold text-orange-600 hover:underline">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Link */}
          <div className="flex justify-end">
            <Link href="/seller/inquiry/new" className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700 shadow-sm transition-colors">
              + New Inquiry for this Customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
