import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChatContextType, ChatState, ChatSession, Message, MedicalContext } from '@/types/chat'
import { ragService } from '@/services/ragService'
import { useSettings } from '@/hooks/useSettings'
import toast from 'react-hot-toast'

// Initial state
const initialState: ChatState = {
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  error: null,
  typingMessage: null,
}

// Action types
type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TYPING'; payload: string | null }
  | { type: 'ADD_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_SESSION'; payload: { sessionId: string; updates: Partial<ChatSession> } }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_CURRENT_SESSION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { sessionId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { sessionId: string; messageId: string; updates: Partial<Message> } }
  | { type: 'LOAD_SESSIONS'; payload: ChatSession[] }

// Reducer
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_TYPING':
      return { ...state, typingMessage: action.payload }
    
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        currentSessionId: action.payload.id,
      }
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.sessionId
            ? { ...session, ...action.payload.updates, updatedAt: new Date() }
            : session
        ),
      }
    
    case 'DELETE_SESSION':
      const filteredSessions = state.sessions.filter(s => s.id !== action.payload)
      return {
        ...state,
        sessions: filteredSessions,
        currentSessionId: state.currentSessionId === action.payload 
          ? (filteredSessions[0]?.id || null) 
          : state.currentSessionId,
      }
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSessionId: action.payload }
    
    case 'ADD_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.sessionId
            ? {
                ...session,
                messages: [...session.messages, action.payload.message],
                updatedAt: new Date(),
              }
            : session
        ),
      }
    
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.sessionId
            ? {
                ...session,
                messages: session.messages.map(message =>
                  message.id === action.payload.messageId
                    ? { ...message, ...action.payload.updates }
                    : message
                ),
                updatedAt: new Date(),
              }
            : session
        ),
      }
    
    case 'LOAD_SESSIONS':
      return { ...state, sessions: action.payload }
    
    default:
      return state
  }
}

// Context
const ChatContext = createContext<ChatContextType | undefined>(undefined)

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const { settings } = useSettings()

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loadSessions = () => {
      try {
        const savedSessions = localStorage.getItem('nelson-gpt-sessions')
        if (savedSessions) {
          const sessions: ChatSession[] = JSON.parse(savedSessions).map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((message: any) => ({
              ...message,
              timestamp: new Date(message.timestamp),
            })),
          }))
          
          // Apply chat history limit
          const limitedSessions = sessions.slice(0, settings.maxChatHistory)
          dispatch({ type: 'LOAD_SESSIONS', payload: limitedSessions })
          
          // Set current session if none exists
          if (limitedSessions.length > 0 && !state.currentSessionId) {
            dispatch({ type: 'SET_CURRENT_SESSION', payload: limitedSessions[0].id })
          }
        }
      } catch (error) {
        console.error('Failed to load chat sessions:', error)
        toast.error('Failed to load chat history')
      }
    }

    loadSessions()
  }, [settings.maxChatHistory])

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    if (settings.saveConversations && state.sessions.length > 0) {
      try {
        localStorage.setItem('nelson-gpt-sessions', JSON.stringify(state.sessions))
      } catch (error) {
        console.error('Failed to save chat sessions:', error)
        toast.error('Failed to save chat history')
      }
    }
  }, [state.sessions, settings.saveConversations])

  // Get current session
  const currentSession = state.sessions.find(s => s.id === state.currentSessionId) || null

  // Create new session
  const createNewSession = useCallback((title?: string): string => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: title || 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
      tags: [],
    }
    
    dispatch({ type: 'ADD_SESSION', payload: newSession })
    return newSession.id
  }, [])

  // Send message
  const sendMessage = useCallback(async (content: string, context?: MedicalContext) => {
    if (!content.trim()) return

    // Ensure we have a current session
    let sessionId = state.currentSessionId
    if (!sessionId) {
      sessionId = createNewSession()
    }

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      medicalContext: context,
    }

    // Add user message
    dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: userMessage } })

    // Update session title if it's the first message
    const session = state.sessions.find(s => s.id === sessionId)
    if (session && session.messages.length === 0) {
      const title = content.length > 50 ? content.substring(0, 50) + '...' : content
      dispatch({ type: 'UPDATE_SESSION', payload: { sessionId, updates: { title } } })
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      // Show typing indicator
      if (settings.typingIndicator) {
        dispatch({ type: 'SET_TYPING', payload: 'NelsonGPT is thinking...' })
      }

      // Get RAG response
      const response = await ragService.queryMedicalKnowledge({
        query: content,
        context,
        maxCitations: settings.maxCitations,
        includeRelated: settings.includeRelatedTopics,
      })

      // Create assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        content: response.answer,
        role: 'assistant',
        timestamp: new Date(),
        citations: response.citations,
        medicalContext: response.medicalContext,
      }

      // Add assistant message
      dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: assistantMessage } })

    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response'
      
      // Create error message
      const errorResponse: Message = {
        id: uuidv4(),
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        error: errorMessage,
      }

      dispatch({ type: 'ADD_MESSAGE', payload: { sessionId, message: errorResponse } })
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast.error('Failed to get response from NelsonGPT')
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
      dispatch({ type: 'SET_TYPING', payload: null })
    }
  }, [state.currentSessionId, state.sessions, createNewSession, settings])

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    dispatch({ type: 'DELETE_SESSION', payload: sessionId })
    toast.success('Chat deleted')
  }, [])

  // Archive session
  const archiveSession = useCallback((sessionId: string) => {
    dispatch({ type: 'UPDATE_SESSION', payload: { sessionId, updates: { isArchived: true } } })
    toast.success('Chat archived')
  }, [])

  // Set current session
  const setCurrentSession = useCallback((sessionId: string) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: sessionId })
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [])

  // Regenerate response
  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!state.currentSessionId) return

    const session = state.sessions.find(s => s.id === state.currentSessionId)
    if (!session) return

    const messageIndex = session.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1 || messageIndex === 0) return

    const previousMessage = session.messages[messageIndex - 1]
    if (previousMessage.role !== 'user') return

    // Remove the message to regenerate and all messages after it
    const updatedMessages = session.messages.slice(0, messageIndex)
    dispatch({ 
      type: 'UPDATE_SESSION', 
      payload: { 
        sessionId: state.currentSessionId, 
        updates: { messages: updatedMessages } 
      } 
    })

    // Resend the previous user message
    await sendMessage(previousMessage.content, previousMessage.medicalContext)
  }, [state.currentSessionId, state.sessions, sendMessage])

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!state.currentSessionId) return

    const session = state.sessions.find(s => s.id === state.currentSessionId)
    if (!session) return

    const messageIndex = session.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    const message = session.messages[messageIndex]
    if (message.role !== 'user') return

    // Update the message content
    dispatch({
      type: 'UPDATE_MESSAGE',
      payload: {
        sessionId: state.currentSessionId,
        messageId,
        updates: { content: newContent }
      }
    })

    // Remove all messages after the edited message
    const updatedMessages = session.messages.slice(0, messageIndex + 1)
    updatedMessages[messageIndex] = { ...message, content: newContent }
    
    dispatch({
      type: 'UPDATE_SESSION',
      payload: {
        sessionId: state.currentSessionId,
        updates: { messages: updatedMessages }
      }
    })

    // Resend with new content
    await sendMessage(newContent, message.medicalContext)
  }, [state.currentSessionId, state.sessions, sendMessage])

  const contextValue: ChatContextType = {
    state,
    currentSession,
    sendMessage,
    createNewSession,
    deleteSession,
    archiveSession,
    setCurrentSession,
    clearError,
    regenerateResponse,
    editMessage,
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook to use chat context
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

