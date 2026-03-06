# AI-Powered Content Generation

This website builder uses AI to generate customized content, images, and copy based on user prompts.

## How It Works

### 1. User Enters Prompt
User types a natural language description:
- "Digital marketing webinar on April 15th for ₹499"
- "Career coaching session, 60 minutes, ₹2999"
- "Free tech bootcamp webinar on Zoom"

### 2. AI Analysis & Routing
The system:
- Detects page type (webinar/coaching/course)
- Routes to appropriate configuration page
- Passes prompt to AI generation service

### 3. Content Generation
The AI service (`src/services/aiContentGenerator.ts`) generates:

**Text Content:**
- Hero title (compelling, concise)
- Tagline (with bullet points using •)
- Hero description (2-3 converting sentences)
- CTA button text
- Product description
- Product features list
- About section
- Testimonials (realistic, contextual)
- FAQs (relevant to topic)

**Visual Content:**
- Hero images (via media-pipeline CLI)
- Custom aspect ratio support (16:9 for hero images)
- Context-aware image prompts

### 4. Pre-fill Configuration
Config pages intelligently extract:
- **Price:** Detects ₹/$/Rs patterns
- **Duration:** Extracts minutes/hours
- **Platform:** Identifies Zoom/Google Meet/etc
- **Free/Paid:** Detects "free" keyword
- **Date/Time:** Parses date mentions

### 5. Apply to Template
Editor receives:
- AI-generated content via localStorage
- Custom hero images (base64 encoded)
- Structured product data
- Enhanced descriptions

## API Integration

### Google Gemini API
Used for content generation:
- Model: `gemini-pro`
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Returns structured JSON with all content fields
- Temperature: 0.7 for creative yet consistent output

### Media Pipeline CLI (Gemini)
Used for image generation:
- CLI: `media-pipeline/mcp-server/build/cli.bundle.js`
- Model: `gemini-3-pro-image-preview`
- Output: PNG images as base64 data URLs

## Setup

1. Create `.env` file from `.env.example`
2. Add your Google API key:
   ```
   VITE_GOOGLE_API_KEY=your_google_api_key
   ```
3. Get API key from: https://makersuite.google.com/app/apikey
4. Media pipeline is auto-configured (bundled CLI)

## Usage Flow

```
User Prompt
    ↓
AI Analysis (detect type)
    ↓
Config Page + AI Generation
    ├── Call Claude API (content)
    ├── Call Media Pipeline (images)
    └── Parse prompt (config)
    ↓
Show Loading State
    ├── "Analyzing your requirements"
    ├── "Generating professional copy"
    └── "Creating custom hero image"
    ↓
Pre-fill Configuration Form
    ↓
User Reviews/Edits
    ↓
Continue to Editor
    ↓
Apply AI Content to Template
    ├── Hero section (title, tagline, description, image)
    ├── Product details (description, features)
    ├── About section
    ├── Testimonials
    └── FAQs
```

## Files

### Core Service
- `src/services/aiContentGenerator.ts` - AI generation service

### Config Pages
- `src/pages/SessionConfig.tsx` - Coaching config + AI
- `src/pages/WebinarConfig.tsx` - Webinar config + AI

### Editor
- `src/pages/SmartPageEditor.tsx` - Consumes AI content

## Fallback Strategy

If AI generation fails:
1. Toast error notification
2. Use basic prompt parsing
3. Apply smart keyword-based defaults
4. Select fallback images from Unsplash

## Example Prompts

**Webinar:**
```
"Digital marketing webinar on growth hacking for ₹499, 90 minutes on Zoom"
```
Generates:
- Title: "Digital Marketing Masterclass"
- Tagline: "Live Learning • Interactive • Expert Speakers"
- Platform: Zoom
- Price: ₹499
- Duration: 90 min

**Coaching:**
```
"Career coaching for tech professionals, ₹2999 per session, 60 minutes"
```
Generates:
- Title: "Career Coaching for Tech Professionals"
- Tagline: "Personal Growth • One-on-One • Transformation"
- Price: ₹2999
- Duration: 60 min
- Custom description about career advancement in tech

## Future Enhancements

- [ ] Background image generation (non-blocking)
- [ ] Multiple image variants (hero, product, testimonials)
- [ ] Custom color scheme generation
- [ ] Section layout recommendations
- [ ] A/B testing copy variants
- [ ] SEO-optimized meta descriptions
