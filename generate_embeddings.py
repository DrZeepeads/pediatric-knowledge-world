#!/usr/bin/env python3
"""
Nelson-GPT Embedding Generation Script
Generates embeddings for pediatric knowledge chunks using OpenAI or other embedding models
"""

import os
import csv
import asyncio
import aiohttp
import json
from typing import List, Dict, Optional
import time
from datetime import datetime
import argparse

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Embedding model configurations
EMBEDDING_MODELS = {
    'openai-3-large': {
        'model': 'text-embedding-3-large',
        'dimensions': 3072,
        'max_tokens': 8191,
        'cost_per_1k': 0.00013
    },
    'openai-3-small': {
        'model': 'text-embedding-3-small',
        'dimensions': 1536,
        'max_tokens': 8191,
        'cost_per_1k': 0.00002
    },
    'openai-ada-002': {
        'model': 'text-embedding-ada-002',
        'dimensions': 1536,
        'max_tokens': 8191,
        'cost_per_1k': 0.0001
    }
}

class EmbeddingGenerator:
    def __init__(self, model_name: str = 'openai-3-small', batch_size: int = 100):
        self.model_config = EMBEDDING_MODELS.get(model_name)
        if not self.model_config:
            raise ValueError(f"Unknown model: {model_name}")
        
        self.model_name = model_name
        self.batch_size = batch_size
        self.session = None
        self.processed_count = 0
        self.total_cost = 0.0
        
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required")
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        headers = {
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': self.model_config['model'],
            'input': text[:self.model_config['max_tokens'] * 4],  # Rough token limit
            'encoding_format': 'float'
        }
        
        async with self.session.post(
            'https://api.openai.com/v1/embeddings',
            headers=headers,
            json=data
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                raise Exception(f"OpenAI API error: {response.status} - {error_text}")
            
            result = await response.json()
            embedding = result['data'][0]['embedding']
            
            # Calculate cost
            tokens_used = result['usage']['total_tokens']
            cost = (tokens_used / 1000) * self.model_config['cost_per_1k']
            self.total_cost += cost
            
            return embedding
    
    async def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of texts"""
        tasks = []
        for text in texts:
            task = self.generate_embedding(text)
            tasks.append(task)
            
            # Add small delay to avoid rate limiting
            await asyncio.sleep(0.1)
        
        embeddings = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        valid_embeddings = []
        for i, embedding in enumerate(embeddings):
            if isinstance(embedding, Exception):
                print(f"❌ Error generating embedding for text {i}: {embedding}")
                valid_embeddings.append(None)
            else:
                valid_embeddings.append(embedding)
        
        return valid_embeddings

def load_csv_data(filename: str) -> List[Dict]:
    """Load data from CSV file"""
    data = []
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data

def save_embeddings_to_csv(data: List[Dict], filename: str):
    """Save data with embeddings back to CSV"""
    if not data:
        return
    
    fieldnames = list(data[0].keys())
    if 'embedding' not in fieldnames:
        fieldnames.append('embedding')
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

async def update_supabase_embeddings(data: List[Dict]):
    """Update Supabase with generated embeddings"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("⚠️ Supabase credentials not provided, skipping database update")
        return
    
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    async with aiohttp.ClientSession() as session:
        for i in range(0, len(data), 100):  # Update in batches of 100
            batch = data[i:i+100]
            updates = []
            
            for row in batch:
                if row.get('embedding'):
                    updates.append({
                        'id': row['id'],
                        'embedding': row['embedding'],
                        'embedding_status': 'completed',
                        'updated_at': datetime.now().isoformat()
                    })
            
            if updates:
                async with session.post(
                    f"{SUPABASE_URL}/rest/v1/pediatric_knowledge",
                    headers=headers,
                    json=updates
                ) as response:
                    if response.status not in [200, 201]:
                        error_text = await response.text()
                        print(f"❌ Supabase update error: {response.status} - {error_text}")
                    else:
                        print(f"✅ Updated {len(updates)} records in Supabase")

async def generate_embeddings_for_dataset(
    csv_filename: str,
    model_name: str = 'openai-3-small',
    batch_size: int = 100,
    update_only: bool = False,
    max_records: Optional[int] = None
):
    """Main function to generate embeddings for the entire dataset"""
    
    print(f"🚀 Starting embedding generation with {model_name}")
    print(f"📊 Batch size: {batch_size}")
    
    # Load data
    print("📖 Loading CSV data...")
    data = load_csv_data(csv_filename)
    
    if max_records:
        data = data[:max_records]
        print(f"🔢 Limited to {max_records} records for testing")
    
    # Filter data if update_only
    if update_only:
        data = [row for row in data if row.get('embedding_status') != 'completed']
        print(f"🔄 Update mode: {len(data)} records need embeddings")
    
    if not data:
        print("✅ All records already have embeddings!")
        return
    
    print(f"📝 Processing {len(data)} records...")
    
    # Estimate cost
    total_words = sum(len(row['content'].split()) for row in data)
    estimated_tokens = total_words * 1.3  # Rough estimation
    estimated_cost = (estimated_tokens / 1000) * EMBEDDING_MODELS[model_name]['cost_per_1k']
    print(f"💰 Estimated cost: ${estimated_cost:.4f}")
    
    # Confirm before proceeding
    if estimated_cost > 1.0:  # If cost > $1
        confirm = input(f"⚠️ Estimated cost is ${estimated_cost:.2f}. Continue? (y/N): ")
        if confirm.lower() != 'y':
            print("❌ Cancelled by user")
            return
    
    # Generate embeddings
    async with EmbeddingGenerator(model_name, batch_size) as generator:
        start_time = time.time()
        
        for i in range(0, len(data), batch_size):
            batch = data[i:i+batch_size]
            batch_texts = [row['content'] for row in batch]
            
            print(f"🔄 Processing batch {i//batch_size + 1}/{(len(data)-1)//batch_size + 1}...")
            
            try:
                embeddings = await generator.generate_batch_embeddings(batch_texts)
                
                # Update data with embeddings
                for j, embedding in enumerate(embeddings):
                    if embedding is not None:
                        data[i+j]['embedding'] = json.dumps(embedding)
                        data[i+j]['embedding_status'] = 'completed'
                        data[i+j]['updated_at'] = datetime.now().isoformat()
                        generator.processed_count += 1
                    else:
                        data[i+j]['embedding_status'] = 'failed'
                
                # Progress update
                progress = ((i + len(batch)) / len(data)) * 100
                elapsed = time.time() - start_time
                eta = (elapsed / (i + len(batch))) * (len(data) - i - len(batch))
                
                print(f"   ✅ Progress: {progress:.1f}% | "
                      f"Processed: {generator.processed_count} | "
                      f"Cost: ${generator.total_cost:.4f} | "
                      f"ETA: {eta/60:.1f}min")
                
            except Exception as e:
                print(f"❌ Error processing batch {i//batch_size + 1}: {e}")
                continue
        
        # Final statistics
        elapsed_total = time.time() - start_time
        print(f"\n📊 Generation Complete!")
        print(f"   ✅ Successfully processed: {generator.processed_count}")
        print(f"   ❌ Failed: {len(data) - generator.processed_count}")
        print(f"   💰 Total cost: ${generator.total_cost:.4f}")
        print(f"   ⏱️ Total time: {elapsed_total/60:.1f} minutes")
        print(f"   🚀 Rate: {generator.processed_count/(elapsed_total/60):.1f} embeddings/min")
    
    # Save updated data
    output_filename = csv_filename.replace('.csv', '_with_embeddings.csv')
    print(f"💾 Saving embeddings to {output_filename}...")
    save_embeddings_to_csv(data, output_filename)
    
    # Update Supabase if configured
    if SUPABASE_URL and SUPABASE_KEY:
        print("🗄️ Updating Supabase database...")
        await update_supabase_embeddings(data)
    
    print("🎉 Embedding generation complete!")
    return output_filename

def create_embedding_config():
    """Create a configuration file for embedding generation"""
    config = {
        "embedding_models": EMBEDDING_MODELS,
        "recommended_settings": {
            "development": {
                "model": "openai-3-small",
                "batch_size": 50,
                "max_records": 100
            },
            "production": {
                "model": "openai-3-large",
                "batch_size": 100,
                "max_records": None
            }
        },
        "environment_variables": {
            "required": [
                "OPENAI_API_KEY"
            ],
            "optional": [
                "SUPABASE_URL",
                "SUPABASE_KEY"
            ]
        },
        "usage_examples": {
            "basic": "python3 generate_embeddings.py",
            "with_model": "python3 generate_embeddings.py --model openai-3-large",
            "test_mode": "python3 generate_embeddings.py --max-records 10",
            "update_only": "python3 generate_embeddings.py --update-only"
        }
    }
    
    with open('embedding_config.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    print("📋 Created embedding_config.json with configuration details")

async def main():
    parser = argparse.ArgumentParser(description='Generate embeddings for Nelson-GPT pediatric knowledge')
    parser.add_argument('--csv', default='nelson_pediatric_knowledge_rag.csv', 
                       help='CSV file to process')
    parser.add_argument('--model', default='openai-3-small', 
                       choices=list(EMBEDDING_MODELS.keys()),
                       help='Embedding model to use')
    parser.add_argument('--batch-size', type=int, default=100,
                       help='Batch size for processing')
    parser.add_argument('--update-only', action='store_true',
                       help='Only process records without embeddings')
    parser.add_argument('--max-records', type=int,
                       help='Maximum number of records to process (for testing)')
    parser.add_argument('--create-config', action='store_true',
                       help='Create configuration file and exit')
    
    args = parser.parse_args()
    
    if args.create_config:
        create_embedding_config()
        return
    
    if not os.path.exists(args.csv):
        print(f"❌ CSV file not found: {args.csv}")
        print("💡 Run prepare_rag_data.py first to create the dataset")
        return
    
    await generate_embeddings_for_dataset(
        csv_filename=args.csv,
        model_name=args.model,
        batch_size=args.batch_size,
        update_only=args.update_only,
        max_records=args.max_records
    )

if __name__ == "__main__":
    print("🧠 Nelson-GPT Embedding Generation")
    print("=" * 50)
    
    # Check environment
    if not OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY environment variable is required")
        print("💡 Set it with: export OPENAI_API_KEY='your-api-key'")
        exit(1)
    
    asyncio.run(main())

