import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ChatProvider } from '@/contexts/ChatContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { PWAProvider } from '@/contexts/PWAContext'
import ChatContainer from '@/components/Chat/ChatContainer'
import Sidebar from '@/components/Layout/Sidebar'
import TopBar from '@/components/Layout/TopBar'
import InstallPrompt from '@/components/PWA/InstallPrompt'
import MedicalDisclaimer from '@/components/Medical/MedicalDisclaimer'
import { usePWA } from '@/hooks/usePWA'
import { useSettings } from '@/hooks/useSettings'

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  useEffect(() => {
    // Check if user has seen disclaimer
    const disclaimerSeen = localStorage.getItem('nelson-gpt-disclaimer-seen')
    if (!disclaimerSeen && import.meta.env.VITE_SHOW_MEDICAL_DISCLAIMER === 'true') {
      setShowDisclaimer(true)
    }
  }, [])

  const handleDisclaimerAccept = () => {
    localStorage.setItem('nelson-gpt-disclaimer-seen', 'true')
    setShowDisclaimer(false)
  }

  return (
    <PWAProvider>
      <SettingsProvider>
        <ChatProvider>
          <Router>
            <div className="h-screen bg-background text-text-primary overflow-hidden">
              {/* Medical Disclaimer Modal */}
              {showDisclaimer && (
                <MedicalDisclaimer onAccept={handleDisclaimerAccept} />
              )}

              {/* PWA Install Prompt */}
              <InstallPrompt />

              {/* Main Layout */}
              <div className="flex h-full">
                {/* Sidebar */}
                <Sidebar 
                  isOpen={sidebarOpen} 
                  onClose={() => setSidebarOpen(false)} 
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Top Bar */}
                  <TopBar onMenuClick={() => setSidebarOpen(true)} />

                  {/* Chat Area */}
                  <div className="flex-1 overflow-hidden">
                    <Routes>
                      <Route path="/" element={<ChatContainer />} />
                      <Route path="/chat/:chatId" element={<ChatContainer />} />
                    </Routes>
                  </div>
                </div>
              </div>

              {/* Sidebar Overlay for Mobile */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Toast Notifications */}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#2a2a2a',
                    color: '#f2f2f2',
                    border: '1px solid #404040',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                  },
                  success: {
                    iconTheme: {
                      primary: '#28a745',
                      secondary: '#f2f2f2',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#dc3545',
                      secondary: '#f2f2f2',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </ChatProvider>
      </SettingsProvider>
    </PWAProvider>
  )
}

export default App

