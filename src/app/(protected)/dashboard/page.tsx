import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const supabase = createServerComponentSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/app/signin');

  // Fetch summary counts
  const { data: summary, error } = await supabase
    .from('orders')
    .select('status', { count: 'exact', head: true })
    .eq('seller_id', session.user.id);

  // For demo we just fetch the first 5 orders
  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, customer_name, status, required_by, created_at')
    .eq('seller_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Summary cards - placeholders – real counts would be derived from grouped query */}
        <div className="p-4 bg-white rounded shadow">New requests: {summary?.length ?? 0}</div>
        <div className="p-4 bg-white rounded shadow">In production: TBD</div>
        <div className="p-4 bg-white rounded shadow">Due soon: TBD</div>
        <div className="p-4 bg-white rounded shadow">Balance due: TBD</div>
      </div>
      <Link href="/app/orders" className="text-primary-600 underline mb-4 block">View all orders</Link>
      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Ref</th>
            <th className="px-4 py-2 text-left">Customer</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Required by</th>
            <th className="px-4 py-2 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="px-4 py-2">{o.order_number}</td>
              <td className="px-4 py-2">{o.customer_name}</td>
              <td className="px-4 py-2">{o.status}</td>
              <td className="px-4 py-2">{o.required_by ? format(new Date(o.required_by), 'yyyy‑MM‑dd') : '-'}</td>
              <td className="px-4 py-2">{format(new Date(o.created_at), 'yyyy‑MM‑dd')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
