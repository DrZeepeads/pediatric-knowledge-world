import React from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { usePWA } from '@/contexts/PWAContext'
import { motion, AnimatePresence } from 'framer-motion'

const InstallPrompt: React.FC = () => {
  const { showInstallPrompt, installApp, dismissInstallPrompt, isInstalled } = usePWA()

  if (isInstalled || !showInstallPrompt) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
      >
        <div className="bg-background border border-border-primary rounded-2xl shadow-lg p-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0 p-2 bg-medical-primary bg-opacity-20 rounded-xl">
              <Smartphone className="w-5 h-5 text-medical-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Install NelsonGPT
              </h3>
              <p className="text-xs text-text-secondary mb-3">
                Add to your home screen for quick access to pediatric medical assistance
              </p>

              {/* Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={installApp}
                  className="flex items-center space-x-1 px-3 py-2 bg-medical-primary text-white text-xs rounded-button hover:bg-medical-secondary transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Install</span>
                </button>
                
                <button
                  onClick={dismissInstallPrompt}
                  className="px-3 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={dismissInstallPrompt}
              className="flex-shrink-0 p-1 rounded-button hover:bg-input-bg transition-colors"
            >
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default InstallPrompt

