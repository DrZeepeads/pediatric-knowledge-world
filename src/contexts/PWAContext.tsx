import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface PWAContextType {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  showInstallPrompt: boolean
  installApp: () => Promise<void>
  dismissInstallPrompt: () => void
  updateAvailable: boolean
  updateApp: () => void
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  // Check if app is already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isIOSStandalone)
    }

    checkInstalled()
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkInstalled)
    
    return () => mediaQuery.removeEventListener('change', checkInstalled)
  }, [])

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
      
      // Show install prompt after a delay if not dismissed before
      const promptDismissed = localStorage.getItem('nelson-gpt-install-prompt-dismissed')
      if (!promptDismissed && !isInstalled) {
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 10000) // Show after 10 seconds
      }
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      console.log('NelsonGPT was installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInstalled])

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Handle service worker updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true)
      })

      // Check for updates periodically
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration) {
            registration.update()
          }
        })
      }

      // Check for updates every 30 minutes
      const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000)
      
      return () => clearInterval(updateInterval)
    }
  }, [])

  // Install app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
        localStorage.setItem('nelson-gpt-install-prompt-dismissed', 'true')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('Error during app installation:', error)
    }
  }, [deferredPrompt])

  // Dismiss install prompt
  const dismissInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false)
    localStorage.setItem('nelson-gpt-install-prompt-dismissed', 'true')
  }, [])

  // Update app
  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }, [])

  const contextValue: PWAContextType = {
    isInstallable,
    isInstalled,
    isOnline,
    showInstallPrompt,
    installApp,
    dismissInstallPrompt,
    updateAvailable,
    updateApp,
  }

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  )
}

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

