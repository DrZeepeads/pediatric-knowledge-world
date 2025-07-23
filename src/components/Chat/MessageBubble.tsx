import React, { useState } from 'react'
import { format } from 'date-fns'
import { Copy, Edit, RotateCcw, User, Bot, ExternalLink, BookOpen } from 'lucide-react'
import { Message } from '@/types/chat'
import MarkdownRenderer from '@/components/Markdown/MarkdownRenderer'
import CitationList from './CitationList'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface MessageBubbleProps {
  message: Message
  showTimestamp?: boolean
  showCitations?: boolean
  onEdit?: (messageId: string, newContent: string) => void
  onRegenerate?: (messageId: string) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showTimestamp = false,
  showCitations = true,
  onEdit,
  onRegenerate,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [showActions, setShowActions] = useState(false)

  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const hasError = !!message.error

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      toast.success('Copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleEdit = () => {
    if (onEdit && isUser) {
      setIsEditing(true)
    }
  }

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim())
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditContent(message.content)
    setIsEditing(false)
  }

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(message.id)
    }
  }

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-medical-primary' 
              : hasError 
                ? 'bg-medical-error' 
                : 'bg-assistant-message border border-border-primary'
          }`}>
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className={`w-4 h-4 ${hasError ? 'text-white' : 'text-medical-primary'}`} />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message Bubble */}
          <div className={`relative rounded-message px-4 py-3 shadow-message ${
            isUser 
              ? 'bg-user-message text-text-primary' 
              : hasError
                ? 'bg-medical-error bg-opacity-20 border border-medical-error'
                : 'bg-assistant-message text-text-primary border border-border-secondary'
          }`}>
            {/* Editing Mode */}
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[100px] bg-input-bg border border-input-border rounded-button px-3 py-2 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  autoFocus
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-sm bg-medical-primary text-white rounded-button hover:bg-medical-secondary transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Message Content */}
                {isUser ? (
                  <p className="text-text-primary whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <MarkdownRenderer content={message.content} />
                  </div>
                )}

                {/* Medical Context */}
                {message.medicalContext && (
                  <div className="mt-3 pt-3 border-t border-border-secondary">
                    <div className="flex flex-wrap gap-2">
                      {message.medicalContext.specialty && (
                        <span className="px-2 py-1 text-xs bg-medical-primary bg-opacity-20 text-medical-primary rounded">
                          {message.medicalContext.specialty}
                        </span>
                      )}
                      {message.medicalContext.urgency && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          message.medicalContext.urgency === 'emergency' 
                            ? 'bg-medical-error bg-opacity-20 text-medical-error'
                            : message.medicalContext.urgency === 'high'
                              ? 'bg-medical-warning bg-opacity-20 text-medical-warning'
                              : 'bg-medical-info bg-opacity-20 text-medical-info'
                        }`}>
                          {message.medicalContext.urgency}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {hasError && (
                  <div className="mt-3 pt-3 border-t border-medical-error">
                    <p className="text-xs text-medical-error">
                      Error: {message.error}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            {showActions && !isEditing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute top-2 ${isUser ? 'left-2' : 'right-2'} flex space-x-1`}
              >
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-input-bg transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3 text-text-secondary" />
                </button>
                
                {isUser && onEdit && (
                  <button
                    onClick={handleEdit}
                    className="p-1 rounded hover:bg-input-bg transition-colors"
                    title="Edit message"
                  >
                    <Edit className="w-3 h-3 text-text-secondary" />
                  </button>
                )}
                
                {isAssistant && onRegenerate && (
                  <button
                    onClick={handleRegenerate}
                    className="p-1 rounded hover:bg-input-bg transition-colors"
                    title="Regenerate response"
                  >
                    <RotateCcw className="w-3 h-3 text-text-secondary" />
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Citations */}
          {showCitations && message.citations && message.citations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 max-w-full"
            >
              <CitationList citations={message.citations} />
            </motion.div>
          )}

          {/* Timestamp */}
          {showTimestamp && (
            <div className={`mt-2 text-xs text-text-muted ${isUser ? 'text-right' : 'text-left'}`}>
              {format(message.timestamp, 'MMM d, yyyy h:mm a')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble

