"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCustomers, createCustomer, createInquiry, getInquiry, updateInquiry } from '@/app/lib/api';
import Toast from '@/app/components/ui/Toast';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export function InquiryWizard({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);

  // Form State
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerData, setCustomerData] = useState({
    customer_name: '', inquiry_date: new Date().toISOString().split('T')[0],
    sector: '', factory_address: '', phone: '', ho_address: '', website: '', email: ''
  });

  const [personnel, setPersonnel] = useState<any[]>([]);
  
  const [additionalInfo, setAdditionalInfo] = useState({
    employee: '', source: '', local_import: 'Local', new_repeat: 'New',
    repeat_case_no: '', req_origin: '', incoterms: '', department: '', sub_department: '', currency: ''
  });

  const [furnaceDetails, setFurnaceDetails] = useState({
    no_of_furnaces: 0, tpd: '', furnaces: [] as any[]
  });

  const [ccmDetails, setCcmDetails] = useState({
    radius: '', length_of_tube: '', manual_open_tanky: '', strands: '',
    cmt_size: '', sgm_size: '', tundish_nozzle_size: '', supplier: ''
  });

  const [rollingMill, setRollingMill] = useState({
    plant_capacity_tpd: '', plant_capacity_tph: '', supplier: '', total_stands: 0,
    stands: [] as any[]
  });

  const [products, setProducts] = useState<any[]>([]);
  
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const [signatures, setSignatures] = useState({
    unisons_sales_rep: '', customer_signature: ''
  });

  useEffect(() => {
    if (editId) {
      setIsEditing(true);
      loadInquiry(Number(editId));
    }
  }, [editId]);

  async function loadInquiry(id: number) {
    try {
      setLoading(true);
      const res = await getInquiry(id);
      if (res.customer_id) {
        setCustomerId(res.customer_id);
        setIsNewCustomer(false);
      }
      if (res.additional_info) {
        setAdditionalInfo({
          employee: res.additional_info.employee || '',
          source: res.additional_info.source || '',
          local_import: res.additional_info.local_import || 'Local',
          new_repeat: res.additional_info.new_repeat || 'New',
          repeat_case_no: res.additional_info.repeat_case_no || '',
          req_origin: res.additional_info.req_origin || '',
          incoterms: res.additional_info.incoterms || '',
          department: res.additional_info.department || '',
          sub_department: res.additional_info.sub_department || '',
          currency: res.additional_info.currency || ''
        });
      }
      if (res.furnace_details) {
        setFurnaceDetails({
          no_of_furnaces: res.furnace_details.no_of_furnaces || 0,
          tpd: res.furnace_details.tpd?.toString() || '',
          furnaces: res.furnace_details.furnaces || []
        });
      }
      if (res.ccm_details) {
        setCcmDetails({
          radius: res.ccm_details.radius || '',
          length_of_tube: res.ccm_details.length_of_tube || '',
          manual_open_tanky: res.ccm_details.manual_open_tanky || '',
          strands: res.ccm_details.strands?.toString() || '',
          cmt_size: res.ccm_details.cmt_size || '',
          sgm_size: res.ccm_details.sgm_size || '',
          tundish_nozzle_size: res.ccm_details.tundish_nozzle_size || '',
          supplier: res.ccm_details.supplier || ''
        });
      }
      if (res.rolling_mill_details) {
        setRollingMill({
          plant_capacity_tpd: res.rolling_mill_details.plant_capacity_tpd?.toString() || '',
          plant_capacity_tph: res.rolling_mill_details.plant_capacity_tph?.toString() || '',
          supplier: res.rolling_mill_details.supplier || '',
          total_stands: res.rolling_mill_details.total_stands || 0,
          stands: res.rolling_mill_details.stands || []
        });
      }
      if (res.products) {
        setProducts(res.products.map((p: any) => ({
          ...p,
          quantity: p.quantity?.toString() || '',
          no_of_item: p.no_of_item?.toString() || ''
        })));
      }
      if (res.special_instructions) {
        setSpecialInstructions(res.special_instructions.special_instructions || '');
      }
      if (res.signature) {
        setSignatures({
          unisons_sales_rep: res.signature.unisons_sales_rep || '',
          customer_signature: res.signature.customer_signature || ''
        });
      }
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleNext = () => {
    if (step === 1 && !customerId && !isNewCustomer) {
      setToast({ message: 'Please select or create a customer', type: 'error' });
      return;
    }
    if (step === 1 && isNewCustomer && !customerData.customer_name) {
      setToast({ message: 'Customer name is required', type: 'error' });
      return;
    }
    if (step === 8 && products.length > 0 && products.some(p => !p.product_name)) {
      setToast({ message: 'All products must have a name', type: 'error' });
      return;
    }
    setStep(s => Math.min(10, s + 1));
  };
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const submitForm = async () => {
    try {
      setLoading(true);
      let finalCustomerId = customerId;

      if (isNewCustomer || !finalCustomerId) {
        const cRes = await createCustomer({
          ...customerData,
          personnel: personnel
        });
        finalCustomerId = cRes.id;
      }

      const pNum = (val: any) => (val === '' || val === null || val === undefined) ? null : Number(val);
      const pInt = (val: any) => (val === '' || val === null || val === undefined) ? null : parseInt(val, 10);
      const cleanEnum = (val: any) => val === '' ? null : val;

      const payload = {
        customer_id: finalCustomerId,
        additional_info: {
          ...additionalInfo,
          local_import: cleanEnum(additionalInfo.local_import),
          new_repeat: cleanEnum(additionalInfo.new_repeat)
        },
        furnace_details: {
          ...furnaceDetails,
          no_of_furnaces: pInt(furnaceDetails.no_of_furnaces),
          tpd: pNum(furnaceDetails.tpd),
          furnaces: furnaceDetails.furnaces.map((f: any) => ({
            ...f,
            capacity_ton: pNum(f.capacity_ton),
            capacity_mw: pNum(f.capacity_mw)
          }))
        },
        ccm_details: {
          ...ccmDetails,
          strands: pInt(ccmDetails.strands)
        },
        rolling_mill_details: {
          ...rollingMill,
          plant_capacity_tpd: pNum(rollingMill.plant_capacity_tpd),
          plant_capacity_tph: pNum(rollingMill.plant_capacity_tph),
          total_stands: pInt(rollingMill.total_stands),
          stands: rollingMill.stands.map((s: any) => ({
            ...s,
            mill_type: cleanEnum(s.mill_type),
            stand_code: cleanEnum(s.stand_code),
            arrangement_type: cleanEnum(s.arrangement_type)
          }))
        },
        products: products.map((p: any) => ({
          ...p,
          quantity: pNum(p.quantity),
          no_of_item: pInt(p.no_of_item),
          new_replacement: cleanEnum(p.new_replacement)
        })),
        special_instructions: { special_instructions: specialInstructions },
        signature: signatures
      };

      let iRes;
      if (isEditing && editId) {
        iRes = await updateInquiry(Number(editId), payload);
        setToast({ message: 'Inquiry updated successfully!', type: 'success' });
      } else {
        iRes = await createInquiry(payload);
        setToast({ message: 'Inquiry created successfully!', type: 'success' });
      }
      
      setTimeout(() => {
        router.push(isAdmin ? `/admin/inquiries/${iRes.id}` : `/seller/inquiries/${iRes.id}`);
      }, 1500);

    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 px-0">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{isEditing ? 'Edit Inquiry' : 'New Inquiry'}</h1>
        <div className="mt-3 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-500">
          <span>Step {step} of 10</span>
          <span>{Math.round((step / 10) * 100)}% Completed</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-orange-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 10) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-5">
        {step === 1 && <Step1Customer 
          customerId={customerId} setCustomerId={setCustomerId} 
          isNew={isNewCustomer} setIsNew={setIsNewCustomer}
          data={customerData} setData={setCustomerData} 
        />}
        {step === 2 && <Step2Personnel personnel={personnel} setPersonnel={setPersonnel} />}
        {step === 3 && <Step3Additional data={additionalInfo} setData={setAdditionalInfo} />}
        {step === 4 && <Step4Furnace data={furnaceDetails} setData={setFurnaceDetails} />}
        {step === 5 && <Step5CCM data={ccmDetails} setData={setCcmDetails} />}
        {step === 6 && <Step6RollingMill data={rollingMill} setData={setRollingMill} />}
        {step === 7 && <Step7Stands data={rollingMill} setData={setRollingMill} />}
        {step === 8 && <Step8Products data={products} setData={setProducts} />}
        {step === 9 && <Step9Extra 
          instructions={specialInstructions} setInstructions={setSpecialInstructions}
          signatures={signatures} setSignatures={setSignatures}
        />}
        {step === 10 && <Step10Review />}
      </div>

      <div className="flex justify-between">
        <button 
          onClick={handlePrev} 
          disabled={step === 1 || loading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        
        {step < 10 ? (
          <button 
            onClick={handleNext}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Next Step
          </button>
        ) : (
          <button 
            onClick={submitForm}
            disabled={loading}
            className="flex items-center rounded-lg bg-orange-600 px-6 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner className="h-4 w-4 mr-2 text-white" /> : null}
            Submit Inquiry
          </button>
        )}
      </div>
    </div>
  );
}

// -- Steps Components --

function Step1Customer({ customerId, setCustomerId, isNew, setIsNew, data, setData }: any) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (search.length > 2) {
      getCustomers({ search, limit: 5 }).then(res => setResults(res?.customers || []));
    } else {
      setResults([]);
    }
  }, [search]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Customer Details</h2>
      <div className="flex gap-4 mb-4">
        <button className={`px-4 py-2 rounded-lg text-sm font-medium ${!isNew ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => setIsNew(false)}>Select Existing</button>
        <button className={`px-4 py-2 rounded-lg text-sm font-medium ${isNew ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`} onClick={() => setIsNew(true)}>Create New</button>
      </div>

      {!isNew ? (
        <div>
          <input type="text" placeholder="Search customer by name..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-2 border rounded-md" />
          {results.length > 0 && (
            <div className="mt-2 border rounded-md divide-y">
              {results.map(c => (
                <div key={c.id} onClick={() => { setCustomerId(c.id); setSearch(c.customer_name); setResults([]); }} className={`p-3 cursor-pointer hover:bg-gray-50 ${customerId === c.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}>
                  <div className="font-medium">{c.customer_name}</div>
                  <div className="text-xs text-gray-500">{c.email} | {c.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label><input required value={data.customer_name} onChange={e=>setData({...data, customer_name: e.target.value})} className="w-full p-2 border rounded-md text-sm focus:ring-orange-500 focus:border-orange-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Inquiry Date</label><input type="date" value={data.inquiry_date} onChange={e=>setData({...data, inquiry_date: e.target.value})} className="w-full p-2 border rounded-md text-sm focus:ring-orange-500 focus:border-orange-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={data.email} onChange={e=>setData({...data, email: e.target.value})} className="w-full p-2 border rounded-md text-sm focus:ring-orange-500 focus:border-orange-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={data.phone} onChange={e=>setData({...data, phone: e.target.value})} className="w-full p-2 border rounded-md text-sm focus:ring-orange-500 focus:border-orange-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Sector</label><input value={data.sector} onChange={e=>setData({...data, sector: e.target.value})} className="w-full p-2 border rounded-md text-sm focus:ring-orange-500 focus:border-orange-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><input value={data.website} onChange={e=>setData({...data, website: e.target.value})} className="w-full p-2 border rounded-md text-sm focus:ring-orange-500 focus:border-orange-500" /></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Factory Address</label><textarea value={data.factory_address} onChange={e=>setData({...data, factory_address: e.target.value})} className="w-full p-2 border rounded-md text-sm" rows={2} /></div>
          <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">HO Address</label><textarea value={data.ho_address} onChange={e=>setData({...data, ho_address: e.target.value})} className="w-full p-2 border rounded-md text-sm" rows={2} /></div>
        </div>
      )}
    </div>
  );
}

