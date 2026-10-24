import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { z } from 'zod';

// Validate incoming order data
const orderSchema = z.object({
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  details: z.string().min(1),
});

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const json = await request.json();
    const parsed = orderSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    // Find the form (order_form) by slug to link seller_id
    const { data: form, error: formError } = await supabase
      .from('order_forms')
      .select('id, seller_id')
      .eq('slug', params.slug)
      .single();

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const orderPayload = {
      form_id: form.id,
      seller_id: form.seller_id,
      customer_name: parsed.data.customer_name,
      customer_email: parsed.data.customer_email,
      details: parsed.data.details,
      status: 'pending', // initial status
    };

    const { data: inserted, error: insertError } = await supabase.from('orders').insert(orderPayload).single();
    if (insertError) {
      console.error('Insert error', insertError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({ order: inserted }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
