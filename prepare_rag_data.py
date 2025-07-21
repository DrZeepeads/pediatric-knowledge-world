#!/usr/bin/env python3
"""
Nelson-GPT Pediatric Knowledge RAG Data Preparation Script
Processes Nelson's Textbook of Pediatrics content for RAG pipeline with Supabase
"""

import os
import re
import csv
import hashlib
import uuid
from datetime import datetime
from pathlib import Path
import unicodedata

def clean_text(text):
    """Clean and normalize text content"""
    # Remove excessive whitespace and normalize
    text = re.sub(r'\s+', ' ', text.strip())
    # Remove special characters that might cause issues
    text = unicodedata.normalize('NFKD', text)
    # Remove non-printable characters
    text = ''.join(char for char in text if char.isprintable() or char.isspace())
    return text

def extract_chapter_sections(content, filename):
    """Extract meaningful sections from the content"""
    sections = []
    
    # Split content into paragraphs
    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
    
    current_section = ""
    current_content = []
    section_number = 1
    
    for para in paragraphs:
        # Skip very short paragraphs (likely page numbers or headers)
        if len(para) < 50:
            continue
            
        # Check if this looks like a section header
        if (para.isupper() and len(para) < 200) or \
           (re.match(r'^\d+\.\d+', para)) or \
           (para.startswith('Chapter') or para.startswith('CHAPTER')):
            
            # Save previous section if it has content
            if current_content:
                section_text = ' '.join(current_content)
                if len(section_text) > 100:  # Only include substantial content
                    sections.append({
                        'section_title': current_section or f"Section {section_number}",
                        'content': clean_text(section_text),
                        'section_number': section_number
                    })
                    section_number += 1
            
            # Start new section
            current_section = clean_text(para)
            current_content = []
        else:
            current_content.append(para)
    
    # Don't forget the last section
    if current_content:
        section_text = ' '.join(current_content)
        if len(section_text) > 100:
            sections.append({
                'section_title': current_section or f"Section {section_number}",
                'content': clean_text(section_text),
                'section_number': section_number
            })
    
    return sections

def chunk_content(content, max_chunk_size=1500, overlap=200):
    """Split content into overlapping chunks for better RAG performance"""
    words = content.split()
    chunks = []
    
    if len(words) <= max_chunk_size:
        return [content]
    
    start = 0
    chunk_num = 1
    
    while start < len(words):
        end = min(start + max_chunk_size, len(words))
        chunk = ' '.join(words[start:end])
        
        # Ensure we don't cut off mid-sentence
        if end < len(words):
            last_period = chunk.rfind('.')
            last_exclamation = chunk.rfind('!')
            last_question = chunk.rfind('?')
            
            sentence_end = max(last_period, last_exclamation, last_question)
            if sentence_end > len(chunk) * 0.8:  # If sentence end is in last 20%
                chunk = chunk[:sentence_end + 1]
                # Recalculate end position
                end = start + len(chunk.split())
        
        chunks.append({
            'content': chunk.strip(),
            'chunk_number': chunk_num,
            'word_count': len(chunk.split())
        })
        
        chunk_num += 1
        start = max(start + max_chunk_size - overlap, end - overlap)
        
        if start >= len(words):
            break
    
    return chunks

def generate_content_id(content):
    """Generate a unique ID for content based on hash"""
    return hashlib.md5(content.encode()).hexdigest()[:12]

def extract_medical_entities(content):
    """Extract medical terms, conditions, and key concepts"""
    # Common medical patterns
    medical_patterns = [
        r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:syndrome|disease|disorder|condition|deficiency))\b',
        r'\b(?:diagnosis|treatment|therapy|medication|drug|symptom|sign)\b',
        r'\b\d+(?:\.\d+)?\s*(?:mg|g|ml|L|mmHg|bpm|°C|°F)\b',
        r'\b(?:ICD|CPT|DSM)-?\d+(?:\.\d+)?\b'
    ]
    
    entities = set()
    for pattern in medical_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        entities.update(matches)
    
    return list(entities)[:20]  # Limit to top 20 entities

