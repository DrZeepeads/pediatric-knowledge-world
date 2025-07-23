import React from 'react'
import { Bot } from 'lucide-react'
import { motion } from 'framer-motion'

interface TypingIndicatorProps {
  message?: string
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  message = 'NelsonGPT is thinking...' 
}) => {
  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-assistant-message border border-border-primary flex items-center justify-center">
            <Bot className="w-4 h-4 text-medical-primary" />
          </div>
        </div>

        {/* Typing Bubble */}
        <div className="bg-assistant-message border border-border-secondary rounded-message px-4 py-3 shadow-message">
          <div className="flex items-center space-x-2">
            {/* Typing Animation */}
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-medical-primary rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Typing Message */}
            <span className="text-sm text-text-secondary ml-2">
              {message}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator

