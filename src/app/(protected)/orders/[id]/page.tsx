import React from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const { data: { session } } = await supabase.auth.getSession();
  const sellerId = session?.user?.id;
  if (!sellerId) {
    return <p>Please sign in to view order details.</p>;
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('seller_id', sellerId)
    .single();
  if (error || !order) {
    notFound();
  }

  // Fetch payments for this order
  const { data: payments = [] } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', order.id);

  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0);

  const handleStatusChange = async (newStatus: string) => {
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      // reload page
      window.location.reload();
    } else {
      const err = await res.text();
      alert('Failed to update status: ' + err);
    }
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const note = (form.elements.namedItem('note') as HTMLInputElement).value;
    const res = await fetch(`/api/orders/${order.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, note }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      const err = await res.text();
      alert('Failed to add payment: ' + err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Order {order.id}</h1>
      <p><strong>Customer:</strong> {order.customer_name} ({order.customer_email})</p>
      <p><strong>Details:</strong> {order.details}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Total Paid:</strong> ${totalPaid.toFixed(2)}</p>

      <div className="mt-4">
        <h2 className="text-xl font-semibold">Change Status</h2>
        <div className="flex space-x-2 mt-2">
          {['pending', 'approved', 'in_production', 'completed', 'canceled'].map((st) => (
            <button key={st} onClick={() => handleStatusChange(st)} className="bg-gray-200 px-3 py-1 rounded">
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Payments</h2>
        <table className="min-w-full border mt-2">
          <thead>
            <tr>
              <th className="border px-2">Amount</th>
              <th className="border px-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id}>
                <td className="border px-2">${p.amount?.toFixed(2)}</td>
                <td className="border px-2">{p.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <form onSubmit={handleAddPayment} className="mt-4 space-y-2">
          <div>
            <label className="block text-sm">Amount</label>
            <input name="amount" type="number" step="0.01" required className="border p-1 rounded" />
          </div>
          <div>
            <label className="block text-sm">Note</label>
            <input name="note" type="text" className="border p-1 rounded" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Add Payment</button>
        </form>
      </div>

      <div className="mt-6">
        <Link href="/protected/orders" className="text-blue-600 underline">← Back to Orders</Link>
      </div>
    </div>
  );
}
