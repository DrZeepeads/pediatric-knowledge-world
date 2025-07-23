import React, { useEffect, useRef, useState } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { useSettings } from '@/hooks/useSettings'
import MessageBubble from './MessageBubble'
import InputArea from './InputArea'
import TypingIndicator from './TypingIndicator'
import WelcomeScreen from './WelcomeScreen'
import { motion, AnimatePresence } from 'framer-motion'

const ChatContainer: React.FC = () => {
  const { state, currentSession, sendMessage } = useChat()
  const { settings } = useSettings()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (settings.autoScroll && isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentSession?.messages, settings.autoScroll, isAtBottom])

  // Check if user is at bottom of chat
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const atBottom = scrollTop + clientHeight >= scrollHeight - 100
      setIsAtBottom(atBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to bottom button
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content: string) => {
    await sendMessage(content)
  }

  // Show welcome screen if no current session or no messages
  if (!currentSession || currentSession.messages.length === 0) {
    return (
      <div className="flex flex-col h-full bg-chat-container">
        <div className="flex-1 flex items-center justify-center">
          <WelcomeScreen onSendMessage={handleSendMessage} />
        </div>
        <InputArea onSendMessage={handleSendMessage} disabled={state.isLoading} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-chat-container">
      {/* Messages Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {currentSession.messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: 'easeOut'
                }}
              >
                <MessageBubble 
                  message={message} 
                  showTimestamp={settings.showTimestamps}
                  showCitations={settings.showCitations}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {state.isLoading && state.typingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TypingIndicator message={state.typingMessage} />
            </motion.div>
          )}

          {/* Error Message */}
          {state.error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <div className="bg-medical-error bg-opacity-20 border border-medical-error rounded-message px-4 py-3 max-w-md">
                <p className="text-medical-error text-sm text-center">
                  {state.error}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-6 z-10"
          >
            <button
              onClick={scrollToBottom}
              className="p-3 bg-medical-primary text-white rounded-full shadow-lg hover:bg-medical-secondary transition-colors"
              aria-label="Scroll to bottom"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <InputArea 
        onSendMessage={handleSendMessage} 
        disabled={state.isLoading}
      />
    </div>
  )
}

export default ChatContainer

