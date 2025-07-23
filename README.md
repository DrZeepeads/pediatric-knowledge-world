# 🩺 NelsonGPT - Pediatric Medical Assistant

A fully responsive, modern AI chat application designed specifically for pediatric healthcare professionals. Built with React 19, TypeScript, and powered by the Nelson Textbook of Pediatrics through advanced RAG (Retrieval Augmented Generation) technology.

![NelsonGPT](https://img.shields.io/badge/NelsonGPT-v1.0.0-blue)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)
![Medical](https://img.shields.io/badge/Medical-Pediatrics-red)

## ✨ Features

### 🎯 **Medical-Focused AI Assistant**
- **Evidence-based responses** with Nelson Textbook citations
- **Pediatric specialization** across 25+ medical domains
- **Clinical decision support** for healthcare professionals
- **Drug dosage calculations** by weight and age
- **Emergency protocols** and resuscitation guidelines

### 📱 **Modern Chat Interface**
- **ChatGPT-inspired UI** with dark medical theme
- **Real-time messaging** with typing indicators
- **Markdown support** with syntax highlighting
- **Citation display** with confidence scores
- **Mobile-first responsive design**

### 🔧 **PWA Capabilities**
- **Offline functionality** with service worker caching
- **App installation** on mobile and desktop
- **Push notifications** for medical alerts
- **Background sync** for offline actions
- **Native app experience**

### 🧠 **Advanced AI Integration**
- **LangChain + LangGraph** for complex medical reasoning
- **Mistral AI** for natural language generation
- **Supabase vector search** for knowledge retrieval
- **OpenAI embeddings** for semantic understanding
- **Multi-agent orchestration** for specialized queries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Supabase account
- Mistral AI API key
- OpenAI API key (for embeddings)

### Installation

```bash
# Clone the repository
git clone https://github.com/DrZeepeads/pediatric-knowledge-world.git
cd pediatric-knowledge-world

# Install dependencies (choose one)
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
# or
bun dev
```

### Environment Setup

```env
# Required API Keys
VITE_MISTRAL_API_KEY=your_mistral_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Optional Configuration
VITE_MAX_CHAT_HISTORY=100
VITE_RAG_MAX_CHUNKS=5
VITE_ENABLE_CITATIONS=true
```

## 🏗️ Architecture

### Frontend Stack
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with medical theme
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management

### Backend Integration
- **Supabase** - PostgreSQL with pgvector for embeddings
- **Mistral AI** - Large language model for responses
- **OpenAI** - Text embeddings for semantic search
- **LangChain** - AI application framework
- **LangGraph** - Multi-agent workflow orchestration

### PWA Features
- **Vite PWA Plugin** - Service worker generation
- **Workbox** - Advanced caching strategies
- **Web App Manifest** - Native app installation
- **Background Sync** - Offline functionality

## 📊 RAG Pipeline & Knowledge Base

### Dataset Overview
- **Total Records**: 2,206 knowledge chunks
- **Total Words**: 3,244,297 words  
- **Specialties Covered**: 25 pediatric specialties
- **Average Chunk Size**: ~1,471 words
- **Source**: Nelson's Textbook of Pediatrics

### Medical Specialties Included
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

### Retrieval Process
1. **Query Processing** - User input analysis and medical entity extraction
2. **Embedding Generation** - Convert query to vector representation
3. **Semantic Search** - Find relevant knowledge chunks in Supabase
4. **Context Assembly** - Combine retrieved information with proper citations
5. **Response Generation** - Mistral AI generates evidence-based answers

## 🎨 UI/UX Design

### Dark Medical Theme
- **Background**: `#1e1e1e` (charcoal)
- **Chat Container**: `#121212` (black)
- **Medical Accent**: `#4a90e2` (blue)
- **Text Primary**: `#f2f2f2` (light)

### Responsive Design
- **Mobile-first** approach with touch-optimized interactions
- **Tablet and desktop** layouts with sidebar navigation
- **Safe area insets** for modern mobile devices
- **Accessibility** features with proper contrast ratios

## 🔧 Medical Features

### Drug Calculator
```typescript
// Calculate pediatric dosages
const dosage = calculateDrugDosage({
  drugName: 'Amoxicillin',
  patientWeight: 15, // kg
  patientAge: 2, // years
  indication: 'Otitis Media'
});
```

### Symptom Analyzer
```typescript
// Analyze symptoms for differential diagnosis
const analysis = analyzeSymptoms({
  symptoms: ['fever', 'cough', 'difficulty breathing'],
  ageGroup: 'toddler',
  duration: '3 days'
});
```

### Emergency Protocols
```typescript
// Access emergency resuscitation protocols
const protocol = getEmergencyProtocol({
  condition: 'Pediatric Cardiac Arrest',
  ageGroup: 'infant',
  weight: 8 // kg
});
```

## 📱 PWA Installation

### Mobile Installation
1. Open NelsonGPT in your mobile browser
2. Tap the "Install" prompt or browser menu
3. Add to home screen for native app experience

### Desktop Installation
1. Visit NelsonGPT in Chrome/Edge
2. Click the install icon in the address bar
3. Confirm installation for desktop app

## 🧪 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Chat/           # Chat interface components
│   ├── Layout/         # Layout and navigation
│   ├── Medical/        # Medical-specific features
│   ├── Markdown/       # Content rendering
│   └── PWA/           # PWA-related components
├── contexts/           # React contexts for state
├── hooks/             # Custom React hooks
├── services/          # API and external services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── styles/            # CSS and styling
```

### Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # ESLint code checking
npm run type-check      # TypeScript type checking
npm run format          # Prettier code formatting

# Testing
npm run test            # Run unit tests
npm run test:ui         # Run tests with UI
npm run coverage        # Generate test coverage
```

### Medical Templates
The application includes built-in medical templates for common queries:

- **Symptom Assessment** - Differential diagnosis workflows
- **Drug Dosing** - Pediatric medication calculations
- **Growth Assessment** - Development milestone evaluation
- **Emergency Protocols** - Critical care procedures

## 🗃️ Database Setup

### Supabase Schema
```sql
-- Create the main knowledge table
CREATE TABLE pediatric_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id VARCHAR(12) UNIQUE NOT NULL,
  specialty VARCHAR(255),
  section_title TEXT,
  content TEXT NOT NULL,
  medical_entities TEXT,
  source_reference TEXT,
  quality_score NUMERIC(5,2),
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_pediatric_specialty ON pediatric_knowledge(specialty);
CREATE INDEX idx_pediatric_embedding ON pediatric_knowledge USING ivfflat (embedding vector_cosine_ops);
```

### RAG Query Examples
```sql
-- Semantic search with embeddings
SELECT content, specialty, section_title, source_reference
FROM pediatric_knowledge
WHERE is_active = TRUE
ORDER BY embedding <-> $1  -- $1 is the query embedding
LIMIT 10;

-- Specialty-specific search
SELECT * FROM pediatric_knowledge
WHERE specialty = 'The Cardiovascular System'
  AND to_tsvector('english', content) @@ plainto_tsquery('english', 'heart defect')
ORDER BY quality_score DESC;
```

## 🔒 Security & Privacy

### Data Protection
- **No PHI storage** - Patient identifiers are not stored
- **Secure API communication** - All requests use HTTPS
- **Local data encryption** - Chat history encrypted in browser
- **HIPAA considerations** - Designed for educational use

### Medical Disclaimer
⚠️ **IMPORTANT**: NelsonGPT is for educational purposes only and should not replace professional medical judgment. Always verify information with current clinical guidelines and consult healthcare professionals for patient care decisions.

## 🤝 Contributing

We welcome contributions from the medical and developer communities:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines
- Follow TypeScript best practices
- Maintain medical accuracy and proper citations
- Include tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Nelson Textbook of Pediatrics** - Primary medical knowledge source
- **Mistral AI** - Language model capabilities
- **Supabase** - Backend infrastructure
- **React Team** - Frontend framework
- **Medical Community** - Feedback and validation

## 📞 Support

For support, questions, or medical content verification:
- **GitHub Issues** - Technical problems and feature requests
- **Discussions** - General questions and community support
- **Medical Review** - Content accuracy and clinical validation

---

**Built with ❤️ for pediatric healthcare professionals worldwide**

*NelsonGPT - Empowering pediatric care through AI-assisted medical knowledge*

