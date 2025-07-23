import React, { useState } from 'react'
import { ExternalLink, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { Citation } from '@/types/chat'
import { motion, AnimatePresence } from 'framer-motion'

interface CitationListProps {
  citations: Citation[]
  maxVisible?: number
}

const CitationList: React.FC<CitationListProps> = ({ 
  citations, 
  maxVisible = 3 
}) => {
  const [showAll, setShowAll] = useState(false)
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null)

  const visibleCitations = showAll ? citations : citations.slice(0, maxVisible)
  const hasMore = citations.length > maxVisible

  const handleCitationClick = (citationId: string) => {
    setExpandedCitation(expandedCitation === citationId ? null : citationId)
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-text-secondary'
    if (confidence >= 0.8) return 'text-medical-success'
    if (confidence >= 0.6) return 'text-medical-warning'
    return 'text-medical-error'
  }

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return 'Unknown'
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center space-x-2 text-xs text-text-secondary">
        <BookOpen className="w-3 h-3" />
        <span>References from Nelson Textbook of Pediatrics</span>
      </div>

      {/* Citations */}
      <div className="space-y-2">
        <AnimatePresence>
          {visibleCitations.map((citation, index) => (
            <motion.div
              key={citation.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.1 }}
              className="bg-citation-bg border border-citation-border rounded-card p-3 shadow-citation"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Citation Header */}
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-medical-primary">
                      [{index + 1}]
                    </span>
                    <span className="text-sm font-medium text-text-primary truncate">
                      {citation.source}
                    </span>
                    {citation.page && (
                      <span className="text-xs text-text-secondary">
                        p. {citation.page}
                      </span>
                    )}
                  </div>

                  {/* Section */}
                  {citation.section && (
                    <p className="text-xs text-text-secondary mb-2">
                      Section: {citation.section}
                    </p>
                  )}

                  {/* Excerpt Preview */}
                  {citation.excerpt && (
                    <div className="mb-2">
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {expandedCitation === citation.id 
                          ? citation.excerpt 
                          : `${citation.excerpt.substring(0, 100)}${citation.excerpt.length > 100 ? '...' : ''}`
                        }
                      </p>
                      
                      {citation.excerpt.length > 100 && (
                        <button
                          onClick={() => handleCitationClick(citation.id)}
                          className="text-xs text-medical-primary hover:text-medical-secondary transition-colors mt-1 flex items-center space-x-1"
                        >
                          <span>{expandedCitation === citation.id ? 'Show less' : 'Show more'}</span>
                          {expandedCitation === citation.id ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Confidence Score */}
                  {citation.confidence && (
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-text-secondary">Relevance:</span>
                      <span className={`text-xs font-medium ${getConfidenceColor(citation.confidence)}`}>
                        {getConfidenceLabel(citation.confidence)} ({Math.round(citation.confidence * 100)}%)
                      </span>
                    </div>
                  )}
                </div>

                {/* External Link */}
                {citation.url && (
                  <button
                    onClick={() => window.open(citation.url, '_blank')}
                    className="p-1 rounded hover:bg-input-bg transition-colors flex-shrink-0 ml-2"
                    title="Open external link"
                  >
                    <ExternalLink className="w-3 h-3 text-text-secondary" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <motion.button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-xs text-medical-primary hover:text-medical-secondary transition-colors py-2 flex items-center justify-center space-x-1"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>
            {showAll 
              ? `Show less (${citations.length - maxVisible} hidden)` 
              : `Show ${citations.length - maxVisible} more citations`
            }
          </span>
          {showAll ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </motion.button>
      )}

      {/* Citation Count */}
      <div className="text-xs text-text-muted text-center pt-2 border-t border-border-secondary">
        {citations.length} reference{citations.length !== 1 ? 's' : ''} found
      </div>
    </div>
  )
}

export default CitationList

