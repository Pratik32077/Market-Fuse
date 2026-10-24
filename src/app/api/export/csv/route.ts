import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
  const { data: { session } } = await supabase.auth.getSession();
  const sellerId = session?.user?.id;
  if (!sellerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id,customer_name,customer_email,details,status,created_at')
    .eq('seller_id', sellerId);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  const header = ['id','customer_name','customer_email','details','status','created_at'];
  const rows = (orders || []).map((o:any) =>
    header.map((h) => {
      const val = o[h];
      // Escape double quotes and commas
      if (typeof val === 'string') {
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      }
      return `${val}`;
    }).join(',')
  );
  const csv = [header.join(','), ...rows].join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="orders.csv"',
    },
    status: 200,
  });
}
