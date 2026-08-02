import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Sync or update user verification status in Prisma
      if (data.user.email) {
        await prisma.user.updateMany({
          where: { email: data.user.email },
          data: { isVerified: true }
        }).catch(() => {})
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}?verified=true`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}?verified=true`)
      } else {
        return NextResponse.redirect(`${origin}${next}?verified=true`)
      }
    }
  }

  // Return the user to an error page if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=InvalidVerificationCode`)
}