function Step2Personnel({ personnel, setPersonnel }: any) {
  const addPerson = () => setPersonnel([...personnel, { concerned_person: '', department: '', designation: '', email: '', phone: '' }]);
  const update = (idx: number, field: string, val: string) => {
    const newP = [...personnel];
    newP[idx][field] = val;
    setPersonnel(newP);
  };
  const remove = (idx: number) => setPersonnel(personnel.filter((_:any, i:number) => i !== idx));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Personnel Details</h2>
        <button onClick={addPerson} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">+ Add Person</button>
      </div>
      {personnel.map((p:any, i:number) => (
        <div key={i} className="p-4 border rounded-lg mb-4 bg-gray-50 relative">
          <button onClick={() => remove(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div><label className="text-xs">Name *</label><input value={p.concerned_person} onChange={e=>update(i,'concerned_person',e.target.value)} className="w-full p-1.5 border rounded text-sm" /></div>
            <div><label className="text-xs">Designation</label><input value={p.designation} onChange={e=>update(i,'designation',e.target.value)} className="w-full p-1.5 border rounded text-sm" /></div>
            <div><label className="text-xs">Department</label><input value={p.department} onChange={e=>update(i,'department',e.target.value)} className="w-full p-1.5 border rounded text-sm" /></div>
            <div><label className="text-xs">Email</label><input value={p.email} onChange={e=>update(i,'email',e.target.value)} className="w-full p-1.5 border rounded text-sm" /></div>
            <div><label className="text-xs">Phone</label><input value={p.phone} onChange={e=>update(i,'phone',e.target.value)} className="w-full p-1.5 border rounded text-sm" /></div>
          </div>
        </div>
      ))}
      {personnel.length === 0 && <p className="text-sm text-gray-500">No personnel added. (Optional)</p>}
    </div>
  );
}

function Step3Additional({ data, setData }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Additional Info</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm">Employee</label><input value={data.employee} onChange={e=>setData({...data,employee:e.target.value})} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm">Source</label><input value={data.source} onChange={e=>setData({...data,source:e.target.value})} className="w-full p-2 border rounded" /></div>
        <div>
          <label className="block text-sm">Local / Import</label>
          <select value={data.local_import} onChange={e=>setData({...data,local_import:e.target.value})} className="w-full p-2 border rounded">
            <option>Local</option><option>Import</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">New / Repeat</label>
          <select value={data.new_repeat} onChange={e=>setData({...data,new_repeat:e.target.value})} className="w-full p-2 border rounded">
            <option>New</option><option>Repeat</option>
          </select>
        </div>
        {data.new_repeat === 'Repeat' && (
          <div><label className="block text-sm">Repeat Case No</label><input value={data.repeat_case_no} onChange={e=>setData({...data,repeat_case_no:e.target.value})} className="w-full p-2 border rounded" /></div>
        )}
        <div><label className="block text-sm">Req Origin</label><input value={data.req_origin} onChange={e=>setData({...data,req_origin:e.target.value})} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm">Incoterms</label><input value={data.incoterms} onChange={e=>setData({...data,incoterms:e.target.value})} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm">Currency</label><input value={data.currency} onChange={e=>setData({...data,currency:e.target.value})} className="w-full p-2 border rounded" /></div>
      </div>
    </div>
  );
}

