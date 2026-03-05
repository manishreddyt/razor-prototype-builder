# Razorpay Prototype Builder

An AI-powered website builder for creating payment-enabled landing pages with integrated Razorpay checkout. Build coaching sessions, online courses, and product pages through natural language commands or visual editing.

## Overview

This project enables rapid prototyping of payment-enabled pages for Indian SME merchants, specifically targeting the **Education**, **IT/Software**, and **E-commerce** verticals. It demonstrates how no-code tools can integrate seamlessly with Razorpay's payment infrastructure.

**Use Cases:**
- **Coaching & Consultation** - Book consultation sessions with integrated scheduling and payment
- **Online Courses** - Create course enrollment pages with curriculum display and payment
- **Digital Products** - Build product landing pages with checkout flows
- **Smart Payment Pages** - AI-assisted page creation with real-time preview

## Key Features

### 🤖 AI-Powered Builder
- Natural language commands to modify pages ("Make it free", "Add weekend slots", "Charge ₹4999")
- Real-time content updates as you type
- Smart defaults based on Education Consultant templates
- No onboarding flow - jump directly into building

### 💳 Razorpay Integration
- Full checkout modal integration with test and production modes
- Support for fixed and custom amounts
- Form prefill (name, email, phone)
- Payment success/failure handling
- GST calculation and display
- Complete TypeScript type definitions

### ✏️ Inline Editing
- Click-to-edit taglines and descriptions directly on preview
- Instant visual feedback
- Keyboard shortcuts (Enter to save, Escape to cancel)
- Hover indicators for editable fields

### 🎨 Split-Panel Interface
- Left panel: AI chat + collapsible settings
- Right panel: Live preview with interactive booking
- Responsive layout with instant synchronization

## Tech Stack

- **Framework**: React 18.3 + TypeScript 5.8
- **Build Tool**: Vite 5.4
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 3.4
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query
- **Testing**: Vitest + Testing Library
- **Payment**: Razorpay Checkout

## Getting Started

### Prerequisites

- Node.js 18+ (install with [nvm](https://github.com/nvm-sh/nvm))
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd razor-prototype-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## Usage Examples

### Creating a Coaching Page

1. Navigate to `/website-builder/coaching/create`
2. Use AI commands in the chat:
   ```
   "Change title to Career Coaching Sessions"
   "Make it free"
   "Add weekend availability"
   "60 minute sessions"
   "Coach name is Dr. Sarah Johnson"
   ```
3. Or use inline editing: Click on tagline/description to edit directly
4. Or use Settings panel: Manually configure all options
5. Click **Preview** to see it in a new tab
6. Click **Publish** to create a permanent page

### Creating a Course Page

1. Navigate to `/website-builder/course/create`
2. Use similar AI commands or manual editing
3. Configure pricing, curriculum, instructor details
4. Preview and publish

### Testing Razorpay Checkout

1. Navigate to any published page (e.g., `/s/single-online-course`)
2. Fill in the checkout form
3. Click the payment button
4. Use test card details:
   - **Card Number**: 4111 1111 1111 1111
   - **CVV**: 123
   - **Expiry**: Any future date (e.g., 12/28)
5. Complete the test payment

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── CoachingLandingPreview.tsx
│   ├── CourseLandingPreview.tsx
│   ├── SmartPageCheckout.tsx
│   └── ui/              # shadcn/ui components
├── pages/               # Route pages
│   ├── CoachingCreate.tsx
│   ├── CourseCreate.tsx
│   └── SmartPageCreate.tsx
├── types/               # TypeScript definitions
│   ├── razorpay.d.ts
│   └── coaching.ts
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── data/                # Static data/templates
```

## Documentation

- **[COACHING_AI_BUILDER.md](./COACHING_AI_BUILDER.md)** - Complete implementation guide for the AI-powered coaching builder
- **[RAZORPAY_INTEGRATION.md](./RAZORPAY_INTEGRATION.md)** - Razorpay checkout integration guide with API reference

## Razorpay Configuration

### Test Mode (Current)
The project currently uses Razorpay test keys. Test payments will not process real money.

```typescript
// Test key (already configured)
key: "rzp_test_1234567890"
```

### Production Mode
Before deploying to production:

1. Replace test key with production key in all payment components
2. Set up server-side order creation API
3. Implement signature verification
4. Configure webhooks in Razorpay dashboard
5. Test with real payment methods

See [RAZORPAY_INTEGRATION.md](./RAZORPAY_INTEGRATION.md) for complete production checklist.

## Deployment

### Via Lovable (Recommended)
1. Open project in [Lovable](https://lovable.dev)
2. Click **Share → Publish**
3. Your site will be deployed with a custom domain option

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting provider
# (Vercel, Netlify, Cloudflare Pages, etc.)
```

## Testing

### Manual Test Checklist
- [ ] AI chat updates preview in real-time
- [ ] Inline editing persists changes
- [ ] Settings panel modifies preview
- [ ] Razorpay modal opens on payment
- [ ] Payment success shows confirmation
- [ ] Payment failure shows error toast
- [ ] Form validation works
- [ ] Preview opens in new tab
- [ ] Published pages have shareable URLs

### Automated Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
```

## Browser Support

- ✅ Chrome 120+
- ✅ Safari 17+
- ✅ Firefox 121+
- ✅ Edge 120+

## Accessibility

- Keyboard navigation supported (Tab, Enter, Escape)
- Focus indicators on interactive elements
- Title attributes for edit hints
- Screen reader support (basic)

## Security

- XSS protection via input sanitization
- Client-side only (no backend persistence)
- Razorpay handles all card data (PCI compliant)
- Test mode prevents real charges
- Production requires server-side signature verification

## Product Context

This prototype is part of the **No-Code Offerings POD** at Razorpay, targeting:

**Primary Verticals:**
- **Education** (18.2% MTU) - Fee collection, course enrollment, coaching bookings
- **IT/Software** (12% MTU) - SaaS subscriptions, consulting, digital products
- **E-commerce** (30.5% MTU) - Social commerce, product links, stores

**Strategic Goals (FY27):**
- Scale SME No-Code NR from ₹7.5 Cr/mo → ₹11 Cr/mo
- Launch 3 new vertical-specific offerings
- Drive 5K MTU adoption on new products
- Improve post-payment workflows (receipts, onboarding, ERP integration)

This builder demonstrates:
- AI-assisted product discovery and creation
- Consumer-grade UX for SME merchants
- Pre-payment differentiation (smart pages, customization)
- Seamless Razorpay integration

## Contributing

This is an internal prototype. For questions or feedback:
- Product: Manish Reddy (No-Code Offerings POD)
- Technical: See [CLAUDE.md](/Users/manishreddy.t/Documents/pm_vault/CLAUDE.md) for repository guidelines

## License

Internal Razorpay project. Not open source.

---

**Last Updated**: 2026-03-05
**Status**: ✅ Production Ready (Test Mode)
**Next Steps**: Add server-side order creation for production deployment
