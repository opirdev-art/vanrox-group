import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getAuthErrorMessage } from '@/lib/auth/messages'
import { getAdminProfileForUser } from '@/lib/auth/get-admin-profile'
import { createClient } from '@/utils/supabase/server'
import { LoginForm } from './login-form'

type SearchParams = {
  error?: string
  signed_out?: string
  next?: string
}

async function LoginContent({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const nextPath = searchParams.next?.startsWith('/admin') ? searchParams.next : '/admin'

  if (user && !searchParams.error && !searchParams.signed_out) {
    const profile = await getAdminProfileForUser(user.id)
    if (profile) {
      redirect(nextPath)
    }
  }

  const flashMessage =
    getAuthErrorMessage(searchParams.error) ??
    (searchParams.signed_out ? getAuthErrorMessage('signed_out') : null)

  const showSignOut = Boolean(user && searchParams.error === 'unauthorized')

  return <LoginForm flashMessage={flashMessage} showSignOut={showSignOut} />
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-gray">Loading…</div>}>
        <LoginContent searchParams={params} />
      </Suspense>
    </div>
  )
}