function Step4Furnace({ data, setData }: any) {
  const updateCount = (n: number) => {
    const arr = [...data.furnaces];
    while(arr.length < n) arr.push({ furnace_no: '', capacity_ton: '', capacity_mw: '' });
    while(arr.length > n) arr.pop();
    setData({...data, no_of_furnaces: n, furnaces: arr});
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Furnace Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm">No of Furnaces</label><input type="number" min={0} value={data.no_of_furnaces} onChange={e=>updateCount(parseInt(e.target.value)||0)} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm">TPD</label><input value={data.tpd} onChange={e=>setData({...data,tpd:e.target.value})} className="w-full p-2 border rounded" /></div>
      </div>
      {data.furnaces.map((f:any, i:number) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 border rounded bg-gray-50 items-center">
          <span className="font-bold text-gray-500 text-sm">#{i+1}</span>
          <input placeholder="Furnace No" value={f.furnace_no} onChange={e=>{const arr=[...data.furnaces]; arr[i].furnace_no=e.target.value; setData({...data,furnaces:arr})}} className="p-2 border rounded text-sm" />
          <input placeholder="Capacity (Ton)" value={f.capacity_ton} onChange={e=>{const arr=[...data.furnaces]; arr[i].capacity_ton=e.target.value; setData({...data,furnaces:arr})}} className="p-2 border rounded text-sm" />
          <input placeholder="Capacity (MW)" value={f.capacity_mw} onChange={e=>{const arr=[...data.furnaces]; arr[i].capacity_mw=e.target.value; setData({...data,furnaces:arr})}} className="p-2 border rounded text-sm" />
        </div>
      ))}
    </div>
  );
}

