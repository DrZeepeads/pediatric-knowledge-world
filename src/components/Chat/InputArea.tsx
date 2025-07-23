import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Paperclip, Smile, Template } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { motion, AnimatePresence } from 'framer-motion'
import MedicalTemplates from '@/components/Medical/MedicalTemplates'

interface InputAreaProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { settings } = useSettings()

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (settings.enterToSend && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleVoiceToggle = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true)
      // TODO: Implement voice recording
    } else {
      // Stop recording
      setIsRecording(false)
      // TODO: Process voice input
    }
  }

  const handleTemplateSelect = (template: string) => {
    setMessage(template)
    setShowTemplates(false)
    textareaRef.current?.focus()
  }

  const isMessageValid = message.trim().length > 0 && message.length <= (settings.maxMessageLength || 4000)

  return (
    <div className="border-t border-border-primary bg-background">
      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border-primary"
          >
            <MedicalTemplates
              onSelectTemplate={handleTemplateSelect}
              onClose={() => setShowTemplates(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="p-4 safe-area-inset">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            {/* Main Input Container */}
            <div className="relative flex items-end bg-input-bg border border-input-border rounded-input shadow-input">
              {/* Left Actions */}
              <div className="flex items-center space-x-1 p-2">
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className={`p-2 rounded-button transition-colors ${
                    showTemplates 
                      ? 'bg-medical-primary text-white' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-input-border'
                  }`}
                  title="Medical templates"
                >
                  <Template className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  className="p-2 rounded-button text-text-secondary hover:text-text-primary hover:bg-input-border transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>

              {/* Text Input */}
              <div className="flex-1 min-w-0">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about pediatric medicine..."
                  disabled={disabled}
                  className="w-full bg-transparent text-text-primary placeholder-text-secondary resize-none border-none outline-none py-3 px-2 min-h-[24px] max-h-[120px] scrollbar-thin"
                  rows={1}
                  maxLength={settings.maxMessageLength || 4000}
                />
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-1 p-2">
                {/* Voice Input */}
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`p-2 rounded-button transition-colors ${
                    isRecording
                      ? 'bg-medical-error text-white animate-pulse'
                      : 'text-text-secondary hover:text-text-primary hover:bg-input-border'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Voice input'}
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!isMessageValid || disabled}
                  className={`p-2 rounded-button transition-all ${
                    isMessageValid && !disabled
                      ? 'bg-medical-primary text-white hover:bg-medical-secondary transform hover:scale-105'
                      : 'bg-button-secondary text-text-muted cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Character Count */}
            {message.length > (settings.maxMessageLength || 4000) * 0.8 && (
              <div className="absolute -top-6 right-0 text-xs text-text-secondary">
                {message.length}/{settings.maxMessageLength || 4000}
              </div>
            )}
          </form>

          {/* Keyboard Shortcut Hint */}
          <div className="mt-2 text-xs text-text-muted text-center">
            {settings.enterToSend ? (
              <span>Press Enter to send, Shift+Enter for new line</span>
            ) : (
              <span>Press Ctrl+Enter to send</span>
            )}
          </div>

          {/* Medical Disclaimer */}
          <div className="mt-2 text-xs text-text-muted text-center">
            <span>
              NelsonGPT can make mistakes. Always verify medical information and consult professional sources.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InputArea

