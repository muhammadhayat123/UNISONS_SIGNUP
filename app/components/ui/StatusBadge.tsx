import React from 'react';

type Status = 'New' | 'In Progress' | 'Contacted' | 'Completed' | 'Cancelled';

export function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status as Status;
  let bg = 'bg-gray-100';
  let text = 'text-gray-800';

  switch (normalizedStatus) {
    case 'New':
      bg = 'bg-blue-100';
      text = 'text-blue-800';
      break;
    case 'In Progress':
      bg = 'bg-amber-100';
      text = 'text-amber-800';
      break;
    case 'Contacted':
      bg = 'bg-purple-100';
      text = 'text-purple-800';
      break;
    case 'Completed':
      bg = 'bg-green-100';
      text = 'text-green-800';
      break;
    case 'Cancelled':
      bg = 'bg-red-100';
      text = 'text-red-800';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {status}
    </span>
  );
}