function Step5CCM({ data, setData }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">CCM Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.keys(data).map(k => (
          <div key={k}>
            <label className="block text-sm capitalize">{k.replace(/_/g, ' ')}</label>
            <input value={data[k]} onChange={e=>setData({...data, [k]: e.target.value})} className="w-full p-2 border rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Step6RollingMill({ data, setData }: any) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Rolling Mill Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm">Plant Capacity TPD</label><input value={data.plant_capacity_tpd} onChange={e=>setData({...data,plant_capacity_tpd:e.target.value})} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm">Plant Capacity TPH</label><input value={data.plant_capacity_tph} onChange={e=>setData({...data,plant_capacity_tph:e.target.value})} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm">Supplier</label><input value={data.supplier} onChange={e=>setData({...data,supplier:e.target.value})} className="w-full p-2 border rounded" /></div>
        <div><label className="block text-sm">Total Stands</label><input type="number" min={0} value={data.total_stands} onChange={e=>setData({...data,total_stands:parseInt(e.target.value)||0})} className="w-full p-2 border rounded" /></div>
      </div>
    </div>
  );
}

function Step7Stands({ data, setData }: any) {
  const addStand = () => setData({...data, stands: [...data.stands, {mill_type:'', stand_code:'', arrangement_type:''}]});
  const remove = (idx: number) => setData({...data, stands: data.stands.filter((_:any,i:number)=>i!==idx)});
  const update = (idx:number, field:string, val:string) => {
    const arr = [...data.stands];
    arr[idx][field] = val;
    setData({...data, stands: arr});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Rolling Mill Stands</h2>
        <button onClick={addStand} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">+ Add Stand</button>
      </div>
      {data.stands.map((s:any, i:number) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 border rounded bg-gray-50 relative items-center pt-8 sm:pt-3">
          <button onClick={()=>remove(i)} className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs">x</button>
          <select value={s.mill_type} onChange={e=>update(i,'mill_type',e.target.value)} className="flex-1 p-2 border rounded text-sm">
            <option value="">Select Mill Type</option>
            <option>Fully Continuous</option><option>Roughing Mill</option><option>Intermediate Mill</option><option>Finishing Mill</option>
          </select>
          <select value={s.stand_code} onChange={e=>update(i,'stand_code',e.target.value)} className="flex-1 p-2 border rounded text-sm">
            <option value="">Select Stand Code</option>
            <option>RM1</option><option>RM2</option><option>RM3</option><option>IM1</option><option>IM2</option><option>IM3</option><option>FM1</option><option>FM2</option><option>FM3</option>
          </select>
          <select value={s.arrangement_type} onChange={e=>update(i,'arrangement_type',e.target.value)} className="flex-1 p-2 border rounded text-sm">
            <option value="">Select Arrangement</option>
            <option>Repeater (R)</option><option>Continuous (C)</option><option>Fully Continuous (FC)</option>
          </select>
        </div>
      ))}
    </div>
  );
}

