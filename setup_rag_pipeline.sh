#!/bin/bash

# Nelson-GPT RAG Pipeline Setup Script
# This script sets up the complete RAG pipeline for pediatric knowledge

echo "🏥 Nelson-GPT RAG Pipeline Setup"
echo "=================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check if required files exist
if [ ! -f "nelson_pediatric_knowledge_rag.csv" ]; then
    echo "📊 Processing pediatric knowledge files..."
    python3 prepare_rag_data.py
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to process data files"
        exit 1
    fi
else
    echo "✅ RAG dataset already exists"
fi

# Verify dataset
echo "🔍 Verifying dataset quality..."
python3 verify_dataset.py

if [ $? -ne 0 ]; then
    echo "❌ Dataset verification failed"
    exit 1
fi

# Check environment variables for embedding generation
echo ""
echo "🔧 Environment Setup Check:"

if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set"
    echo "   Set it with: export OPENAI_API_KEY='your-api-key'"
    echo "   This is required for embedding generation"
else
    echo "✅ OPENAI_API_KEY is set"
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "⚠️  Supabase credentials not set (optional)"
    echo "   Set them with:"
    echo "   export SUPABASE_URL='your-supabase-url'"
    echo "   export SUPABASE_KEY='your-supabase-key'"
    echo "   These are needed for direct database updates"
else
    echo "✅ Supabase credentials are set"
fi

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo ""
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

echo ""
echo "📋 Setup Summary:"
echo "=================="
echo "✅ Dataset processed: nelson_pediatric_knowledge_rag.csv"
echo "✅ Database schema: supabase_schema.sql"
echo "✅ Embedding script: generate_embeddings.py"
echo "✅ Verification script: verify_dataset.py"
echo "✅ Configuration: embedding_config.json"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Set up Supabase database:"
echo "   - Create new project at https://supabase.com"
echo "   - Run: psql -f supabase_schema.sql"
echo "   - Import CSV data via Supabase dashboard or psql"
echo ""
echo "2. Generate embeddings:"
echo "   - Test with: python3 generate_embeddings.py --max-records 10"
echo "   - Full run: python3 generate_embeddings.py"
echo ""
echo "3. Integrate with Nelson-GPT:"
echo "   - Use provided SQL queries for RAG operations"
echo "   - Implement semantic search with embeddings"
echo "   - Add proper citations from source_reference field"

echo ""
echo "💡 Tips:"
echo "========"
echo "- Start with small embedding batches for testing"
echo "- Monitor API costs during embedding generation"
echo "- Use quality_score field to filter low-quality chunks"
echo "- Implement proper error handling for production use"

echo ""
echo "🎉 RAG Pipeline Setup Complete!"
echo "Ready to power Nelson-GPT with authentic pediatric knowledge! 🏥✨"

