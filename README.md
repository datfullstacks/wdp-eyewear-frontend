# WDP Eyewear Frontend

A modern e-commerce frontend built with Next.js 16, TypeScript, Tailwind CSS, and comprehensive tooling for building a production-ready eyewear online store.

## 🚀 Tech Stack

### Core
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS** - Utility-first styling

### State Management & Data Fetching
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **Axios** - HTTP client

### Forms & Validation
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Authentication
- **NextAuth.js v5** - Authentication solution
- Support for Credentials and Google OAuth

### Internationalization
- **next-intl** - i18n support
- Languages: Vietnamese (default), English

### Testing
- **Cypress** - E2E testing
- Test coverage for authentication, products, cart, and checkout flows

### Code Quality
- **ESLint** - Linting with Next.js config
- **Prettier** - Code formatting
- **EditorConfig** - Consistent editor settings

## 📁 Project Structure

```
wdp-eyewear-frontend/
├── app/                          # Next.js App Router
│   ├── api/auth/[...nextauth]/  # NextAuth API routes
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Homepage
├── src/
│   ├── api/                     # API client & endpoints
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── auth.ts             # Auth API
│   │   └── products.ts         # Products API
│   ├── components/              # Atomic Design structure
│   │   ├── atoms/              # Basic components (Button, Input, Card)
│   │   ├── molecules/          # Composed components
│   │   ├── organisms/          # Complex components
│   │   ├── templates/          # Page layouts
│   │   └── pages/              # Page-specific components
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hooks
│   │   └── useProducts.ts      # Product query hooks
│   ├── i18n/                    # Internationalization
│   │   ├── routing.ts          # i18n routing config
│   │   └── request.ts          # Message loader
│   ├── lib/                     # Utilities
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── query-provider.tsx  # React Query provider
│   │   ├── utils.ts            # Utility functions
│   │   └── validation/         # Zod schemas
│   ├── stores/                  # Zustand stores
│   │   ├── authStore.ts        # Auth state
│   │   └── cartStore.ts        # Cart state
│   └── types/                   # TypeScript types
├── cypress/                     # E2E tests
│   ├── e2e/                    # Test specs
│   ├── fixtures/               # Test data
│   └── support/                # Test helpers
├── messages/                    # i18n messages
│   ├── en.json                 # English translations
│   └── vi.json                 # Vietnamese translations
├── public/                      # Static assets
├── .env.local.example          # Environment variables template
├── .eslintrc.json              # ESLint config
├── .prettierrc                 # Prettier config
├── .gitignore                  # Git ignore rules
├── cypress.config.ts           # Cypress configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/datfullstacks/wdp-eyewear-frontend.git
cd wdp-eyewear-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.local.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm run start
```

### Testing

```bash
# Run Cypress E2E tests (headless)
npm run test:e2e

# Open Cypress UI
npm run test:e2e:ui

# Or use Cypress commands directly
npm run cypress:open
npm run cypress:run
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code (manual)
npx prettier --write .
```

## 🎨 Atomic Design Pattern

Components are organized following Atomic Design methodology:

- **Atoms**: Smallest building blocks (Button, Input, Card)
- **Molecules**: Simple combinations (FormField, SearchBar)
- **Organisms**: Complex sections (Header, ProductList, Footer)
- **Templates**: Page layouts (MainLayout, AuthLayout)
- **Pages**: Specific page instances (HomePage, ProductPage)

## 🌍 Internationalization

- Default language: **Vietnamese** (`vi`)
- Supported languages: `vi`, `en`
- Access via locale prefix: `/vi/products`, `/en/products`
- Messages stored in `messages/` directory

## 🔐 Authentication

NextAuth.js v5 with:
- Credentials provider (email/password)
- Google OAuth provider
- JWT session strategy
- Protected routes via middleware
- Automatic token refresh

## 📊 State Management

- **Server State**: TanStack Query for API data
- **Client State**: Zustand for auth, cart, and UI state
- **Form State**: React Hook Form with Zod validation

## 🧪 Testing Strategy

Cypress E2E tests cover:
- Authentication flows (login, register, logout)
- Product browsing and search
- Shopping cart operations
- Checkout process

## 📝 Environment Variables

Required:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_URL` - Frontend URL
- `NEXTAUTH_SECRET` - NextAuth secret key

Optional:
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth

## 📦 Key Dependencies

```json
{
  "next": "^16.1.3",
  "react": "^19.2.3",
  "typescript": "5.9.3",
  "tailwindcss": "latest",
  "zustand": "latest",
  "@tanstack/react-query": "latest",
  "axios": "latest",
  "react-hook-form": "latest",
  "zod": "latest",
  "next-auth": "^5.0.0-beta.30",
  "next-intl": "latest",
  "cypress": "latest"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

ISC

## 👥 Author

WDP Team

## 🔗 Links

- Repository: https://github.com/datfullstacks/wdp-eyewear-frontend
- Issues: https://github.com/datfullstacks/wdp-eyewear-frontend/issues
