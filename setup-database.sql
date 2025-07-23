-- NelsonGPT Supabase Database Setup
-- Run this in your Supabase SQL Editor to set up the required tables and functions

-- Enable the pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the main pediatric knowledge table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS nelson_pediatric_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id VARCHAR(12) UNIQUE NOT NULL,
  specialty VARCHAR(255),
  section_title TEXT,
  section_number INTEGER,
  chunk_number INTEGER,
  content TEXT NOT NULL,
  word_count INTEGER,
  character_count INTEGER,
  medical_entities TEXT,
  source_file VARCHAR(255),
  source_reference TEXT,
  content_type VARCHAR(50) DEFAULT 'medical_knowledge',
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  quality_score NUMERIC(5,2) DEFAULT 85.0,
  embedding_status VARCHAR(20) DEFAULT 'pending',
  tags TEXT,
  embedding vector(1536) -- OpenAI text-embedding-3-small dimensions
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nelson_specialty ON nelson_pediatric_knowledge(specialty);
CREATE INDEX IF NOT EXISTS idx_nelson_active ON nelson_pediatric_knowledge(is_active);
CREATE INDEX IF NOT EXISTS idx_nelson_quality ON nelson_pediatric_knowledge(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_nelson_content_search ON nelson_pediatric_knowledge USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_nelson_medical_entities ON nelson_pediatric_knowledge USING gin(to_tsvector('english', medical_entities));

-- Create vector similarity index (for embeddings)
CREATE INDEX IF NOT EXISTS idx_nelson_embedding ON nelson_pediatric_knowledge 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create a function for similarity search
CREATE OR REPLACE FUNCTION match_pediatric_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  specialty_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  specialty varchar(255),
  section_title text,
  source_reference text,
  medical_entities text,
  quality_score numeric(5,2),
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nelson_pediatric_knowledge.id,
    nelson_pediatric_knowledge.content,
    nelson_pediatric_knowledge.specialty,
    nelson_pediatric_knowledge.section_title,
    nelson_pediatric_knowledge.source_reference,
    nelson_pediatric_knowledge.medical_entities,
    nelson_pediatric_knowledge.quality_score,
    (1 - (nelson_pediatric_knowledge.embedding <=> query_embedding)) as similarity
  FROM nelson_pediatric_knowledge
  WHERE 
    nelson_pediatric_knowledge.is_active = TRUE
    AND nelson_pediatric_knowledge.embedding IS NOT NULL
    AND (1 - (nelson_pediatric_knowledge.embedding <=> query_embedding)) > match_threshold
    AND (specialty_filter IS NULL OR nelson_pediatric_knowledge.specialty = specialty_filter)
  ORDER BY nelson_pediatric_knowledge.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create a function for keyword search
CREATE OR REPLACE FUNCTION search_pediatric_knowledge(
  search_query text,
  match_count int DEFAULT 10,
  specialty_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  specialty varchar(255),
  section_title text,
  source_reference text,
  medical_entities text,
  quality_score numeric(5,2),
  rank float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nelson_pediatric_knowledge.id,
    nelson_pediatric_knowledge.content,
    nelson_pediatric_knowledge.specialty,
    nelson_pediatric_knowledge.section_title,
    nelson_pediatric_knowledge.source_reference,
    nelson_pediatric_knowledge.medical_entities,
    nelson_pediatric_knowledge.quality_score,
    ts_rank(to_tsvector('english', nelson_pediatric_knowledge.content), plainto_tsquery('english', search_query)) as rank
  FROM nelson_pediatric_knowledge
  WHERE 
    nelson_pediatric_knowledge.is_active = TRUE
    AND to_tsvector('english', nelson_pediatric_knowledge.content) @@ plainto_tsquery('english', search_query)
    AND (specialty_filter IS NULL OR nelson_pediatric_knowledge.specialty = specialty_filter)
  ORDER BY rank DESC, nelson_pediatric_knowledge.quality_score DESC
  LIMIT match_count;
END;
$$;

-- Create a function to get specialties
CREATE OR REPLACE FUNCTION get_pediatric_specialties()
RETURNS TABLE (
  specialty varchar(255),
  chunk_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    nelson_pediatric_knowledge.specialty,
    COUNT(*) as chunk_count
  FROM nelson_pediatric_knowledge
  WHERE 
    nelson_pediatric_knowledge.is_active = TRUE
    AND nelson_pediatric_knowledge.specialty IS NOT NULL
  GROUP BY nelson_pediatric_knowledge.specialty
  ORDER BY chunk_count DESC;
END;
$$;

-- Create RLS (Row Level Security) policies for security
ALTER TABLE nelson_pediatric_knowledge ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated and anonymous users
CREATE POLICY "Allow read access to pediatric knowledge" ON nelson_pediatric_knowledge
  FOR SELECT USING (is_active = TRUE);

-- Allow insert/update only for service role (for data management)
CREATE POLICY "Allow service role full access" ON nelson_pediatric_knowledge
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT ON nelson_pediatric_knowledge TO anon, authenticated;
GRANT ALL ON nelson_pediatric_knowledge TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION match_pediatric_knowledge TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION search_pediatric_knowledge TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_pediatric_specialties TO anon, authenticated, service_role;

-- Create a view for easier querying
CREATE OR REPLACE VIEW pediatric_knowledge_summary AS
SELECT 
  id,
  specialty,
  section_title,
  word_count,
  quality_score,
  created_at,
  SUBSTRING(content, 1, 200) || '...' as content_preview
FROM nelson_pediatric_knowledge
WHERE is_active = TRUE
ORDER BY quality_score DESC, created_at DESC;

GRANT SELECT ON pediatric_knowledge_summary TO anon, authenticated, service_role;

-- Insert some sample data if the table is empty (for testing)
INSERT INTO nelson_pediatric_knowledge (
  content_id, 
  specialty, 
  section_title, 
  content, 
  word_count, 
  character_count,
  medical_entities,
  source_reference,
  quality_score
) 
SELECT 
  'sample001',
  'General Pediatrics',
  'Sample Medical Knowledge',
  'This is a sample entry for testing the NelsonGPT application. It contains basic pediatric medical information for demonstration purposes.',
  20,
  150,
  'pediatrics|medical|sample|testing',
  'Nelson Textbook of Pediatrics - Sample Section',
  90.0
WHERE NOT EXISTS (SELECT 1 FROM nelson_pediatric_knowledge LIMIT 1);

-- Display setup completion message
DO $$
BEGIN
  RAISE NOTICE 'NelsonGPT database setup completed successfully!';
  RAISE NOTICE 'Tables created: nelson_pediatric_knowledge';
  RAISE NOTICE 'Functions created: match_pediatric_knowledge, search_pediatric_knowledge, get_pediatric_specialties';
  RAISE NOTICE 'Indexes created for optimal performance';
  RAISE NOTICE 'RLS policies configured for security';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Import your pediatric knowledge data';
  RAISE NOTICE '2. Generate embeddings for semantic search';
  RAISE NOTICE '3. Test the application with npm run dev';
END $$;

