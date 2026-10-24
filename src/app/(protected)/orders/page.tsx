import React from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';

export default async function OrdersPage() {
  // Attempt to get current session (mock returns null)
  const { data: { session } } = await supabase.auth.getSession();
  const sellerId = session?.user?.id;

  let orders: any[] = [];
  if (sellerId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', sellerId);
    if (!error && data) orders = data;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      {sellerId ? (
        orders.length > 0 ? (
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2">ID</th>
                <th className="border px-2">Customer</th>
                <th className="border px-2">Status</th>
                <th className="border px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="border px-2">{o.id}</td>
                  <td className="border px-2">{o.customer_name}</td>
                  <td className="border px-2">{o.status}</td>
                  <td className="border px-2">
                    <Link href={`/protected/orders/${o.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders found.</p>
        )
      ) : (
        <p>Please sign in to view your orders.</p>
      )}
    </div>
  );
}
