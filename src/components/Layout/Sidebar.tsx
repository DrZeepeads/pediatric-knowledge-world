import React, { useState } from 'react'
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  Info, 
  Archive, 
  Trash2, 
  Calculator,
  Stethoscope,
  AlertTriangle,
  BookOpen,
  X,
  Search
} from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { useSettings } from '@/hooks/useSettings'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { state, currentSession, createNewSession, setCurrentSession, deleteSession, archiveSession } = useChat()
  const { settings } = useSettings()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'chats' | 'tools' | 'settings'>('chats')

  // Filter sessions based on search query
  const filteredSessions = state.sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(message => 
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const handleNewChat = () => {
    createNewSession()
    onClose()
  }

  const handleSessionClick = (sessionId: string) => {
    setCurrentSession(sessionId)
    onClose()
  }

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteSession(sessionId)
    }
  }

  const handleArchiveSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    archiveSession(sessionId)
  }

  const medicalTools = [
    {
      id: 'drug-calculator',
      name: 'Drug Calculator',
      icon: Calculator,
      description: 'Calculate pediatric drug dosages',
      enabled: settings.enableDrugCalculator,
    },
    {
      id: 'symptom-analyzer',
      name: 'Symptom Analyzer',
      icon: Stethoscope,
      description: 'Analyze symptoms and differential diagnosis',
      enabled: settings.enableSymptomAnalyzer,
    },
    {
      id: 'emergency-protocols',
      name: 'Emergency Protocols',
      icon: AlertTriangle,
      description: 'Access emergency resuscitation protocols',
      enabled: settings.enableEmergencyProtocols,
    },
    {
      id: 'growth-charts',
      name: 'Growth Charts',
      icon: BookOpen,
      description: 'Growth and development assessment',
      enabled: true,
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-sidebar-bg border-r border-border-primary z-sidebar lg:relative lg:translate-x-0 safe-area-inset"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-primary">
                <h2 className="text-lg font-semibold text-text-primary">
                  NelsonGPT
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-button hover:bg-input-bg transition-colors lg:hidden"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* New Chat Button */}
              <div className="p-4">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-medical-primary text-white rounded-button hover:bg-medical-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Chat</span>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border-primary">
                {[
                  { id: 'chats', label: 'Chats', icon: MessageSquare },
                  { id: 'tools', label: 'Tools', icon: Calculator },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'text-medical-primary border-b-2 border-medical-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'chats' && (
                  <div className="flex flex-col h-full">
                    {/* Search */}
                    <div className="p-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                          type="text"
                          placeholder="Search chats..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-input-bg border border-input-border rounded-button text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-medical-primary"
                        />
                      </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                      {filteredSessions.length === 0 ? (
                        <div className="p-4 text-center text-text-secondary">
                          {searchQuery ? 'No chats found' : 'No chats yet'}
                        </div>
                      ) : (
                        <div className="space-y-1 p-2">
                          {filteredSessions.map(session => (
                            <div
                              key={session.id}
                              onClick={() => handleSessionClick(session.id)}
                              className={`group relative p-3 rounded-button cursor-pointer transition-colors ${
                                currentSession?.id === session.id
                                  ? 'bg-medical-primary bg-opacity-20 border border-medical-primary'
                                  : 'hover:bg-input-bg'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-medium text-text-primary truncate">
                                    {session.title}
                                  </h3>
                                  <p className="text-xs text-text-secondary mt-1">
                                    {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                                  </p>
                                  {session.messages.length > 0 && (
                                    <p className="text-xs text-text-muted mt-1 truncate">
                                      {session.messages[session.messages.length - 1].content}
                                    </p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleArchiveSession(session.id, e)}
                                    className="p-1 rounded hover:bg-input-bg transition-colors"
                                    title="Archive"
                                  >
                                    <Archive className="w-3 h-3 text-text-secondary" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                    className="p-1 rounded hover:bg-medical-error hover:bg-opacity-20 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3 text-medical-error" />
                                  </button>
                                </div>
                              </div>

                              {/* Tags */}
                              {session.tags && session.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {session.tags.map(tag => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 text-xs bg-input-bg text-text-secondary rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'tools' && (
                  <div className="p-4 space-y-3">
                    {medicalTools.map(tool => (
                      <button
                        key={tool.id}
                        disabled={!tool.enabled}
                        className={`w-full p-3 rounded-button text-left transition-colors ${
                          tool.enabled
                            ? 'hover:bg-input-bg border border-border-secondary'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <tool.icon className="w-5 h-5 text-medical-primary mt-0.5" />
                          <div>
                            <h3 className="text-sm font-medium text-text-primary">
                              {tool.name}
                            </h3>
                            <p className="text-xs text-text-secondary mt-1">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="p-4 space-y-3">
                    <button className="w-full p-3 rounded-button text-left hover:bg-input-bg transition-colors border border-border-secondary">
                      <div className="flex items-center space-x-3">
                        <Settings className="w-5 h-5 text-text-secondary" />
                        <div>
                          <h3 className="text-sm font-medium text-text-primary">
                            Preferences
                          </h3>
                          <p className="text-xs text-text-secondary">
                            Customize your experience
                          </p>
                        </div>
                      </div>
                    </button>

                    <button className="w-full p-3 rounded-button text-left hover:bg-input-bg transition-colors border border-border-secondary">
                      <div className="flex items-center space-x-3">
                        <Info className="w-5 h-5 text-text-secondary" />
                        <div>
                          <h3 className="text-sm font-medium text-text-primary">
                            About NelsonGPT
                          </h3>
                          <p className="text-xs text-text-secondary">
                            Version 1.0.0
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border-primary">
                <div className="text-xs text-text-muted text-center">
                  <p>Powered by Nelson Textbook of Pediatrics</p>
                  <p className="mt-1">For educational purposes only</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar

