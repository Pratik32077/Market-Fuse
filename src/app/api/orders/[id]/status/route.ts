import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.string().min(1),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { data: { session } } = await supabase.auth.getSession();
  const sellerId = session?.user?.id;
  if (!sellerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = statusSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status', details: parsed.error.format() }, { status: 400 });
  }

  // whitelist allowed statuses
  const allowed = ['pending', 'approved', 'in_production', 'completed', 'canceled'];
  if (!allowed.includes(parsed.data.status)) {
    return NextResponse.json({ error: 'Disallowed status value' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status: parsed.data.status })
    .eq('id', params.id)
    .eq('seller_id', sellerId)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }

  return NextResponse.json({ order: data }, { status: 200 });
}
