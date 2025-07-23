export interface AppSettings {
  // Appearance
  theme: 'dark' | 'light' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  showTimestamps: boolean
  showCitations: boolean
  animationsEnabled: boolean
  
  // Chat Behavior
  autoScroll: boolean
  typingIndicator: boolean
  soundEnabled: boolean
  enterToSend: boolean
  maxChatHistory: number
  
  // Medical Features
  showMedicalDisclaimer: boolean
  enableDrugCalculator: boolean
  enableSymptomAnalyzer: boolean
  enableEmergencyProtocols: boolean
  defaultAgeUnit: 'days' | 'weeks' | 'months' | 'years'
  defaultWeightUnit: 'kg' | 'lbs'
  
  // RAG Settings
  maxCitations: number
  similarityThreshold: number
  includeRelatedTopics: boolean
  preferredSpecialties: string[]
  
  // Privacy & Data
  saveConversations: boolean
  shareUsageData: boolean
  autoDeleteAfterDays: number
  
  // Advanced
  apiTimeout: number
  maxRetries: number
  debugMode: boolean
  experimentalFeatures: boolean
}

export interface UserPreferences {
  favoriteTemplates: string[]
  recentSpecialties: string[]
  customTemplates: MedicalTemplate[]
  shortcuts: KeyboardShortcut[]
  notifications: NotificationSettings
}

export interface KeyboardShortcut {
  id: string
  key: string
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  action: string
  description: string
  enabled: boolean
}

export interface NotificationSettings {
  enabled: boolean
  types: {
    newMessage: boolean
    systemUpdates: boolean
    medicalAlerts: boolean
    calculatorWarnings: boolean
  }
  sound: boolean
  vibration: boolean
}

export interface SettingsContextType {
  settings: AppSettings
  preferences: UserPreferences
  updateSettings: (updates: Partial<AppSettings>) => void
  updatePreferences: (updates: Partial<UserPreferences>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
}

export interface MedicalTemplate {
  id: string
  title: string
  category: string
  description: string
  prompt: string
  variables?: TemplateVariable[]
  tags: string[]
  specialty?: string
  isBuiltIn: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date'
  label: string
  required: boolean
  options?: string[]
  defaultValue?: string | number
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

