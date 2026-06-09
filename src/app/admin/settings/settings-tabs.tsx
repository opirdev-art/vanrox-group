'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type SettingsTab = {
  label: string
  href: string
  superAdminOnly?: boolean
}

const ALL_TABS: SettingsTab[] = [
  { label: 'General', href: '/admin/settings/general' },
  { label: 'Security', href: '/admin/settings/security' },
  { label: 'Notifications', href: '/admin/settings/notifications' },
  { label: 'Staff', href: '/admin/settings/staff', superAdminOnly: true },
  { label: 'Data', href: '/admin/settings/data' },
]

type SettingsTabsProps = {
  isSuperAdmin: boolean
}

export function SettingsTabs({ isSuperAdmin }: SettingsTabsProps) {
  const pathname = usePathname()
  const tabs = ALL_TABS.filter((tab) => !tab.superAdminOnly || isSuperAdmin)

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-white/5 pb-4"
      aria-label="Settings sections"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`px-4 py-2 rounded-lg font-barlow-condensed text-xs font-bold tracking-widest uppercase transition-colors ${
              isActive
                ? 'bg-green/20 text-green border border-green/30'
                : 'text-gray hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
