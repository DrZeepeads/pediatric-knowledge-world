#!/usr/bin/env node

/**
 * NelsonGPT Connection Test Script
 * Tests Supabase and Mistral AI connections
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const MISTRAL_API_KEY = process.env.VITE_MISTRAL_API_KEY

console.log('🩺 NelsonGPT Connection Test\n')

// Test Supabase Connection
async function testSupabase() {
  console.log('📊 Testing Supabase connection...')
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing Supabase credentials')
    return false
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Test basic connection
    const { data, error } = await supabase
      .from('nelson_pediatric_knowledge')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connected successfully')
    console.log(`📈 Records in database: ${data?.length || 0}`)
    
    // Test if we have actual data
    const { data: sampleData, error: sampleError } = await supabase
      .from('nelson_pediatric_knowledge')
      .select('id, specialty, section_title')
      .limit(3)
    
    if (sampleError) {
      console.log('⚠️  Could not fetch sample data:', sampleError.message)
    } else if (sampleData && sampleData.length > 0) {
      console.log('📚 Sample specialties found:')
      sampleData.forEach(item => {
        console.log(`   - ${item.specialty}: ${item.section_title}`)
      })
    } else {
      console.log('⚠️  No data found in database - you may need to import your knowledge base')
    }
    
    return true
  } catch (error) {
    console.log('❌ Supabase test failed:', error.message)
    return false
  }
}

// Test Mistral AI Connection
async function testMistral() {
  console.log('\n🤖 Testing Mistral AI connection...')
  
  if (!MISTRAL_API_KEY) {
    console.log('❌ Missing Mistral API key')
    return false
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log('❌ Mistral API connection failed:', response.statusText)
      return false
    }

    const data = await response.json()
    console.log('✅ Mistral AI connected successfully')
    console.log(`🧠 Available models: ${data.data?.length || 0}`)
    
    if (data.data && data.data.length > 0) {
      console.log('📋 Recommended models for NelsonGPT:')
      const recommendedModels = data.data.filter(model => 
        model.id.includes('mistral') || model.id.includes('7b')
      ).slice(0, 3)
      
      recommendedModels.forEach(model => {
        console.log(`   - ${model.id}`)
      })
    }
    
    return true
  } catch (error) {
    console.log('❌ Mistral test failed:', error.message)
    return false
  }
}

// Test OpenAI Connection (optional)
async function testOpenAI() {
  console.log('\n🔍 Testing OpenAI connection (for embeddings)...')
  
  const openaiKey = process.env.VITE_OPENAI_API_KEY
  
  if (!openaiKey) {
    console.log('⚠️  OpenAI API key not found - embeddings will not work')
    console.log('   Add VITE_OPENAI_API_KEY to your .env file for full functionality')
    return false
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log('❌ OpenAI API connection failed:', response.statusText)
      return false
    }

    const data = await response.json()
    console.log('✅ OpenAI connected successfully')
    
    // Check for embedding models
    const embeddingModels = data.data.filter(model => 
      model.id.includes('embedding')
    )
    
    if (embeddingModels.length > 0) {
      console.log('🎯 Embedding models available:')
      embeddingModels.slice(0, 3).forEach(model => {
        console.log(`   - ${model.id}`)
      })
    }
    
    return true
  } catch (error) {
    console.log('❌ OpenAI test failed:', error.message)
    return false
  }
}

// Run all tests
async function runTests() {
  const supabaseOk = await testSupabase()
  const mistralOk = await testMistral()
  const openaiOk = await testOpenAI()
  
  console.log('\n📋 Test Summary:')
  console.log(`   Supabase: ${supabaseOk ? '✅ Connected' : '❌ Failed'}`)
  console.log(`   Mistral AI: ${mistralOk ? '✅ Connected' : '❌ Failed'}`)
  console.log(`   OpenAI: ${openaiOk ? '✅ Connected' : '⚠️  Not configured'}`)
  
  if (supabaseOk && mistralOk) {
    console.log('\n🎉 NelsonGPT is ready to run!')
    console.log('   Start the development server with: npm run dev')
  } else {
    console.log('\n🔧 Please fix the connection issues above before running NelsonGPT')
  }
  
  if (!openaiOk) {
    console.log('\n💡 Tip: Add OpenAI API key for semantic search capabilities')
  }
}

// Run the tests
runTests().catch(console.error)

