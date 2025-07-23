import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { AppSettings, UserPreferences, SettingsContextType, MedicalTemplate } from '@/types/settings'
import toast from 'react-hot-toast'

// Default settings
const defaultSettings: AppSettings = {
  // Appearance
  theme: 'dark',
  fontSize: 'medium',
  showTimestamps: false,
  showCitations: true,
  animationsEnabled: true,
  
  // Chat Behavior
  autoScroll: true,
  typingIndicator: true,
  soundEnabled: false,
  enterToSend: true,
  maxChatHistory: 100,
  
  // Medical Features
  showMedicalDisclaimer: true,
  enableDrugCalculator: true,
  enableSymptomAnalyzer: true,
  enableEmergencyProtocols: true,
  defaultAgeUnit: 'years',
  defaultWeightUnit: 'kg',
  
  // RAG Settings
  maxCitations: 5,
  similarityThreshold: 0.7,
  includeRelatedTopics: true,
  preferredSpecialties: [],
  
  // Privacy & Data
  saveConversations: true,
  shareUsageData: false,
  autoDeleteAfterDays: 30,
  
  // Advanced
  apiTimeout: 30000,
  maxRetries: 3,
  debugMode: false,
  experimentalFeatures: false,
}

// Default preferences
const defaultPreferences: UserPreferences = {
  favoriteTemplates: [],
  recentSpecialties: [],
  customTemplates: [],
  shortcuts: [
    {
      id: 'new-chat',
      key: 'n',
      modifiers: ['ctrl'],
      action: 'new-chat',
      description: 'Create new chat',
      enabled: true,
    },
    {
      id: 'toggle-sidebar',
      key: 'b',
      modifiers: ['ctrl'],
      action: 'toggle-sidebar',
      description: 'Toggle sidebar',
      enabled: true,
    },
    {
      id: 'focus-input',
      key: '/',
      modifiers: [],
      action: 'focus-input',
      description: 'Focus message input',
      enabled: true,
    },
  ],
  notifications: {
    enabled: true,
    types: {
      newMessage: true,
      systemUpdates: true,
      medicalAlerts: true,
      calculatorWarnings: true,
    },
    sound: false,
    vibration: false,
  },
}

