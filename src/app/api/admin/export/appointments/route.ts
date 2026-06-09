import { NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/auth/require-admin-api'
import { buildCsv, csvDownloadFilename } from '@/lib/settings/csv'

export async function GET() {
  const session = await requireAdminApi()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await session.supabase
    .from('appointments')
    .select('id, title, status, start_time, end_time, is_blockout, created_at, leads ( id )')
    .is('deleted_at', null)
    .order('start_time', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const headers = [
    'id',
    'title',
    'status',
    'start_time',
    'end_time',
    'is_blockout',
    'lead_id',
    'created_at',
  ]

  const rows = (data ?? []).map((appointment) => {
    const lead = Array.isArray(appointment.leads) ? appointment.leads[0] : appointment.leads
    return [
      appointment.id,
      appointment.title,
      appointment.status,
      appointment.start_time,
      appointment.end_time,
      appointment.is_blockout,
      lead?.id ?? '',
      appointment.created_at,
    ]
  })

  const csv = buildCsv(headers, rows)

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvDownloadFilename('appointments')}"`,
    },
  })
}
