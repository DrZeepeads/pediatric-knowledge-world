import { useContext } from 'react'
import { SettingsContext } from '@/contexts/SettingsContext'
import { SettingsContextType } from '@/types/settings'

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

