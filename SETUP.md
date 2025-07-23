# 🚀 NelsonGPT Setup Guide

This guide will help you get NelsonGPT up and running with your API credentials.

## ✅ Prerequisites Completed

- ✅ **Supabase Project**: `https://jlrjhjylekjedqwfctub.supabase.co`
- ✅ **Mistral AI API Key**: Configured
- ✅ **Environment Variables**: Set up in `.env` file

## 🗄️ Database Setup

### Step 1: Set up Supabase Database

1. **Open your Supabase Dashboard**:
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Navigate to your project: `jlrjhjylekjedqwfctub`

2. **Run the Database Setup**:
   - Go to **SQL Editor** in your Supabase dashboard
   - Copy and paste the contents of `setup-database.sql`
   - Click **Run** to execute the setup script

3. **Verify Setup**:
   ```sql
   -- Check if the table was created
   SELECT COUNT(*) FROM nelson_pediatric_knowledge;
   
   -- Check available functions
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name LIKE '%pediatric%';
   ```

## 📊 Data Import (If You Have Existing Data)

If you have your pediatric knowledge data ready:

### Option 1: CSV Import via Supabase Dashboard
1. Go to **Table Editor** → `nelson_pediatric_knowledge`
2. Click **Insert** → **Import data from CSV**
3. Upload your `nelson_pediatric_knowledge_rag.csv` file

### Option 2: SQL Import
```sql
-- Example bulk insert (adjust columns as needed)
COPY nelson_pediatric_knowledge(
  content_id, specialty, section_title, content, 
  word_count, medical_entities, source_reference
) 
FROM '/path/to/your/data.csv' 
DELIMITER ',' CSV HEADER;
```

## 🔑 API Keys Setup

### Required APIs:
- ✅ **Mistral AI**: Already configured
- ✅ **Supabase**: Already configured
- ⚠️ **OpenAI** (for embeddings): You'll need to add this

### Add OpenAI API Key:
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to your `.env` file:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

## 🚀 Running the Application

### Step 1: Install Dependencies
```bash
npm install
# or
bun install
```

### Step 2: Start Development Server
```bash
npm run dev
# or
bun dev
```

### Step 3: Open in Browser
- Navigate to `http://localhost:5173`
- You should see the NelsonGPT interface

## 🧪 Testing the Setup

### Test 1: Database Connection
The app will automatically test the Supabase connection on startup.

### Test 2: Sample Query
Try asking: *"What are the signs of dehydration in infants?"*

### Test 3: Medical Features
- Test the drug calculator
- Try medical templates
- Check citation display

## 🔧 Troubleshooting

### Common Issues:

#### 1. **Database Connection Error**
```
Error: Missing Supabase configuration
```
**Solution**: Verify your `.env` file has the correct Supabase URL and keys.

#### 2. **No Search Results**
```
I couldn't find specific information...
```
**Solution**: 
- Ensure your database has data imported
- Check if embeddings are generated
- Verify the `nelson_pediatric_knowledge` table has records

#### 3. **Mistral API Error**
```
Mistral API error: 401 Unauthorized
```
**Solution**: Verify your Mistral API key is correct and has sufficient credits.

#### 4. **Missing OpenAI Key**
```
OpenAI API key required for embeddings
```
**Solution**: Add your OpenAI API key to the `.env` file.

## 📈 Performance Optimization

### For Production:
1. **Generate Embeddings**: Run embedding generation for all your content
2. **Database Indexes**: Already created by the setup script
3. **Caching**: PWA service worker handles caching automatically
4. **Rate Limiting**: Configured in environment variables

## 🏥 Medical Content Guidelines

### Data Quality:
- Ensure all content is from Nelson Textbook of Pediatrics
- Include proper citations and page references
- Maintain medical entity extraction for better search

### Safety:
- Medical disclaimer is automatically shown
- All responses include citation requirements
- Educational use warnings are built-in

## 🔒 Security Checklist

- ✅ **RLS Policies**: Configured for database security
- ✅ **API Key Protection**: Environment variables only
- ✅ **HTTPS Only**: Enforced for all API calls
- ✅ **No PHI Storage**: Designed for educational content only

## 📱 PWA Features

### Installation:
- **Mobile**: Tap install prompt or "Add to Home Screen"
- **Desktop**: Click install icon in browser address bar

### Offline Support:
- Core functionality works offline
- Chat history cached locally
- Service worker handles caching

## 🆘 Support

### If you encounter issues:

1. **Check Console**: Open browser dev tools for error messages
2. **Database Logs**: Check Supabase logs for database issues
3. **API Status**: Verify Mistral AI service status
4. **Environment**: Ensure all required variables are set

### Quick Health Check:
```bash
# Test if all services are accessible
curl -H "apikey: YOUR_SUPABASE_ANON_KEY" \
     "https://jlrjhjylekjedqwfctub.supabase.co/rest/v1/nelson_pediatric_knowledge?select=count"
```

---

## 🎉 You're Ready!

Once you complete these steps, NelsonGPT will be fully functional with:
- ✅ Real-time chat interface
- ✅ Medical knowledge search
- ✅ Citation-backed responses
- ✅ PWA capabilities
- ✅ Mobile-optimized design

**Happy coding! 🩺✨**

