"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getInquiry, downloadInquiryPDF, deleteInquiry } from "@/app/lib/api";
import { getStoredUser } from "@/app/lib/auth";
import Toast from "@/app/components/ui/Toast";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ConfirmModal } from "@/app/components/ui/ConfirmModal";

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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function SellerInquiryDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) { router.replace("/login"); return; }
    if (user.designation !== "seller") { router.replace("/admin/dashboard"); return; }
    loadInquiry();
  }, [id]);

  async function loadInquiry() {
    setLoading(true);
    try {
      const data = await getInquiry(Number(id));
      setInquiry(data);
    } catch (e: unknown) {
      setToast({ message: e instanceof Error ? e.message : "Failed to load inquiry", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;
  if (!inquiry) return <div className="flex-1 flex items-center justify-center text-gray-500">Inquiry not found.</div>;

  const { customer, seller, additional_info: ai, furnace_details: fd, ccm_details: ccm, rolling_mill_details: rm, products, special_instructions: si, signature } = inquiry;

  const handleDownload = async () => {
    try {
      const blob = await downloadInquiryPDF(Number(id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inquiry-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInquiry(Number(id));
      setToast({ message: "Inquiry deleted successfully", type: "success" });
      setConfirmModal(false);
      setTimeout(() => router.push("/seller/inquiries"), 1000);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}
      <ConfirmModal
        isOpen={confirmModal}
        title="Delete Inquiry"
        message={`Are you sure you want to delete inquiry ${inquiry.inquiry_ref_id}? This action cannot be undone.`}
        isLoading={false}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal(false)}
      />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-orange-400">
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">{inquiry.inquiry_ref_id}</span>
              <StatusBadge status={inquiry.status} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Created {new Date(inquiry.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PDF
          </button>
          <Link href={`/seller/inquiry/new?edit=${id}`} className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Inquiry
          </Link>
          <button onClick={() => setConfirmModal(true)} className="flex items-center gap-2 border border-red-300 bg-white text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete Inquiry
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Customer Info */}
        <SectionCard title="Customer Information">
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <InfoRow label="Customer ID" value={customer?.customer_ref_id} />
            <InfoRow label="Customer Name" value={customer?.customer_name} />
            <InfoRow label="Sector" value={customer?.sector} />
            <InfoRow label="Phone" value={customer?.phone} />
            <InfoRow label="Email" value={customer?.email} />
            <InfoRow label="Website" value={customer?.website} />
            <InfoRow label="Factory Address" value={customer?.factory_address} />
            <InfoRow label="HO Address" value={customer?.ho_address} />
          </dl>
        </SectionCard>

        {/* Personnel */}
        {customer?.personnel?.length > 0 && (
          <SectionCard title="Personnel / Contacts">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>{["Ref ID", "Name", "Department", "Designation", "Email", "Phone"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customer.personnel.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-500">{p.personnel_ref_id}</td>
                      <td className="px-3 py-2 font-semibold text-gray-800">{p.concerned_person}</td>
                      <td className="px-3 py-2 text-gray-600">{p.department || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{p.designation || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{p.email || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{p.phone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* Additional Info */}
        {ai && (
          <SectionCard title="Additional Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="Employee" value={ai.employee} />
              <InfoRow label="Source" value={ai.source} />
              <InfoRow label="Local / Import" value={ai.local_import} />
              <InfoRow label="New / Repeat" value={ai.new_repeat} />
              <InfoRow label="Repeat Case No." value={ai.repeat_case_no} />
              <InfoRow label="Req. Origin" value={ai.req_origin} />
              <InfoRow label="Incoterms" value={ai.incoterms} />
              <InfoRow label="Department" value={ai.department} />
              <InfoRow label="Sub-Department" value={ai.sub_department} />
              <InfoRow label="Currency" value={ai.currency} />
            </dl>
          </SectionCard>
        )}

        {/* Furnace Details */}
        {fd && (
          <SectionCard title="Furnace Details">
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <InfoRow label="No. of Furnaces" value={fd.no_of_furnaces} />
              <InfoRow label="TPD" value={fd.tpd} />
            </dl>
            {fd.furnaces?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50"><tr>{["Ref ID", "Furnace No.", "Capacity (Ton)", "Capacity (MW)"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">{fd.furnaces.map((f: any) => <tr key={f.id} className="hover:bg-gray-50"><td className="px-3 py-2 text-xs text-gray-500">{f.furnace_ref_id}</td><td className="px-3 py-2">{f.furnace_no || "—"}</td><td className="px-3 py-2">{f.capacity_ton ?? "—"}</td><td className="px-3 py-2">{f.capacity_mw ?? "—"}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </SectionCard>
        )}

        {/* CCM Details */}
        {ccm && (
          <SectionCard title="CCM Details">
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="Radius" value={ccm.radius} />
              <InfoRow label="Length of Tube" value={ccm.length_of_tube} />
              <InfoRow label="Manual Open Tanky" value={ccm.manual_open_tanky} />
              <InfoRow label="Strands" value={ccm.strands} />
              <InfoRow label="CMT Size" value={ccm.cmt_size} />
              <InfoRow label="SGM Size" value={ccm.sgm_size} />
              <InfoRow label="Tundish Nozzle Size" value={ccm.tundish_nozzle_size} />
              <InfoRow label="Supplier" value={ccm.supplier} />
            </dl>
          </SectionCard>
        )}

        {/* Rolling Mill */}
        {rm && (
          <SectionCard title="Rolling Mill Details">
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <InfoRow label="Plant Capacity (TPD)" value={rm.plant_capacity_tpd} />
              <InfoRow label="Plant Capacity (TPH)" value={rm.plant_capacity_tph} />
              <InfoRow label="Supplier" value={rm.supplier} />
              <InfoRow label="Total Stands" value={rm.total_stands} />
            </dl>
            {rm.stands?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead className="bg-gray-50"><tr>{["Ref ID", "Mill Type", "Stand Code", "Arrangement"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">{rm.stands.map((s: any) => <tr key={s.id} className="hover:bg-gray-50"><td className="px-3 py-2 text-xs text-gray-500">{s.stand_ref_id}</td><td className="px-3 py-2">{s.mill_type || "—"}</td><td className="px-3 py-2">{s.stand_code || "—"}</td><td className="px-3 py-2">{s.arrangement_type || "—"}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </SectionCard>
        )}

        {/* Products */}
        {products?.length > 0 && (
          <SectionCard title={`Product Details (${products.length})`}>
            <div className="space-y-5">
              {products.map((p: any, i: number) => (
                <div key={p.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 rounded px-2 py-0.5">{p.product_ref_id}</span>
                    <span className="font-semibold text-gray-800">Product {i + 1}: {p.product_name}</span>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <InfoRow label="Department" value={p.department} />
                    <InfoRow label="Quantity" value={p.quantity} />
                    <InfoRow label="No. of Items" value={p.no_of_item} />
                    <InfoRow label="New/Replacement" value={p.new_replacement} />
                    <InfoRow label="Required Brand" value={p.required_brand} />
                    <InfoRow label="Required Model No." value={p.required_model_number} />
                    <InfoRow label="Installed Location" value={p.installed_location} />
                    <InfoRow label="Existing Brand/Model" value={p.existing_brand_or_model} />
                    <InfoRow label="Application/Usage" value={p.application_usage} />
                    <InfoRow label="Drawing" value={p.drawing} />
                    <InfoRow label="Layout" value={p.layout} />
                    <InfoRow label="Remarks" value={p.remarks} />
                    <InfoRow label="Detailed Specs" value={p.detailed_specifications} />
                  </dl>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Special Instructions */}
        {si?.special_instructions && (
          <SectionCard title="Special Instructions">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{si.special_instructions}</p>
          </SectionCard>
        )}

        {/* Signatures */}
        {signature && (
          <SectionCard title="Signatures">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Unisons Sales Representative</p>
                <p className="text-sm font-semibold text-gray-800">{signature.unisons_sales_rep || "—"}</p>
                <div className="mt-3 h-px bg-gray-300 w-48" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Customer Signature</p>
                <p className="text-sm font-semibold text-gray-800">{signature.customer_signature || "—"}</p>
                <div className="mt-3 h-px bg-gray-300 w-48" />
              </div>
            </div>
          </SectionCard>
        )}

        {/* Seller Info */}
        <SectionCard title="Submitted By">
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <InfoRow label="Seller ID" value={seller?.id} />
            <InfoRow label="Seller Name" value={seller?.username} />
            <InfoRow label="Seller Email" value={seller?.email} />
          </dl>
        </SectionCard>

        {/* Timestamps */}
        <SectionCard title="Timestamps">
          <dl className="grid grid-cols-2 gap-4">
            <InfoRow label="Created At" value={inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : undefined} />
            <InfoRow label="Updated At" value={inquiry.updated_at ? new Date(inquiry.updated_at).toLocaleString() : undefined} />
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
