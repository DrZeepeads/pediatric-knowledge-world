# Nelson-GPT Pediatric Knowledge RAG Pipeline

🏥 **Smart Pediatric Assistant powered by Nelson's Textbook of Pediatrics**

This repository contains processed pediatric knowledge data optimized for RAG (Retrieval-Augmented Generation) pipelines, specifically designed for Nelson-GPT - an AI assistant that provides authentic medical knowledge to doctors, pediatricians, and residents with proper citations.

## 📊 Dataset Overview

- **Total Records**: 2,206 knowledge chunks
- **Total Words**: 3,244,297 words  
- **Specialties Covered**: 25 pediatric specialties
- **Average Chunk Size**: ~1,471 words
- **Source**: Nelson's Textbook of Pediatrics

## 🏥 Medical Specialties Included

1. **Allergic Disorders** (63 chunks)
2. **Behavioral & Psychiatric Disorders** (62 chunks)
3. **Bone and Joint Disorders** (126 chunks)
4. **Digestive System** (203 chunks)
5. **Diseases of the Blood** (110 chunks)
6. **Ear Disorders** (31 chunks)
7. **Fluid & Electrolyte Disorders** (40 chunks)
8. **Growth, Development & Behavior** (61 chunks)
9. **Gynecologic History & Physical Examination** (29 chunks)
10. **Human Genetics** (45 chunks)
11. **Neuromuscular Disorders** (113 chunks)
12. **Nutrition** (61 chunks)
13. **Rehabilitation Medicine** (73 chunks)
14. **Rheumatic Diseases** (67 chunks)
15. **Skin Disorders** (102 chunks)
16. **The Cardiovascular System** (127 chunks)
17. **The Endocrine System** (140 chunks)
18. **The Nervous System** (155 chunks)
19. **The Respiratory System** (156 chunks)
20. **Urology** (37 chunks)
21. **Adolescent Medicine** (68 chunks)
22. **Cancer & Benign Tumors** (66 chunks)
23. **Immunology** (73 chunks)
24. **Learning & Developmental Disorders** (66 chunks)
25. **Metabolic Disorders** (132 chunks)

## 📁 Files Structure

```
├── nelson_pediatric_knowledge_rag.csv    # Main RAG dataset
├── supabase_schema.sql                   # Database schema for Supabase
├── prepare_rag_data.py                   # Data processing script
├── generate_embeddings.py                # Embedding generation script
├── README.md                             # This file
└── [Original text files...]              # Source Nelson textbook files
```

## 🗃️ CSV Schema

The processed dataset includes the following fields optimized for RAG operations:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier for each chunk |
| `content_id` | VARCHAR(12) | Hash-based content identifier |
| `specialty` | VARCHAR(255) | Medical specialty category |
| `section_title` | TEXT | Section or chapter title |
| `section_number` | INTEGER | Section number within specialty |
| `chunk_number` | INTEGER | Chunk number within section |
| `content` | TEXT | Main content for RAG retrieval |
| `word_count` | INTEGER | Number of words in chunk |
| `character_count` | INTEGER | Number of characters in chunk |
| `medical_entities` | TEXT | Extracted medical terms (pipe-separated) |
| `source_file` | VARCHAR(255) | Original source file name |
| `source_reference` | TEXT | Citation reference |
| `content_type` | VARCHAR(50) | Type of content (medical_knowledge) |
| `language` | VARCHAR(5) | Content language (en) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `is_active` | BOOLEAN | Active status flag |
| `quality_score` | NUMERIC(5,2) | Content quality score (50-100) |
| `embedding_status` | VARCHAR(20) | Embedding generation status |
| `tags` | TEXT | Searchable tags |

## 🚀 Quick Start with Supabase

### 1. Create Database Table

```sql
-- Run the provided schema
\i supabase_schema.sql
```

### 2. Import Data

```bash
# Upload CSV to Supabase
# Option 1: Use Supabase Dashboard (recommended for smaller datasets)
# Option 2: Use psql command
\copy pediatric_knowledge(id,content_id,specialty,section_title,section_number,chunk_number,content,word_count,character_count,medical_entities,source_file,source_reference,content_type,language,created_at,updated_at,is_active,quality_score,embedding_status,tags) FROM 'nelson_pediatric_knowledge_rag.csv' DELIMITER ',' CSV HEADER;
```

### 3. Generate Embeddings

```python
# Use the provided embedding generation script
python3 generate_embeddings.py
```

