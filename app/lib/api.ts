const BASE_URL = 'http://127.0.0.1:8000';

export type Designation = 'admin' | 'seller';

export interface AuthResponse {
  status: string;
  message: string;
  data: { id: number; username: string; email: string; designation: Designation; token: string; };
}

interface ApiError { detail: string | { msg: string; type: string }[]; }

async function parseError(res: Response): Promise<string> {
  try {
    const body: ApiError = await res.json();
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail)) return body.detail.map((e: any) => e.msg).join(', ');
  } catch {}
  return `Request failed with status ${res.status}`;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export async function registerUser(payload: { username: string; email: string; password: string; designation: Designation }): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/user/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/user/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

// Company
export const getCompany = () => request<any>('GET', '/api/company');
export const createCompany = (data: any) => request<any>('POST', '/api/company', data);
export const updateCompany = (data: any) => request<any>('PUT', '/api/company', data);

// Customers
export const getCustomers = (params: Record<string, any> = {}) => {
  const q = new URLSearchParams(params as any).toString();
  return request<any>('GET', `/api/customers${q ? '?' + q : ''}`);
};
export const createCustomer = (data: any) => request<any>('POST', '/api/customers', data);
export const getCustomer = (id: number) => request<any>('GET', `/api/customers/${id}`);
export const updateCustomer = (id: number, data: any) => request<any>('PUT', `/api/customers/${id}`, data);
export const deleteCustomer = (id: number) => request<void>('DELETE', `/api/customers/${id}`);
export const getCustomerInquiries = (id: number) => request<any>('GET', `/api/customers/${id}/inquiries`);
export const getCustomerPersonnel = (id: number) => request<any>('GET', `/api/customers/${id}/personnel`);
export const addPersonnel = (customerId: number, data: any) => request<any>('POST', `/api/customers/${customerId}/personnel`, data);
export const updatePersonnel = (customerId: number, personnelId: number, data: any) => request<any>('PUT', `/api/customers/${customerId}/personnel/${personnelId}`, data);
export const deletePersonnel = (customerId: number, personnelId: number) => request<void>('DELETE', `/api/customers/${customerId}/personnel/${personnelId}`);

// Inquiries
export const getInquiries = (params: Record<string, any> = {}) => {
  const q = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined && v !== '')) as any).toString();
  return request<any>('GET', `/api/inquiries${q ? '?' + q : ''}`);
};
export const createInquiry = (data: any) => request<any>('POST', '/api/inquiries', data);
export const getInquiry = (id: number) => request<any>('GET', `/api/inquiries/${id}`);
export const updateInquiry = (id: number, data: any) => request<any>('PUT', `/api/inquiries/${id}`, data);
export const updateInquiryStatus = (id: number, status: string) => request<any>('PATCH', `/api/inquiries/${id}/status`, { status });
export const deleteInquiry = (id: number) => request<void>('DELETE', `/api/inquiries/${id}`);
export const downloadInquiryPDF = async (id: number): Promise<Blob> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${BASE_URL}/api/inquiries/${id}/pdf`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error(await parseError(res));
  return res.blob();
};

// Admins
export const getAdmins = () => request<any>('GET', '/api/admins');
export const createAdmin = (data: any) => request<any>('POST', '/api/admins', data);
export const updateAdmin = (id: number, data: any) => request<any>('PUT', `/api/admins/${id}`, data);
export const toggleAdmin = (id: number) => request<any>('PATCH', `/api/admins/${id}/toggle-active`);
export const deleteAdmin = (id: number) => request<void>('DELETE', `/api/admins/${id}`);

// Sellers
export const getSellers = () => request<any>('GET', '/api/sellers');
export const createSeller = (data: any) => request<any>('POST', '/api/sellers', data);
export const updateSeller = (id: number, data: any) => request<any>('PUT', `/api/sellers/${id}`, data);
export const toggleSeller = (id: number) => request<any>('PATCH', `/api/sellers/${id}/toggle-active`);
export const deleteSeller = (id: number) => request<void>('DELETE', `/api/sellers/${id}`);
