export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
  citations?: Citation[]
  medicalContext?: MedicalContext
  isTyping?: boolean
  error?: string
}

export interface Citation {
  id: string
  source: string
  page?: number
  section?: string
  url?: string
  confidence?: number
  excerpt?: string
}

export interface MedicalContext {
  specialty?: string
  condition?: string
  ageGroup?: string
  urgency?: 'low' | 'medium' | 'high' | 'emergency'
  keywords?: string[]
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  medicalContext?: MedicalContext
  isArchived?: boolean
  tags?: string[]
}

export interface ChatState {
  sessions: ChatSession[]
  currentSessionId: string | null
  isLoading: boolean
  error: string | null
  typingMessage: string | null
}

export interface ChatContextType {
  state: ChatState
  currentSession: ChatSession | null
  sendMessage: (content: string, context?: MedicalContext) => Promise<void>
  createNewSession: (title?: string) => string
  deleteSession: (sessionId: string) => void
  archiveSession: (sessionId: string) => void
  setCurrentSession: (sessionId: string) => void
  clearError: () => void
  regenerateResponse: (messageId: string) => Promise<void>
  editMessage: (messageId: string, newContent: string) => Promise<void>
}

export interface RAGResponse {
  answer: string
  citations: Citation[]
  confidence: number
  medicalContext?: MedicalContext
  relatedTopics?: string[]
}

export interface MedicalQuery {
  query: string
  context?: MedicalContext
  maxCitations?: number
  includeRelated?: boolean
}

export interface DrugCalculation {
  drugName: string
  patientWeight: number
  patientAge: number
  indication: string
  dosage: {
    amount: number
    unit: string
    frequency: string
    duration?: string
  }
  warnings?: string[]
  contraindications?: string[]
}

export interface SymptomAnalysis {
  symptoms: string[]
  ageGroup: string
  differentialDiagnosis: {
    condition: string
    probability: number
    reasoning: string
    urgency: 'low' | 'medium' | 'high' | 'emergency'
  }[]
  recommendedActions: string[]
  redFlags?: string[]
}

export interface EmergencyProtocol {
  id: string
  title: string
  category: string
  ageGroups: string[]
  steps: {
    order: number
    action: string
    timeframe?: string
    critical?: boolean
  }[]
  medications?: {
    name: string
    dosage: string
    route: string
    timing: string
  }[]
  equipment?: string[]
  contraindications?: string[]
}

