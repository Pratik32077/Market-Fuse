import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

const schema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  businessName: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AuthForm({ mode }: { mode: 'signup' | 'signin' }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      if (mode === 'signup') {
        const { error: signUpErr, data: signUpData } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (signUpErr) throw signUpErr;
        // After sign‑up, create profile record
        const user = signUpData.user;
        if (user) {
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: user.id,
            business_name: data.businessName ?? '',
            contact_email: data.email,
          });
          if (profileErr) throw profileErr;
        }
        router.push('/app/dashboard');
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (signInErr) throw signInErr;
        router.push('/app/dashboard');
      }
    } catch (e: any) {
      setServerError(e.message ?? 'Unexpected error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4 p-4 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold text-center">{mode === 'signup' ? 'Create account' : 'Sign in'}</h2>
      {serverError && <p className="text-red-600 text-center">{serverError}</p>}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full border rounded px-2 py-1"
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full border rounded px-2 py-1"
          disabled={isSubmitting}
        />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
      </div>
      {mode === 'signup' && (
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="businessName">Business name</label>
          <input
            id="businessName"
            type="text"
            {...register('businessName')}
            className="w-full border rounded px-2 py-1"
            disabled={isSubmitting}
          />
          {errors.businessName && <p className="text-xs text-red-600">{errors.businessName.message}</p>}
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-600 text-white py-2 rounded disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>
    </form>
  );
}
