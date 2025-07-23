export interface PatientInfo {
  age: number
  ageUnit: 'days' | 'weeks' | 'months' | 'years'
  weight: number
  weightUnit: 'kg' | 'lbs'
  height?: number
  heightUnit?: 'cm' | 'inches'
  sex: 'male' | 'female' | 'other'
  gestationalAge?: number // for neonates
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

export interface DrugDosage {
  drugName: string
  genericName?: string
  category: string
  indications: string[]
  dosageByAge: {
    ageGroup: string
    minAge: number
    maxAge: number
    ageUnit: 'days' | 'weeks' | 'months' | 'years'
    dosage: {
      amount: number
      unit: string
      per: 'kg' | 'dose' | 'm2'
      frequency: string
      maxDose?: number
      route: string[]
    }
  }[]
  contraindications: string[]
  warnings: string[]
  interactions?: string[]
  monitoring?: string[]
  references: string[]
}

export interface GrowthChart {
  type: 'weight' | 'height' | 'head_circumference' | 'bmi'
  sex: 'male' | 'female'
  ageInMonths: number
  value: number
  percentile: number
  zScore: number
  interpretation: string
  concerns?: string[]
}

export interface DevelopmentalMilestone {
  domain: 'gross_motor' | 'fine_motor' | 'language' | 'cognitive' | 'social_emotional'
  ageInMonths: number
  milestone: string
  description: string
  redFlags?: string[]
  nextSteps?: string[]
}

export interface VitalSigns {
  temperature?: {
    value: number
    unit: 'celsius' | 'fahrenheit'
    route: 'oral' | 'rectal' | 'axillary' | 'temporal'
  }
  heartRate?: {
    value: number
    rhythm?: string
  }
  respiratoryRate?: {
    value: number
    effort?: string
  }
  bloodPressure?: {
    systolic: number
    diastolic: number
    percentile?: number
  }
  oxygenSaturation?: {
    value: number
    onRoomAir: boolean
  }
  pain?: {
    score: number
    scale: string
  }
}

export interface ClinicalAssessment {
  chiefComplaint: string
  historyOfPresentIllness: string
  pastMedicalHistory?: string[]
  medications?: string[]
  allergies?: string[]
  familyHistory?: string[]
  socialHistory?: string
  reviewOfSystems?: Record<string, string[]>
  physicalExam?: Record<string, string>
  vitalSigns?: VitalSigns
  assessment: string[]
  plan: string[]
  followUp?: string
  redFlags?: string[]
}

export interface ImmunizationSchedule {
  vaccine: string
  ageRecommendations: {
    ageInMonths: number
    dose: string
    notes?: string
  }[]
  contraindications: string[]
  precautions: string[]
  sideEffects: string[]
  catchUpSchedule?: {
    ageRange: string
    recommendations: string[]
  }[]
}

export interface LabValue {
  name: string
  value: number
  unit: string
  referenceRange: {
    min: number
    max: number
    ageGroup?: string
    sex?: 'male' | 'female'
  }
  interpretation: 'normal' | 'low' | 'high' | 'critical'
  clinicalSignificance?: string
}

export interface MedicalCalculator {
  id: string
  name: string
  category: string
  description: string
  inputs: CalculatorInput[]
  formula: string
  interpretation: CalculatorInterpretation[]
  references: string[]
  warnings?: string[]
}

export interface CalculatorInput {
  name: string
  label: string
  type: 'number' | 'select' | 'boolean'
  unit?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    message?: string
  }
}

export interface CalculatorInterpretation {
  range: {
    min?: number
    max?: number
  }
  interpretation: string
  recommendation?: string
  urgency?: 'low' | 'medium' | 'high' | 'emergency'
}

