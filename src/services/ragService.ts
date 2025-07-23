import { createClient } from '@supabase/supabase-js'
import { MedicalQuery, RAGResponse, Citation } from '@/types/chat'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Mistral API configuration
const mistralApiKey = import.meta.env.VITE_MISTRAL_API_KEY
const mistralApiUrl = import.meta.env.VITE_MISTRAL_API_URL || 'https://api.mistral.ai/v1'

if (!mistralApiKey) {
  throw new Error('Missing Mistral API key. Please check your environment variables.')
}

class RAGService {
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use OpenAI for embeddings (more reliable than Mistral for embeddings)
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY
      
      if (!openaiKey) {
        throw new Error('OpenAI API key required for embeddings')
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small',
        }),
      })

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      throw error
    }
  }

  private async searchSimilarChunks(
    embedding: number[], 
    maxChunks: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('match_pediatric_knowledge', {
        query_embedding: embedding,
        match_threshold: similarityThreshold,
        match_count: maxChunks,
      })

      if (error) {
        console.error('Supabase search error:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error searching similar chunks:', error)
      throw error
    }
  }

  private async generateResponse(
    query: string, 
    context: string, 
    medicalContext?: any
  ): Promise<string> {
    try {
      const systemPrompt = `You are NelsonGPT, an expert pediatric medical assistant powered by the Nelson Textbook of Pediatrics. 

IMPORTANT GUIDELINES:
- Provide accurate, evidence-based medical information
- Always cite your sources using the format: (Nelson, Chapter X, Page Y)
- Be specific about age groups, dosages, and clinical recommendations
- Include relevant warnings, contraindications, and safety considerations
- Use clear, professional medical language appropriate for healthcare providers
- If information is insufficient, clearly state limitations
- For emergency situations, emphasize the need for immediate professional care

CONTEXT FROM NELSON TEXTBOOK:
${context}

Please answer the following pediatric medical question based on the provided context. Include proper citations and be thorough in your response.`

      const response = await fetch(`${mistralApiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mistralApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-7b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Error generating response:', error)
      throw error
    }
  }

  private formatCitations(chunks: any[]): Citation[] {
    return chunks.map((chunk, index) => ({
      id: `citation-${index}`,
      source: `Nelson Textbook of Pediatrics - ${chunk.specialty || 'General'}`,
      page: chunk.page_number,
      section: chunk.section_title,
      confidence: chunk.similarity,
      excerpt: chunk.content.substring(0, 200) + (chunk.content.length > 200 ? '...' : ''),
    }))
  }

  private extractMedicalContext(query: string, chunks: any[]): any {
    // Extract medical context from query and chunks
    const specialties = chunks.map(chunk => chunk.specialty).filter(Boolean)
    const mostCommonSpecialty = specialties.length > 0 ? specialties[0] : undefined

    // Simple urgency detection based on keywords
    const urgencyKeywords = {
      emergency: ['emergency', 'urgent', 'critical', 'resuscitation', 'shock', 'arrest'],
      high: ['severe', 'acute', 'immediate', 'rapid', 'intensive'],
      medium: ['moderate', 'concerning', 'significant'],
    }

    let urgency: 'low' | 'medium' | 'high' | 'emergency' = 'low'
    const queryLower = query.toLowerCase()

    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        urgency = level as any
        break
      }
    }

    return {
      specialty: mostCommonSpecialty,
      urgency,
      keywords: chunks.flatMap(chunk => chunk.medical_entities || []).slice(0, 10),
    }
  }

  async queryMedicalKnowledge(query: MedicalQuery): Promise<RAGResponse> {
    try {
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query.query)

      // Search for similar chunks
      const maxCitations = query.maxCitations || 5
      const similarityThreshold = 0.7
      const chunks = await this.searchSimilarChunks(embedding, maxCitations, similarityThreshold)

      if (chunks.length === 0) {
        return {
          answer: "I couldn't find specific information about your query in the Nelson Textbook of Pediatrics. Please try rephrasing your question or consult current clinical guidelines.",
          citations: [],
          confidence: 0,
          medicalContext: query.context,
        }
      }

      // Prepare context for the LLM
      const context = chunks
        .map((chunk, index) => 
          `[${index + 1}] ${chunk.specialty || 'General'} - ${chunk.section_title || 'Section'}\n${chunk.content}`
        )
        .join('\n\n')

      // Generate response using Mistral
      const answer = await this.generateResponse(query.query, context, query.context)

      // Format citations
      const citations = this.formatCitations(chunks)

      // Extract medical context
      const medicalContext = this.extractMedicalContext(query.query, chunks)

      // Calculate overall confidence based on similarity scores
      const avgSimilarity = chunks.reduce((sum, chunk) => sum + (chunk.similarity || 0), 0) / chunks.length
      const confidence = Math.min(avgSimilarity * 1.2, 1) // Boost confidence slightly

      return {
        answer,
        citations,
        confidence,
        medicalContext: { ...query.context, ...medicalContext },
        relatedTopics: query.includeRelated ? chunks.map(chunk => chunk.section_title).filter(Boolean) : undefined,
      }
    } catch (error) {
      console.error('RAG query error:', error)
      throw new Error(`Failed to process medical query: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async searchMedicalTopics(searchTerm: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('nelson_pediatric_knowledge')
        .select('id, section_title, specialty, content')
        .textSearch('content', searchTerm)
        .limit(limit)

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error searching medical topics:', error)
      throw error
    }
  }

  async getSpecialties(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('nelson_pediatric_knowledge')
        .select('specialty')
        .not('specialty', 'is', null)

      if (error) {
        throw error
      }

      const specialties = [...new Set(data.map(item => item.specialty))].sort()
      return specialties
    } catch (error) {
      console.error('Error fetching specialties:', error)
      return []
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('nelson_pediatric_knowledge')
        .select('id')
        .limit(1)

      return !error && data.length > 0
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }
}

export const ragService = new RAGService()

