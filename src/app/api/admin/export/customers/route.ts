import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { buildCsv, csvDownloadFilename } from '@/lib/settings/csv'

export async function GET() {
  const session = await requireAdminApi()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await session.supabase
    .from('customers')
    .select('id, full_name, email, phone, address, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const headers = ['id', 'full_name', 'email', 'phone', 'address', 'created_at']
  const rows = (data ?? []).map((customer) => [
    customer.id,
    customer.full_name,
    customer.email,
    customer.phone,
    customer.address,
    customer.created_at,
  ])

  const csv = buildCsv(headers, rows)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvDownloadFilename('customers')}"`,
    },
  })
}
