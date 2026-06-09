'use client'

import { createContext, useContext } from 'react'
import type { BusinessSettingsRecord } from '@/lib/settings/queries'

const BusinessSettingsContext = createContext<BusinessSettingsRecord | null>(null)

export function BusinessSettingsProvider({
  value,
  children,
}: {
  value: BusinessSettingsRecord
  children: React.ReactNode
}) {
  return (
    <BusinessSettingsContext.Provider value={value}>{children}</BusinessSettingsContext.Provider>
  )
}

export function useBusinessSettings(): BusinessSettingsRecord {
  const value = useContext(BusinessSettingsContext)
  if (!value) {
    throw new Error('useBusinessSettings must be used within BusinessSettingsProvider')
  }
  return value
}
