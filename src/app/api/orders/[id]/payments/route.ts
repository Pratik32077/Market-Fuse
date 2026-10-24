import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().positive(),
  note: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Verify seller session
  const { data: { session } } = await supabase.auth.getSession();
  const sellerId = session?.user?.id;
  if (!sellerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = paymentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
  }

  // Ensure the order belongs to the seller
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id')
    .eq('id', params.id)
    .eq('seller_id', sellerId)
    .single();
  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 });
  }

  const paymentPayload = {
    order_id: params.id,
    seller_id: sellerId,
    amount: parsed.data.amount,
    note: parsed.data.note ?? '',
  };

  const { data: inserted, error: insertError } = await supabase.from('payments').insert(paymentPayload).single();
  if (insertError) {
    console.error('Payment insert error', insertError);
    return NextResponse.json({ error: 'Failed to add payment' }, { status: 500 });
  }

  return NextResponse.json({ payment: inserted }, { status: 201 });
}
