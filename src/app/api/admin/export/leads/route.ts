import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { buildCsv, csvDownloadFilename } from '@/lib/settings/csv'

export async function GET() {
  const session = await requireAdminApi()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await session.supabase
    .from('leads')
    .select(
      'id, status, source, site_location, inquiry_details, created_at, customers ( full_name, email, phone ), services ( name )'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const headers = [
    'id',
    'status',
    'source',
    'site_location',
    'inquiry_details',
    'customer_name',
    'customer_email',
    'customer_phone',
    'service',
    'created_at',
  ]

  const rows = (data ?? []).map((lead) => {
    const customer = Array.isArray(lead.customers) ? lead.customers[0] : lead.customers
    const service = Array.isArray(lead.services) ? lead.services[0] : lead.services
    return [
      lead.id,
      lead.status,
      lead.source,
      lead.site_location,
      lead.inquiry_details,
      customer?.full_name ?? '',
      customer?.email ?? '',
      customer?.phone ?? '',
      service?.name ?? '',
      lead.created_at,
    ]
  })

  const csv = buildCsv(headers, rows)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvDownloadFilename('leads')}"`,
    },
  })
}
