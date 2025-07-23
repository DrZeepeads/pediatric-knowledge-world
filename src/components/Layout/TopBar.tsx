import React from 'react'
import { Menu, Settings, Stethoscope, Wifi, WifiOff } from 'lucide-react'
import { usePWA } from '@/contexts/PWAContext'
import { useSettings } from '@/hooks/useSettings'

interface TopBarProps {
  onMenuClick: () => void
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { isOnline, updateAvailable, updateApp } = usePWA()
  const { settings } = useSettings()

  return (
    <div className="flex items-center justify-between h-16 px-4 bg-sidebar-bg border-b border-border-primary safe-area-inset">
      {/* Left Section */}
      <div className="flex items-center space-x-3">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-button hover:bg-input-bg transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-text-primary" />
        </button>

        {/* Logo and Title */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-medical-primary rounded-button">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-text-primary">
              NelsonGPT
            </h1>
            <p className="text-xs text-text-secondary -mt-1">
              Pediatric Medical Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Connection Status */}
        <div className="flex items-center space-x-1">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-medical-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-medical-error" />
          )}
          <span className="hidden sm:inline text-xs text-text-secondary">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Update Available Button */}
        {updateAvailable && (
          <button
            onClick={updateApp}
            className="px-3 py-1 text-xs bg-medical-primary text-white rounded-button hover:bg-medical-secondary transition-colors"
          >
            Update Available
          </button>
        )}

        {/* Model Selector */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-xs text-text-secondary">Model:</span>
          <select className="bg-input-bg border border-input-border rounded-button px-2 py-1 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-medical-primary">
            <option value="mistral-7b">Mistral 7B</option>
            <option value="mistral-8x7b">Mistral 8x7B</option>
          </select>
        </div>

        {/* Settings Button */}
        <button
          className="p-2 rounded-button hover:bg-input-bg transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-text-secondary" />
        </button>
      </div>
    </div>
  )
}

export default TopBar

