"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInquiry, updateInquiryStatus, deleteInquiry, downloadInquiryPDF } from '@/app/lib/api';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import Toast from '@/app/components/ui/Toast';
import { ConfirmModal } from '@/app/components/ui/ConfirmModal';

export default function AdminInquiryDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);
  const [status, setStatus] = useState('');
  const [confirmModal, setConfirmModal] = useState(false);

  useEffect(() => {
    fetchInquiry();
  }, [id]);

  async function fetchInquiry() {
    try {
      setLoading(true);
      const res = await getInquiry(Number(id));
      setInquiry(res);
      setStatus(res.status);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async () => {
    try {
      await updateInquiryStatus(Number(id), status);
      setToast({ message: 'Status updated', type: 'success' });
      fetchInquiry();
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

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
      router.push('/admin/inquiries');
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
      setConfirmModal(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!inquiry) return <div>Inquiry not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal
        isOpen={confirmModal}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry?"
        isLoading={false}
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal(false)}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {inquiry.inquiry_ref_id}
            <StatusBadge status={inquiry.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">Created: {new Date(inquiry.created_at).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-4 border-r pr-4">
            <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500">
              <option value="New">New</option><option value="In Progress">In Progress</option>
              <option value="Contacted">Contacted</option><option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button onClick={handleStatusChange} className="bg-orange-100 text-orange-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-200">Update Status</button>
          </div>
          <button onClick={handleDownload} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PDF
          </button>
          <Link href={`/admin/inquiry/new?edit=${id}`} className="flex items-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Inquiry
          </Link>
          <button onClick={() => setConfirmModal(true)} className="flex items-center gap-2 border border-red-300 bg-white text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete Inquiry
          </button>
        </div>
      </div>

      <Section title="Customer Info">
        <Grid>
          <Info label="Name" value={inquiry.customer?.customer_name} />
          <Info label="Email" value={inquiry.customer?.email} />
          <Info label="Phone" value={inquiry.customer?.phone} />
          <Info label="Sector" value={inquiry.customer?.sector} />
        </Grid>
      </Section>

      {inquiry.customer?.personnel?.length > 0 && (
        <Section title="Personnel">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr><th className="px-4 py-2 text-left text-xs text-gray-500">Name</th><th className="px-4 py-2 text-left text-xs text-gray-500">Dept</th><th className="px-4 py-2 text-left text-xs text-gray-500">Email</th></tr>
              </thead>
              <tbody>
                {inquiry.customer.personnel.map((p:any) => (
                  <tr key={p.id} className="border-t"><td className="px-4 py-2 text-sm">{p.concerned_person}</td><td className="px-4 py-2 text-sm">{p.department}</td><td className="px-4 py-2 text-sm">{p.email}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {inquiry.additional_info && (
        <Section title="Additional Info">
          <Grid>
            {Object.entries(inquiry.additional_info).map(([k,v]) => <Info key={k} label={k.replace(/_/g, ' ')} value={v as string} />)}
          </Grid>
        </Section>
      )}

      {inquiry.furnace_details && (
        <Section title="Furnace Details">
          <Grid>
            <Info label="No of Furnaces" value={inquiry.furnace_details.no_of_furnaces} />
            <Info label="TPD" value={inquiry.furnace_details.tpd} />
          </Grid>
          {inquiry.furnace_details.furnaces?.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs text-gray-500">No</th><th className="px-4 py-2 text-left text-xs text-gray-500">Cap (Ton)</th><th className="px-4 py-2 text-left text-xs text-gray-500">Cap (MW)</th></tr></thead>
                <tbody>
                  {inquiry.furnace_details.furnaces.map((f:any) => <tr key={f.id} className="border-t"><td className="px-4 py-2 text-sm">{f.furnace_no}</td><td className="px-4 py-2 text-sm">{f.capacity_ton}</td><td className="px-4 py-2 text-sm">{f.capacity_mw}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {inquiry.ccm_details && (
        <Section title="CCM Details">
          <Grid>
            {Object.entries(inquiry.ccm_details).map(([k,v]) => <Info key={k} label={k.replace(/_/g, ' ')} value={v as string} />)}
          </Grid>
        </Section>
      )}
      
      {inquiry.rolling_mill_details && (
        <Section title="Rolling Mill Details">
          <Grid>
            <Info label="Capacity TPD" value={inquiry.rolling_mill_details.plant_capacity_tpd} />
            <Info label="Capacity TPH" value={inquiry.rolling_mill_details.plant_capacity_tph} />
            <Info label="Supplier" value={inquiry.rolling_mill_details.supplier} />
            <Info label="Total Stands" value={inquiry.rolling_mill_details.total_stands} />
          </Grid>
          {inquiry.rolling_mill_details.stands?.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs text-gray-500">Type</th><th className="px-4 py-2 text-left text-xs text-gray-500">Code</th><th className="px-4 py-2 text-left text-xs text-gray-500">Arrangement</th></tr></thead>
                <tbody>
                  {inquiry.rolling_mill_details.stands.map((s:any) => <tr key={s.id} className="border-t"><td className="px-4 py-2 text-sm">{s.mill_type}</td><td className="px-4 py-2 text-sm">{s.stand_code}</td><td className="px-4 py-2 text-sm">{s.arrangement_type}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {inquiry.products?.length > 0 && (
        <Section title="Products">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inquiry.products.map((p:any, i:number) => (
              <div key={p.id} className="border p-4 rounded-lg bg-gray-50">
                <h4 className="font-bold text-gray-800 mb-2">{p.product_name}</h4>
                <Grid>
                  <Info label="Qty" value={p.quantity} />
                  <Info label="Type" value={p.new_replacement} />
                  <Info label="Dept" value={p.department} />
                </Grid>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

const Section = ({ title, children }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">{title}</h2>
    {children}
  </div>
);
const Grid = ({ children }: any) => <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">{children}</div>;
const Info = ({ label, value }: any) => (
  <div><span className="block text-xs font-semibold text-gray-500 capitalize">{label}</span><span className="text-sm text-gray-900">{value || '-'}</span></div>
);