def process_pediatric_files():
    """Main function to process all pediatric knowledge files"""
    
    # Get all text files
    txt_files = [f for f in os.listdir('.') if f.endswith('.txt')]
    
    # Prepare CSV data
    csv_data = []
    
    print(f"🏥 Processing {len(txt_files)} pediatric knowledge files...")
    
    for filename in txt_files:
        print(f"📖 Processing: {filename}")
        
        try:
            # Try different encodings
            content = None
            for encoding in ['utf-8', 'latin-1', 'cp1252']:
                try:
                    with open(filename, 'r', encoding=encoding) as f:
                        content = f.read()
                    break
                except UnicodeDecodeError:
                    continue
            
            if content is None:
                print(f"❌ Could not read {filename} with any encoding")
                continue
            
            # Extract specialty/category from filename
            specialty = filename.replace('.txt', '').strip()
            
            # Extract sections from content
            sections = extract_chapter_sections(content, filename)
            
            if not sections:
                # If no sections found, treat entire content as one section
                sections = [{
                    'section_title': specialty,
                    'content': clean_text(content),
                    'section_number': 1
                }]
            
            print(f"   📑 Found {len(sections)} sections")
            
            for section in sections:
                # Chunk the section content
                chunks = chunk_content(section['content'])
                
                print(f"   🔗 Section '{section['section_title'][:50]}...' -> {len(chunks)} chunks")
                
                for chunk in chunks:
                    # Extract medical entities
                    medical_entities = extract_medical_entities(chunk['content'])
                    
                    # Create record for CSV
                    record = {
                        'id': str(uuid.uuid4()),
                        'content_id': generate_content_id(chunk['content']),
                        'specialty': specialty,
                        'section_title': section['section_title'],
                        'section_number': section['section_number'],
                        'chunk_number': chunk['chunk_number'],
                        'content': chunk['content'],
                        'word_count': chunk['word_count'],
                        'character_count': len(chunk['content']),
                        'medical_entities': '|'.join(medical_entities) if medical_entities else '',
                        'source_file': filename,
                        'source_reference': f"Nelson's Textbook of Pediatrics - {specialty}",
                        'content_type': 'medical_knowledge',
                        'language': 'en',
                        'created_at': datetime.now().isoformat(),
                        'updated_at': datetime.now().isoformat(),
                        'is_active': True,
                        'quality_score': min(100, max(50, chunk['word_count'] * 0.5)),  # Simple quality scoring
                        'embedding_status': 'pending',
                        'tags': f"pediatrics,{specialty.lower().replace(' ', '_')},nelson_textbook"
                    }
                    
                    csv_data.append(record)
        
        except Exception as e:
            print(f"❌ Error processing {filename}: {str(e)}")
            continue
    
    # Write to CSV
    if csv_data:
        csv_filename = 'nelson_pediatric_knowledge_rag.csv'
        
        fieldnames = [
            'id', 'content_id', 'specialty', 'section_title', 'section_number',
            'chunk_number', 'content', 'word_count', 'character_count',
            'medical_entities', 'source_file', 'source_reference', 'content_type',
            'language', 'created_at', 'updated_at', 'is_active', 'quality_score',
            'embedding_status', 'tags'
        ]
        
        with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(csv_data)
        
        print(f"\n✅ Successfully created {csv_filename}")
        print(f"📊 Total records: {len(csv_data)}")
        print(f"📚 Specialties covered: {len(set(record['specialty'] for record in csv_data))}")
        
        # Generate summary statistics
        total_words = sum(record['word_count'] for record in csv_data)
        avg_chunk_size = total_words / len(csv_data) if csv_data else 0
        
        print(f"📈 Statistics:")
        print(f"   - Total words: {total_words:,}")
        print(f"   - Average chunk size: {avg_chunk_size:.1f} words")
        print(f"   - Total characters: {sum(record['character_count'] for record in csv_data):,}")
        
        # Show sample specialties
        specialties = sorted(set(record['specialty'] for record in csv_data))
        print(f"🏥 Specialties included:")
        for specialty in specialties[:10]:  # Show first 10
            count = len([r for r in csv_data if r['specialty'] == specialty])
            print(f"   - {specialty}: {count} chunks")
        if len(specialties) > 10:
            print(f"   ... and {len(specialties) - 10} more specialties")
        
        return csv_filename
    else:
        print("❌ No data was processed successfully")
        return None

def create_supabase_schema():
    """Generate SQL schema for Supabase table"""
    
    schema_sql = """
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
"""
    
    with open('supabase_schema.sql', 'w') as f:
        f.write(schema_sql)
    
    print("📋 Created supabase_schema.sql with optimized table structure")

if __name__ == "__main__":
    print("🚀 Nelson-GPT Pediatric Knowledge RAG Data Preparation")
    print("=" * 60)
    
    # Process the files
    csv_file = process_pediatric_files()
    
    if csv_file:
        # Create Supabase schema
        create_supabase_schema()
        
        print("\n🎯 Next Steps:")
        print("1. Upload the CSV file to Supabase using the provided schema")
        print("2. Generate embeddings for the content using your preferred model")
        print("3. Update the embedding_status field after generating embeddings")
        print("4. Use the provided sample queries for RAG operations")
        print("\n📁 Files created:")
        print(f"   - {csv_file} (RAG-ready data)")
        print("   - supabase_schema.sql (Database schema)")
    else:
        print("❌ Failed to process files. Please check the error messages above.")

