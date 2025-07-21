
-- Nelson-GPT Pediatric Knowledge RAG Table Schema for Supabase
-- This table is optimized for vector similarity search and RAG operations

CREATE TABLE IF NOT EXISTS pediatric_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id VARCHAR(12) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    section_title TEXT,
    section_number INTEGER,
    chunk_number INTEGER,
    content TEXT NOT NULL,
    word_count INTEGER,
    character_count INTEGER,
    medical_entities TEXT, -- Pipe-separated medical terms
    source_file VARCHAR(255),
    source_reference TEXT,
    content_type VARCHAR(50) DEFAULT 'medical_knowledge',
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    quality_score NUMERIC(5,2),
    embedding_status VARCHAR(20) DEFAULT 'pending',
    embedding VECTOR(1536), -- For OpenAI embeddings (adjust dimension as needed)
    tags TEXT,
    
    -- Indexes for better query performance
    CONSTRAINT unique_content_chunk UNIQUE(content_id, chunk_number)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_pediatric_specialty ON pediatric_knowledge(specialty);
CREATE INDEX IF NOT EXISTS idx_pediatric_active ON pediatric_knowledge(is_active);
CREATE INDEX IF NOT EXISTS idx_pediatric_quality ON pediatric_knowledge(quality_score);
CREATE INDEX IF NOT EXISTS idx_pediatric_embedding_status ON pediatric_knowledge(embedding_status);
CREATE INDEX IF NOT EXISTS idx_pediatric_content_search ON pediatric_knowledge USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_pediatric_medical_entities ON pediatric_knowledge USING gin(to_tsvector('english', medical_entities));

-- Enable Row Level Security (RLS) if needed
-- ALTER TABLE pediatric_knowledge ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_pediatric_knowledge_updated_at 
    BEFORE UPDATE ON pediatric_knowledge 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample queries for RAG operations:

-- 1. Semantic search (after embeddings are generated)
-- SELECT content, specialty, section_title, source_reference
-- FROM pediatric_knowledge
-- WHERE is_active = TRUE
-- ORDER BY embedding <-> $1  -- $1 is the query embedding
-- LIMIT 10;

-- 2. Keyword search with ranking
-- SELECT content, specialty, section_title, 
--        ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as rank
-- FROM pediatric_knowledge
-- WHERE is_active = TRUE 
--   AND to_tsvector('english', content) @@ plainto_tsquery('english', $1)
-- ORDER BY rank DESC
-- LIMIT 10;

-- 3. Filter by specialty and search
-- SELECT * FROM pediatric_knowledge
-- WHERE specialty = 'The Cardiovascular System'
--   AND is_active = TRUE
--   AND to_tsvector('english', content) @@ plainto_tsquery('english', 'heart defect')
-- ORDER BY quality_score DESC;