function Step8Products({ data, setData }: any) {
  const addProduct = () => setData([...data, {product_name:'', quantity:'', new_replacement:'New'}]);
  const remove = (idx:number) => setData(data.filter((_:any,i:number)=>i!==idx));
  const update = (idx:number, field:string, val:string) => {
    const arr = [...data];
    arr[idx][field] = val;
    setData(arr);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Products</h2>
        <button onClick={addProduct} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">+ Add Product</button>
      </div>
      {data.map((p:any, i:number) => (
        <div key={i} className="p-4 border rounded bg-white relative shadow-sm">
          <button onClick={()=>remove(i)} className="absolute top-2 right-2 text-red-500 text-sm">Remove</button>
          <h3 className="font-semibold text-gray-700 mb-3">Product #{i+1}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2"><label className="text-xs">Product Name *</label><input value={p.product_name} onChange={e=>update(i,'product_name',e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="text-xs">Quantity</label><input type="number" value={p.quantity} onChange={e=>update(i,'quantity',e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="text-xs">Department</label><input value={p.department||''} onChange={e=>update(i,'department',e.target.value)} className="w-full p-2 border rounded" /></div>
            <div><label className="text-xs">New/Replacement</label>
              <select value={p.new_replacement} onChange={e=>update(i,'new_replacement',e.target.value)} className="w-full p-2 border rounded">
                <option>New</option><option>Replacement</option>
              </select>
            </div>
            <div><label className="text-xs">Required Brand</label><input value={p.required_brand||''} onChange={e=>update(i,'required_brand',e.target.value)} className="w-full p-2 border rounded" /></div>
            <div className="sm:col-span-3"><label className="text-xs">Detailed Specs</label><textarea value={p.detailed_specifications||''} onChange={e=>update(i,'detailed_specifications',e.target.value)} className="w-full p-2 border rounded" rows={2} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Step9Extra({ instructions, setInstructions, signatures, setSignatures }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Special Instructions</h2>
        <textarea value={instructions} onChange={e=>setInstructions(e.target.value)} className="w-full p-3 border rounded-md" rows={4} placeholder="Any special instructions..." />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Signatures (Names)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm">Unisons Sales Rep</label><input value={signatures.unisons_sales_rep} onChange={e=>setSignatures({...signatures,unisons_sales_rep:e.target.value})} className="w-full p-2 border rounded" /></div>
          <div><label className="block text-sm">Customer Signature</label><input value={signatures.customer_signature} onChange={e=>setSignatures({...signatures,customer_signature:e.target.value})} className="w-full p-2 border rounded" /></div>
        </div>
      </div>
    </div>
  );
}

function Step10Review() {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Review & Submit</h2>
      <p className="text-gray-600 mb-8">You have completed all sections. Click Submit below to save the inquiry.</p>
      <div className="inline-block text-left bg-gray-50 p-6 rounded-xl border border-gray-200">
        <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
          <li>Customer Details Complete</li>
          <li>Technical Specs Complete</li>
          <li>Products Added</li>
        </ul>
      </div>
    </div>
  );
}
