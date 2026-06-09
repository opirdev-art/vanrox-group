import Link from 'next/link'
import type { AuditLogRow } from '@/lib/settings/audit-queries'

type AuditLogTableProps = {
  rows: AuditLogRow[]
  page: number
  total: number
  limit: number
}

export function AuditLogTable({ rows, page, total, limit }: AuditLogTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (rows.length === 0) {
    return <p className="text-gray text-sm font-light">No audit log entries yet.</p>
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray border-b border-white/5">
              <th className="py-3 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">When</th>
              <th className="py-3 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">Action</th>
              <th className="py-3 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">Table</th>
              <th className="py-3 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">Record</th>
              <th className="py-3 font-barlow-condensed tracking-widest uppercase text-xs">User</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5 text-white/90">
                <td className="py-3 pr-4 text-gray whitespace-nowrap">
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td className="py-3 pr-4">{row.action}</td>
                <td className="py-3 pr-4">{row.table_name}</td>
                <td className="py-3 pr-4 font-mono text-xs text-gray">{row.record_id ?? '—'}</td>
                <td className="py-3">{row.user_name ?? 'System'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          {page > 1 && (
            <Link
              href={`/admin/settings/data?page=${page - 1}`}
              className="text-green hover:underline no-underline"
            >
              Previous
            </Link>
          )}
          <span className="text-gray">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/settings/data?page=${page + 1}`}
              className="text-green hover:underline no-underline"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
