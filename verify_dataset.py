#!/usr/bin/env python3
"""
Dataset Verification Script for Nelson-GPT Pediatric Knowledge
Validates the processed RAG dataset and provides quality metrics
"""

import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime

def load_and_analyze_dataset(filename='nelson_pediatric_knowledge_rag.csv'):
    """Load and analyze the RAG dataset"""
    
    print(f"📊 Analyzing dataset: {filename}")
    print("=" * 60)
    
    data = []
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    
    if not data:
        print("❌ No data found in CSV file")
        return
    
    # Basic statistics
    total_records = len(data)
    total_words = sum(int(row['word_count']) for row in data)
    total_chars = sum(int(row['character_count']) for row in data)
    
    print(f"📈 Basic Statistics:")
    print(f"   Total Records: {total_records:,}")
    print(f"   Total Words: {total_words:,}")
    print(f"   Total Characters: {total_chars:,}")
    print(f"   Average Words per Chunk: {total_words/total_records:.1f}")
    print(f"   Average Characters per Chunk: {total_chars/total_records:.1f}")
    
    # Specialty distribution
    specialty_counts = Counter(row['specialty'] for row in data)
    print(f"\n🏥 Specialty Distribution ({len(specialty_counts)} specialties):")
    for specialty, count in specialty_counts.most_common(10):
        percentage = (count / total_records) * 100
        print(f"   {specialty}: {count} chunks ({percentage:.1f}%)")
    
    if len(specialty_counts) > 10:
        print(f"   ... and {len(specialty_counts) - 10} more specialties")
    
    # Quality score analysis
    quality_scores = [float(row['quality_score']) for row in data]
    avg_quality = sum(quality_scores) / len(quality_scores)
    min_quality = min(quality_scores)
    max_quality = max(quality_scores)
    
    print(f"\n⭐ Quality Score Analysis:")
    print(f"   Average Quality: {avg_quality:.1f}")
    print(f"   Min Quality: {min_quality:.1f}")
    print(f"   Max Quality: {max_quality:.1f}")
    
    # Quality distribution
    quality_ranges = {
        'Excellent (90-100)': len([q for q in quality_scores if q >= 90]),
        'Good (80-89)': len([q for q in quality_scores if 80 <= q < 90]),
        'Fair (70-79)': len([q for q in quality_scores if 70 <= q < 80]),
        'Poor (<70)': len([q for q in quality_scores if q < 70])
    }
    
    for range_name, count in quality_ranges.items():
        percentage = (count / total_records) * 100
        print(f"   {range_name}: {count} chunks ({percentage:.1f}%)")
    
    # Word count distribution
    word_counts = [int(row['word_count']) for row in data]
    word_ranges = {
        'Very Long (>2000)': len([w for w in word_counts if w > 2000]),
        'Long (1500-2000)': len([w for w in word_counts if 1500 <= w <= 2000]),
        'Medium (1000-1499)': len([w for w in word_counts if 1000 <= w < 1500]),
        'Short (500-999)': len([w for w in word_counts if 500 <= w < 1000]),
        'Very Short (<500)': len([w for w in word_counts if w < 500])
    }
    
    print(f"\n📏 Word Count Distribution:")
    for range_name, count in word_ranges.items():
        percentage = (count / total_records) * 100
        print(f"   {range_name}: {count} chunks ({percentage:.1f}%)")
    
    # Medical entities analysis
    all_entities = []
    entity_counts = []
    
    for row in data:
        entities = row['medical_entities'].split('|') if row['medical_entities'] else []
        entities = [e.strip() for e in entities if e.strip()]
        all_entities.extend(entities)
        entity_counts.append(len(entities))
    
    if all_entities:
        unique_entities = len(set(all_entities))
        avg_entities = sum(entity_counts) / len(entity_counts)
        most_common_entities = Counter(all_entities).most_common(10)
        
        print(f"\n🔬 Medical Entities Analysis:")
        print(f"   Total Entities: {len(all_entities):,}")
        print(f"   Unique Entities: {unique_entities:,}")
        print(f"   Average Entities per Chunk: {avg_entities:.1f}")
        print(f"   Most Common Entities:")
        for entity, count in most_common_entities:
            print(f"     - {entity}: {count} occurrences")
    
    # Content type and status analysis
    content_types = Counter(row['content_type'] for row in data)
    embedding_statuses = Counter(row['embedding_status'] for row in data)
    active_status = Counter(row['is_active'] for row in data)
    
    print(f"\n📋 Status Analysis:")
    print(f"   Content Types: {dict(content_types)}")
    print(f"   Embedding Status: {dict(embedding_statuses)}")
    print(f"   Active Records: {dict(active_status)}")
    
    # Sample content analysis
    print(f"\n📝 Sample Content Preview:")
    sample_record = data[len(data)//2]  # Middle record
    print(f"   Specialty: {sample_record['specialty']}")
    print(f"   Section: {sample_record['section_title']}")
    print(f"   Word Count: {sample_record['word_count']}")
    print(f"   Content Preview: {sample_record['content'][:200]}...")
    
    # Data quality checks
    print(f"\n🔍 Data Quality Checks:")
    
    # Check for empty content
    empty_content = len([row for row in data if not row['content'].strip()])
    print(f"   Empty Content: {empty_content} records")
    
    # Check for duplicate content
    content_hashes = [row['content_id'] for row in data]
    duplicate_hashes = len(content_hashes) - len(set(content_hashes))
    print(f"   Duplicate Content: {duplicate_hashes} records")
    
    # Check for missing required fields
    required_fields = ['id', 'specialty', 'content', 'source_reference']
    missing_fields = defaultdict(int)
    
    for row in data:
        for field in required_fields:
            if not row.get(field, '').strip():
                missing_fields[field] += 1
    
    if missing_fields:
        print(f"   Missing Required Fields:")
        for field, count in missing_fields.items():
            print(f"     - {field}: {count} records")
    else:
        print(f"   ✅ All required fields present")
    
    # Estimate embedding costs
    print(f"\n💰 Embedding Cost Estimates:")
    
    # Rough token estimation (1 word ≈ 1.3 tokens)
    estimated_tokens = total_words * 1.3
    
    costs = {
        'OpenAI text-embedding-3-small': (estimated_tokens / 1000) * 0.00002,
        'OpenAI text-embedding-3-large': (estimated_tokens / 1000) * 0.00013,
        'OpenAI text-embedding-ada-002': (estimated_tokens / 1000) * 0.0001
    }
    
    for model, cost in costs.items():
        print(f"   {model}: ${cost:.2f}")
    
    # Generate summary report
    summary = {
        'dataset_info': {
            'filename': filename,
            'total_records': total_records,
            'total_words': total_words,
            'total_characters': total_chars,
            'specialties_count': len(specialty_counts),
            'analysis_date': datetime.now().isoformat()
        },
        'quality_metrics': {
            'average_quality_score': avg_quality,
            'average_words_per_chunk': total_words/total_records,
            'unique_medical_entities': unique_entities if all_entities else 0,
            'data_completeness': (total_records - sum(missing_fields.values())) / total_records * 100
        },
        'specialties': dict(specialty_counts),
        'embedding_cost_estimates': costs
    }
    
    # Save summary
    with open('dataset_analysis_report.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n📄 Detailed analysis saved to: dataset_analysis_report.json")
    print(f"✅ Dataset verification complete!")
    
    return summary

def validate_csv_structure(filename='nelson_pediatric_knowledge_rag.csv'):
    """Validate CSV structure and required columns"""
    
    required_columns = [
        'id', 'content_id', 'specialty', 'section_title', 'section_number',
        'chunk_number', 'content', 'word_count', 'character_count',
        'medical_entities', 'source_file', 'source_reference', 'content_type',
        'language', 'created_at', 'updated_at', 'is_active', 'quality_score',
        'embedding_status', 'tags'
    ]
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            columns = reader.fieldnames
            
            print(f"🔍 CSV Structure Validation:")
            print(f"   File: {filename}")
            print(f"   Columns Found: {len(columns)}")
            
            missing_columns = set(required_columns) - set(columns)
            extra_columns = set(columns) - set(required_columns)
            
            if missing_columns:
                print(f"   ❌ Missing Columns: {list(missing_columns)}")
            else:
                print(f"   ✅ All required columns present")
            
            if extra_columns:
                print(f"   ℹ️ Extra Columns: {list(extra_columns)}")
            
            # Check first few rows
            sample_rows = []
            for i, row in enumerate(reader):
                if i >= 3:  # Check first 3 rows
                    break
                sample_rows.append(row)
            
            print(f"   📊 Sample Data Validation:")
            for i, row in enumerate(sample_rows):
                print(f"     Row {i+1}: {len([v for v in row.values() if v.strip()])} non-empty fields")
            
            return True
            
    except Exception as e:
        print(f"❌ Error validating CSV: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Nelson-GPT Dataset Verification")
    print("=" * 50)
    
    # Validate CSV structure
    if validate_csv_structure():
        print()
        # Analyze dataset
        load_and_analyze_dataset()
    else:
        print("❌ CSV validation failed. Please check the file format.")

