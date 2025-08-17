import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || data?.user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}