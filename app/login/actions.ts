'use server';
import { z } from 'zod';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/server';

const schema = z.object({
  email: z.email({
    error: 'Invalid Email',
  }),
});

export interface PrevState {
  errors: string[] | undefined;
  messages?: string;
}

export async function signInWithMagicLink(prevState: PrevState, formData: FormData) {
  const supabase = await createClient();
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    const treeError = z.treeifyError(validatedFields.error);
    console.log('treeError', treeError.properties?.email?.errors);

    return {
      errors: treeError.properties?.email?.errors || [],
      messages: '',
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: validatedFields.data.email,
    options: {
      emailRedirectTo:
        process.env.NODE_ENV === 'production'
          ? `https://personal-finance-sage-gamma.vercel.app`
          : 'http://localhost:3000',
    },
  });

  if (error) {
    redirect('/error');
  }

  return {
    errors: undefined,
    messages: 'Se ha enviado un enlace mágico a tu correo electrónico.',
  };
}
