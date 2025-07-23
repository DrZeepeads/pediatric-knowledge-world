import React from 'react'
import { 
  Stethoscope, 
  Calculator, 
  AlertTriangle, 
  BookOpen, 
  TrendingUp,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSendMessage }) => {
  const quickStartPrompts = [
    {
      icon: Stethoscope,
      title: 'Symptom Assessment',
      description: 'Analyze pediatric symptoms and differential diagnosis',
      prompt: 'Help me assess a 3-year-old with fever, cough, and difficulty breathing',
      color: 'text-medical-primary',
    },
    {
      icon: Calculator,
      title: 'Drug Dosing',
      description: 'Calculate pediatric medication dosages',
      prompt: 'Calculate amoxicillin dosage for a 2-year-old weighing 12kg with otitis media',
      color: 'text-medical-success',
    },
    {
      icon: AlertTriangle,
      title: 'Emergency Protocol',
      description: 'Access emergency resuscitation protocols',
      prompt: 'What is the emergency protocol for pediatric anaphylaxis in a 5-year-old?',
      color: 'text-medical-error',
    },
    {
      icon: TrendingUp,
      title: 'Growth Assessment',
      description: 'Evaluate growth and development milestones',
      prompt: 'Assess growth parameters for a 6-month-old: weight 7kg, length 65cm',
      color: 'text-medical-info',
    },
  ]

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-medical-primary rounded-2xl flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-medical-primary" />
            </motion.div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Welcome to NelsonGPT
        </h1>
        
        <p className="text-lg text-text-secondary mb-2">
          Evidence-based pediatric medical assistant
        </p>
        
        <p className="text-sm text-text-muted max-w-2xl mx-auto">
          Powered by the Nelson Textbook of Pediatrics, providing accurate, 
          citation-backed medical information for pediatricians, residents, and medical students.
        </p>
      </motion.div>

      {/* Quick Start Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {quickStartPrompts.map((item, index) => (
          <motion.button
            key={index}
            onClick={() => handlePromptClick(item.prompt)}
            className="group p-6 bg-assistant-message border border-border-secondary rounded-2xl text-left hover:border-medical-primary hover:shadow-medical-glow transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl bg-opacity-20 ${item.color.replace('text-', 'bg-')}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-medical-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary mb-3">
                  {item.description}
                </p>
                <p className="text-xs text-text-muted italic">
                  "{item.prompt}"
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="text-center p-4">
          <BookOpen className="w-8 h-8 text-medical-primary mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Evidence-Based
          </h3>
          <p className="text-xs text-text-secondary">
            All responses backed by Nelson Textbook citations
          </p>
        </div>

        <div className="text-center p-4">
          <MessageSquare className="w-8 h-8 text-medical-success mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Conversational AI
          </h3>
          <p className="text-xs text-text-secondary">
            Natural language interface for medical queries
          </p>
        </div>

        <div className="text-center p-4">
          <Stethoscope className="w-8 h-8 text-medical-info mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Clinical Focus
          </h3>
          <p className="text-xs text-text-secondary">
            Specialized for pediatric medical practice
          </p>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center"
      >
        <p className="text-text-secondary mb-4">
          Start by asking a medical question or selecting a template below
        </p>
        <div className="flex items-center justify-center space-x-2 text-xs text-text-muted">
          <span>💡</span>
          <span>Tip: Be specific with patient age, weight, and symptoms for better results</span>
        </div>
      </motion.div>

      {/* Medical Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 p-4 bg-medical-warning bg-opacity-10 border border-medical-warning rounded-xl"
      >
        <p className="text-xs text-medical-warning text-center">
          <strong>Medical Disclaimer:</strong> This tool is for educational purposes only and should not replace professional medical judgment. 
          Always verify information and consult appropriate clinical sources before making medical decisions.
        </p>
      </motion.div>
    </div>
  )
}

export default WelcomeScreen

