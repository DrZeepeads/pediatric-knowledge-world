import React, { useState } from 'react'
import { Search, X, Template, Stethoscope, Calculator, AlertTriangle, TrendingUp } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { MedicalTemplate } from '@/types/settings'
import { motion, AnimatePresence } from 'framer-motion'

interface MedicalTemplatesProps {
  onSelectTemplate: (template: string) => void
  onClose: () => void
}

const MedicalTemplates: React.FC<MedicalTemplatesProps> = ({ 
  onSelectTemplate, 
  onClose 
}) => {
  const { preferences } = useSettings()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Templates', icon: Template },
    { id: 'Clinical', name: 'Clinical', icon: Stethoscope },
    { id: 'Pharmacology', name: 'Pharmacology', icon: Calculator },
    { id: 'Emergency', name: 'Emergency', icon: AlertTriangle },
    { id: 'Development', name: 'Development', icon: TrendingUp },
  ]

  // Filter templates based on search and category
  const filteredTemplates = preferences.customTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleTemplateSelect = (template: MedicalTemplate) => {
    // Replace variables with placeholders
    let processedPrompt = template.prompt
    
    if (template.variables) {
      template.variables.forEach(variable => {
        const placeholder = `[${variable.label}]`
        processedPrompt = processedPrompt.replace(
          new RegExp(`{{${variable.name}}}`, 'g'),
          placeholder
        )
      })
    }
    
    onSelectTemplate(processedPrompt)
  }

  return (
    <div className="bg-sidebar-bg border-b border-border-primary">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Template className="w-5 h-5 text-medical-primary" />
            <h3 className="text-lg font-semibold text-text-primary">
              Medical Templates
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-button hover:bg-input-bg transition-colors"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-bg border border-input-border rounded-button text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-medical-primary"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-button text-sm transition-colors ${
                selectedCategory === category.id
                  ? 'bg-medical-primary text-white'
                  : 'bg-input-bg text-text-secondary hover:text-text-primary hover:bg-border-secondary'
              }`}
            >
              <category.icon className="w-3 h-3" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <Template className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No templates found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AnimatePresence>
                {filteredTemplates.map((template, index) => (
                  <motion.button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="group p-4 bg-assistant-message border border-border-secondary rounded-xl text-left hover:border-medical-primary hover:shadow-medical-glow transition-all duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-text-primary group-hover:text-medical-primary transition-colors">
                        {template.title}
                      </h4>
                      {template.isBuiltIn && (
                        <span className="px-2 py-1 text-xs bg-medical-primary bg-opacity-20 text-medical-primary rounded">
                          Built-in
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-input-bg text-text-muted rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-input-bg text-text-muted rounded">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    {/* Variables Count */}
                    {template.variables && template.variables.length > 0 && (
                      <div className="text-xs text-text-muted">
                        {template.variables.length} variable{template.variables.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    
                    {/* Specialty */}
                    {template.specialty && (
                      <div className="text-xs text-medical-primary mt-1">
                        {template.specialty}
                      </div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border-secondary">
          <p className="text-xs text-text-muted text-center">
            Select a template to insert it into your message. Variables will be marked with [brackets] for you to fill in.
          </p>
        </div>
      </div>
    </div>
  )
}

export default MedicalTemplates