## 🔍 RAG Query Examples

### Semantic Search (with embeddings)
```sql
SELECT content, specialty, section_title, source_reference
FROM pediatric_knowledge
WHERE is_active = TRUE
ORDER BY embedding <-> $1  -- $1 is the query embedding
LIMIT 10;
```

### Keyword Search with Ranking
```sql
SELECT content, specialty, section_title, 
       ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) as rank
FROM pediatric_knowledge
WHERE is_active = TRUE 
  AND to_tsvector('english', content) @@ plainto_tsquery('english', $1)
ORDER BY rank DESC
LIMIT 10;
```

### Specialty-Specific Search
```sql
SELECT * FROM pediatric_knowledge
WHERE specialty = 'The Cardiovascular System'
  AND is_active = TRUE
  AND to_tsvector('english', content) @@ plainto_tsquery('english', 'heart defect')
ORDER BY quality_score DESC;
```

## 🤖 Integration with Nelson-GPT

### RAG Pipeline Architecture

```python
# Example RAG implementation
async def get_relevant_context(query: str, specialty: str = None):
    # 1. Generate query embedding
    query_embedding = await generate_embedding(query)
    
    # 2. Semantic search
    results = await supabase.rpc('similarity_search', {
        'query_embedding': query_embedding,
        'specialty_filter': specialty,
        'limit': 5
    })
    
    # 3. Format context with citations
    context = []
    for result in results:
        context.append({
            'content': result['content'],
            'citation': f"Nelson's Textbook of Pediatrics - {result['specialty']}, {result['section_title']}",
            'confidence': result['similarity']
        })
    
    return context
```

### Citation Format

All responses should include proper citations:
```
"According to Nelson's Textbook of Pediatrics - The Cardiovascular System, Section on Congenital Heart Disease..."
```

## 🔧 Advanced Features

### Medical Entity Extraction
Each chunk includes extracted medical entities for enhanced searchability:
- Medical conditions and syndromes
- Diagnostic terms
- Treatment modalities
- Medication references
- Measurement units

### Quality Scoring
Content quality is scored based on:
- Word count (longer chunks generally more comprehensive)
- Medical entity density
- Structural completeness

### Chunking Strategy
- **Chunk Size**: ~1,500 words with 200-word overlap
- **Boundary Respect**: Chunks end at sentence boundaries
- **Context Preservation**: Overlapping chunks maintain context continuity

## 📈 Performance Optimization

### Database Indexes
- Specialty filtering: `idx_pediatric_specialty`
- Active content: `idx_pediatric_active`
- Quality ranking: `idx_pediatric_quality`
- Full-text search: `idx_pediatric_content_search`
- Medical entities: `idx_pediatric_medical_entities`

### Embedding Considerations
- **Recommended Model**: OpenAI text-embedding-3-large (3072 dimensions)
- **Alternative**: text-embedding-ada-002 (1536 dimensions)
- **Batch Processing**: Process embeddings in batches of 100-500 chunks

## 🔒 Security & Compliance

### Medical Information Handling
- All content is from published medical textbooks
- No patient-specific information included
- Suitable for educational and clinical decision support
- Always recommend consulting primary sources and clinical judgment

### Data Privacy
- No personal health information (PHI)
- Educational content only
- Proper attribution to Nelson's Textbook of Pediatrics

## 🛠️ Development & Maintenance

### Updating Content
```python
# Re-run processing script when source files change
python3 prepare_rag_data.py

# Regenerate embeddings for updated content
python3 generate_embeddings.py --update-only
```

### Monitoring
- Track embedding generation status
- Monitor query performance
- Update quality scores based on usage patterns

## 📚 Citation Requirements

When using this dataset, please ensure proper attribution:

> "Powered by Nelson's Textbook of Pediatrics - the authoritative reference for pediatric medicine, providing evidence-based clinical guidance for healthcare professionals."

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Create Pull Request

## 📄 License

This dataset is processed from Nelson's Textbook of Pediatrics for educational and clinical decision support purposes. Please ensure compliance with applicable copyright and licensing terms.

## 🆘 Support

For issues related to:
- **Data Processing**: Check `prepare_rag_data.py` logs
- **Database Setup**: Review `supabase_schema.sql`
- **Embeddings**: Use `generate_embeddings.py` with debug mode
- **RAG Integration**: See example queries above

---

**Nelson-GPT**: Empowering pediatric healthcare with AI-driven knowledge access 🏥✨

