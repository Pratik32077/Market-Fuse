import { createServerComponentSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/app/signin');
  }
  return <>{children}</>;
}
