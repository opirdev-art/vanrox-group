import { requireAdmin } from '@/lib/auth/require-admin'
import { getAuditLogs } from '@/lib/settings/audit-queries'
import { AuditLogTable } from './components/audit-log-table'
import { ExportButtons } from './components/export-buttons'

type DataSettingsPageProps = {
  searchParams: Promise<{ page?: string }>
}

export default async function DataSettingsPage({ searchParams }: DataSettingsPageProps) {
  const { profile } = await requireAdmin()
  const isSuperAdmin = profile.role === 'super_admin'
  const params = await searchParams
  const page = Number(params.page ?? '1')

  let auditData: Awaited<ReturnType<typeof getAuditLogs>> | null = null
  if (isSuperAdmin) {
    auditData = await getAuditLogs(page, 20)
  }

  return (
    <div className="space-y-6">
      <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
        <div>
          <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white border-b border-white/5 pb-4">
            Data Exports
          </h2>
          <p className="text-gray text-sm font-light mt-4">
            Download operational data as CSV files.
          </p>
        </div>
        <ExportButtons />
      </section>

      {isSuperAdmin && auditData && (
        <section className="bg-navy-light border border-white/5 rounded-xl p-8 space-y-6">
          <div>
            <h2 className="font-barlow-condensed text-lg font-bold tracking-widest uppercase text-white border-b border-white/5 pb-4">
              Audit Log
            </h2>
            <p className="text-gray text-sm font-light mt-4">
              System-wide change history for accountability.
            </p>
          </div>
          <AuditLogTable rows={auditData.rows} page={page} total={auditData.total} limit={20} />
        </section>
      )}
    </div>
  )
}