// Built-in medical templates
const builtInTemplates: MedicalTemplate[] = [
  {
    id: 'symptom-assessment',
    title: 'Symptom Assessment',
    category: 'Clinical',
    description: 'Assess pediatric symptoms and provide differential diagnosis',
    prompt: 'Please help me assess a pediatric patient with the following symptoms: {{symptoms}}. The patient is {{age}} {{ageUnit}} old. What are the most likely differential diagnoses and recommended next steps?',
    variables: [
      {
        name: 'symptoms',
        type: 'text',
        label: 'Symptoms',
        required: true,
      },
      {
        name: 'age',
        type: 'number',
        label: 'Age',
        required: true,
        validation: { min: 0, max: 18 },
      },
      {
        name: 'ageUnit',
        type: 'select',
        label: 'Age Unit',
        required: true,
        options: ['days', 'weeks', 'months', 'years'],
        defaultValue: 'years',
      },
    ],
    tags: ['symptoms', 'diagnosis', 'clinical'],
    specialty: 'General Pediatrics',
    isBuiltIn: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'drug-dosing',
    title: 'Drug Dosing Calculation',
    category: 'Pharmacology',
    description: 'Calculate pediatric drug dosages based on weight and age',
    prompt: 'Please calculate the appropriate dosage for {{drugName}} for a {{age}} {{ageUnit}} old child weighing {{weight}} kg for the indication of {{indication}}. Include dosing frequency, route, and any important warnings.',
    variables: [
      {
        name: 'drugName',
        type: 'text',
        label: 'Drug Name',
        required: true,
      },
      {
        name: 'age',
        type: 'number',
        label: 'Age',
        required: true,
        validation: { min: 0, max: 18 },
      },
      {
        name: 'ageUnit',
        type: 'select',
        label: 'Age Unit',
        required: true,
        options: ['days', 'weeks', 'months', 'years'],
        defaultValue: 'years',
      },
      {
        name: 'weight',
        type: 'number',
        label: 'Weight (kg)',
        required: true,
        validation: { min: 0.5, max: 150 },
      },
      {
        name: 'indication',
        type: 'text',
        label: 'Indication',
        required: true,
      },
    ],
    tags: ['dosing', 'pharmacology', 'medication'],
    specialty: 'Pharmacology',
    isBuiltIn: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'growth-assessment',
    title: 'Growth Assessment',
    category: 'Development',
    description: 'Assess pediatric growth parameters and development',
    prompt: 'Please assess the growth of a {{age}} {{ageUnit}} old {{sex}} child with weight {{weight}} kg, height {{height}} cm. Are these measurements within normal ranges? What are the growth percentiles and any concerns?',
    variables: [
      {
        name: 'age',
        type: 'number',
        label: 'Age',
        required: true,
        validation: { min: 0, max: 18 },
      },
      {
        name: 'ageUnit',
        type: 'select',
        label: 'Age Unit',
        required: true,
        options: ['months', 'years'],
        defaultValue: 'years',
      },
      {
        name: 'sex',
        type: 'select',
        label: 'Sex',
        required: true,
        options: ['male', 'female'],
      },
      {
        name: 'weight',
        type: 'number',
        label: 'Weight (kg)',
        required: true,
        validation: { min: 0.5, max: 150 },
      },
      {
        name: 'height',
        type: 'number',
        label: 'Height (cm)',
        required: true,
        validation: { min: 30, max: 200 },
      },
    ],
    tags: ['growth', 'development', 'percentiles'],
    specialty: 'Growth & Development',
    isBuiltIn: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'emergency-protocol',
    title: 'Emergency Protocol',
    category: 'Emergency',
    description: 'Get emergency management protocols for pediatric conditions',
    prompt: 'What is the emergency management protocol for {{condition}} in a {{age}} {{ageUnit}} old child? Please provide step-by-step instructions, medications with dosages, and critical timing.',
    variables: [
      {
        name: 'condition',
        type: 'text',
        label: 'Emergency Condition',
        required: true,
      },
      {
        name: 'age',
        type: 'number',
        label: 'Age',
        required: true,
        validation: { min: 0, max: 18 },
      },
      {
        name: 'ageUnit',
        type: 'select',
        label: 'Age Unit',
        required: true,
        options: ['days', 'weeks', 'months', 'years'],
        defaultValue: 'years',
      },
    ],
    tags: ['emergency', 'protocol', 'resuscitation'],
    specialty: 'Emergency Medicine',
    isBuiltIn: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Provider component
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...defaultPreferences,
    customTemplates: builtInTemplates,
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('nelson-gpt-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }

      const savedPreferences = localStorage.getItem('nelson-gpt-preferences')
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences)
        setPreferences({
          ...defaultPreferences,
          ...parsed,
          customTemplates: [...builtInTemplates, ...(parsed.customTemplates || [])],
        })
      } else {
        setPreferences(prev => ({
          ...prev,
          customTemplates: builtInTemplates,
        }))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('nelson-gpt-settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    }
  }, [settings])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      const preferencesToSave = {
        ...preferences,
        customTemplates: preferences.customTemplates.filter(t => !t.isBuiltIn),
      }
      localStorage.setItem('nelson-gpt-preferences', JSON.stringify(preferencesToSave))
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast.error('Failed to save preferences')
    }
  }, [preferences])

  // Update settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
    toast.success('Settings updated')
  }, [])

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
    toast.success('Preferences updated')
  }, [])

  // Reset settings
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
    setPreferences({
      ...defaultPreferences,
      customTemplates: builtInTemplates,
    })
    localStorage.removeItem('nelson-gpt-settings')
    localStorage.removeItem('nelson-gpt-preferences')
    toast.success('Settings reset to defaults')
  }, [])

  // Export settings
  const exportSettings = useCallback((): string => {
    const exportData = {
      settings,
      preferences: {
        ...preferences,
        customTemplates: preferences.customTemplates.filter(t => !t.isBuiltIn),
      },
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }
    return JSON.stringify(exportData, null, 2)
  }, [settings, preferences])

  // Import settings
  const importSettings = useCallback((settingsJson: string): boolean => {
    try {
      const importData = JSON.parse(settingsJson)
      
      if (importData.settings) {
        setSettings({ ...defaultSettings, ...importData.settings })
      }
      
      if (importData.preferences) {
        setPreferences({
          ...defaultPreferences,
          ...importData.preferences,
          customTemplates: [
            ...builtInTemplates,
            ...(importData.preferences.customTemplates || []),
          ],
        })
      }
      
      toast.success('Settings imported successfully')
      return true
    } catch (error) {
      console.error('Failed to import settings:', error)
      toast.error('Failed to import settings')
      return false
    }
  }, [])

  const contextValue: SettingsContextType = {
    settings,
    preferences,
    updateSettings,
    updatePreferences,
    resetSettings,
    exportSettings,
    importSettings,
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

// Hook to use settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

