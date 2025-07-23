import React from 'react'
import { AlertTriangle, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface MedicalDisclaimerProps {
  onAccept: () => void
  onDecline?: () => void
}

const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ 
  onAccept, 
  onDecline 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-splash p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background border border-border-primary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-border-primary">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-medical-warning bg-opacity-20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-medical-warning" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Medical Disclaimer
              </h2>
              <p className="text-sm text-text-secondary">
                Important information about using NelsonGPT
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-medical-warning bg-opacity-10 border border-medical-warning rounded-xl p-4">
            <h3 className="font-semibold text-medical-warning mb-2">
              ⚠️ Educational Tool Only
            </h3>
            <p className="text-sm text-text-primary">
              NelsonGPT is designed for educational purposes and clinical decision support. 
              It should <strong>never replace professional medical judgment</strong> or direct patient care.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary">
              Please understand that:
            </h3>
            
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start space-x-2">
                <span className="text-medical-primary mt-1">•</span>
                <span>
                  <strong>AI limitations:</strong> This AI system can make mistakes, provide incomplete information, 
                  or misinterpret medical queries.
                </span>
              </li>
              
              <li className="flex items-start space-x-2">
                <span className="text-medical-primary mt-1">•</span>
                <span>
                  <strong>Verify information:</strong> Always cross-reference AI responses with current medical 
                  literature, clinical guidelines, and professional sources.
                </span>
              </li>
              
              <li className="flex items-start space-x-2">
                <span className="text-medical-primary mt-1">•</span>
                <span>
                  <strong>Emergency situations:</strong> Never rely on this tool for emergency medical decisions. 
                  Seek immediate professional medical attention for urgent cases.
                </span>
              </li>
              
              <li className="flex items-start space-x-2">
                <span className="text-medical-primary mt-1">•</span>
                <span>
                  <strong>Professional responsibility:</strong> Healthcare providers remain fully responsible 
                  for all clinical decisions and patient care.
                </span>
              </li>
              
              <li className="flex items-start space-x-2">
                <span className="text-medical-primary mt-1">•</span>
                <span>
                  <strong>Data privacy:</strong> Do not enter real patient identifiers or confidential 
                  health information.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-medical-info bg-opacity-10 border border-medical-info rounded-xl p-4">
            <h3 className="font-semibold text-medical-info mb-2">
              ℹ️ Best Practices
            </h3>
            <ul className="text-sm text-text-primary space-y-1">
              <li>• Use for learning and clinical decision support</li>
              <li>• Always verify dosing calculations independently</li>
              <li>• Consult current clinical guidelines and protocols</li>
              <li>• Discuss complex cases with colleagues and supervisors</li>
            </ul>
          </div>

          <div className="bg-medical-success bg-opacity-10 border border-medical-success rounded-xl p-4">
            <h3 className="font-semibold text-medical-success mb-2">
              ✅ What NelsonGPT Provides
            </h3>
            <ul className="text-sm text-text-primary space-y-1">
              <li>• Evidence-based information from Nelson Textbook of Pediatrics</li>
              <li>• Educational content with proper citations</li>
              <li>• Clinical decision support tools</li>
              <li>• Quick access to pediatric medical knowledge</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-primary">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-medical-primary text-white rounded-button hover:bg-medical-secondary transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>I Understand and Accept</span>
            </button>
            
            {onDecline && (
              <button
                onClick={onDecline}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-transparent border border-border-primary text-text-secondary rounded-button hover:bg-input-bg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Decline</span>
              </button>
            )}
          </div>
          
          <p className="text-xs text-text-muted text-center mt-4">
            By continuing, you acknowledge that you have read and understood this disclaimer.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default MedicalDisclaimer

