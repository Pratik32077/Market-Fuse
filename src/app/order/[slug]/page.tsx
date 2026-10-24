import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

// Define a generic order schema. Adjust fields based on your actual form requirements.
const orderSchema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Invalid email'),
  details: z.string().min(1, 'Details are required'),
});

type OrderInput = z.infer<typeof orderSchema>;

export default function PublicOrderForm({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OrderInput>({ resolver: zodResolver(orderSchema) });

  const onSubmit = async (data: OrderInput) => {
    try {
      const response = await fetch(
        `/api/public/forms/${encodeURIComponent(params.slug)}/orders`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        const err = await response.text();
        alert(`Failed to submit order: ${err}`);
        return;
      }
      alert('Order submitted successfully!');
      reset();
    } catch (e) {
      console.error(e);
      alert('Unexpected error while submitting order');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Place Order</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="customer_name">
            Name
          </label>
          <input
            id="customer_name"
            type="text"
            {...register('customer_name')}
            className="mt-1 block w-full rounded border p-2"
            disabled={isSubmitting}
          />
          {errors.customer_name && (
            <p className="text-red-600 text-sm">{errors.customer_name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="customer_email">
            Email
          </label>
          <input
            id="customer_email"
            type="email"
            {...register('customer_email')}
            className="mt-1 block w-full rounded border p-2"
            disabled={isSubmitting}
          />
          {errors.customer_email && (
            <p className="text-red-600 text-sm">{errors.customer_email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="details">
            Details
          </label>
          <textarea
            id="details"
            {...register('details')}
            className="mt-1 block w-full rounded border p-2"
            rows={4}
            disabled={isSubmitting}
          />
          {errors.details && (
            <p className="text-red-600 text-sm">{errors.details.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Order'}
        </button>
      </form>
    </div>
  );
}
