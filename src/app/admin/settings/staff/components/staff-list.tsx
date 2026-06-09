'use client'

import { useTransition } from 'react'
import { STAFF_ROLE_OPTIONS } from '@/lib/auth/staff-roles'
import type { StaffMemberWithInviteStatus } from '@/lib/settings/staff-invite-status'
import { changeStaffRole, deactivateStaffMember, resendStaffInvite } from '../actions'

type StaffListProps = {
  staff: StaffMemberWithInviteStatus[]
}

export function StaffList({ staff }: StaffListProps) {
  const [pending, startTransition] = useTransition()

  if (staff.length === 0) {
    return <p className="text-gray text-sm font-light">No other staff members yet.</p>
  }

  function handleRoleChange(userId: string, role: string) {
    const formData = new FormData()
    formData.set('user_id', userId)
    formData.set('role', role)
    startTransition(async () => {
      await changeStaffRole(formData)
    })
  }

  function handleDeactivate(userId: string, name: string) {
    if (!window.confirm(`Deactivate ${name}? They will lose access immediately.`)) return
    const formData = new FormData()
    formData.set('user_id', userId)
    startTransition(async () => {
      await deactivateStaffMember(formData)
    })
  }

  function handleResendInvite(userId: string) {
    const formData = new FormData()
    formData.set('user_id', userId)
    startTransition(async () => {
      const result = await resendStaffInvite(formData)
      if (result.ok === false) {
        window.alert(result.error)
      }
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray border-b border-white/5">
            <th className="py-3 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">Name</th>
            <th className="py-3 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">Role</th>
            <th className="py-3 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">Status</th>
            <th className="py-3 pr-4 font-barlow-condensed tracking-widest uppercase text-xs">Joined</th>
            <th className="py-3 font-barlow-condensed tracking-widest uppercase text-xs">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => {
            const isSuperAdmin = member.role === 'super_admin'
            return (
              <tr key={member.id} className="border-b border-white/5 text-white/90">
                <td className="py-4 pr-4">{member.full_name}</td>
                <td className="py-4 pr-4">
                  <select
                    value={member.role}
                    disabled={pending || member.inviteStatus === 'invite_pending'}
                    onChange={(event) => handleRoleChange(member.id, event.target.value)}
                    className="bg-navy border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:border-green outline-none disabled:opacity-50"
                  >
                    {STAFF_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-navy">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4 pr-4">
                  {member.inviteStatus === 'invite_pending' ? (
                    <span className="text-amber-300 text-xs font-barlow-condensed font-bold tracking-widest uppercase">
                      Invite pending
                    </span>
                  ) : (
                    <span className="text-green text-xs font-barlow-condensed font-bold tracking-widest uppercase">
                      Active
                    </span>
                  )}
                </td>
                <td className="py-4 pr-4 text-gray">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                <td className="py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {member.inviteStatus === 'invite_pending' && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleResendInvite(member.id)}
                        className="text-green hover:text-green/80 text-xs font-barlow-condensed font-bold tracking-widest uppercase disabled:opacity-50"
                      >
                        Resend invite
                      </button>
                    )}
                    {!isSuperAdmin && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleDeactivate(member.id, member.full_name)}
                        className="text-red-400 hover:text-red-300 text-xs font-barlow-condensed font-bold tracking-widest uppercase disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
