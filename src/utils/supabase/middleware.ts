import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { REFERRAL_COOKIE_MAX_AGE, REFERRAL_COOKIE_NAME, sanitizeReferralCode } from '@/lib/referrals/cookie'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // issues with users being logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth')

  if (
    user &&
    isAdminRoute &&
    user.app_metadata?.invite_pending === true &&
    pathname !== '/admin/welcome'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/welcome'
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  if (!user && isAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    url.searchParams.set('error', 'session_required')
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
  }

  // Do not redirect authenticated users away from /login here.
  // Non-admin users must see error messages; admin redirect is handled on the login page.

  if (isAuthRoute) {
    return supabaseResponse
  }

  if (pathname === '/schedule') {
    const ref = sanitizeReferralCode(request.nextUrl.searchParams.get('ref'))
    if (ref) {
      supabaseResponse.cookies.set(REFERRAL_COOKIE_NAME, ref, {
        maxAge: REFERRAL_COOKIE_MAX_AGE,
        sameSite: 'lax',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally: return myNewResponse

  return supabaseResponse
}
