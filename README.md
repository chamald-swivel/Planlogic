# Modern Dashboard with Microsoft AD SSO

A production-ready React application built with Tremor UI and Microsoft Azure AD authentication using MSAL.

## Features

- ✅ Microsoft AD Single Sign-On (SSO) with MSAL
- ✅ Atomic Design Pattern for scalable components
- ✅ Service layer architecture with clean separation of concerns
- ✅ Protected routes with authentication guards
- ✅ Tremor UI components for beautiful dashboards
- ✅ TypeScript for type safety
- ✅ Next.js 16 with App Router

## Project Structure

```
├── app/
│   ├── (auth)/              # Authentication routes
│   │   └── login/
│   ├── (protected)/         # Protected routes (require auth)
│   │   └── home/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root redirect page
│   └── globals.css
├── components/
│   ├── atoms/               # Atomic design: atoms (basic elements)
│   ├── molecules/           # Atomic design: molecules (combinations)
│   ├── templates/           # Atomic design: templates (page layouts)
│   └── providers/           # React providers
├── lib/
│   ├── auth/                # Authentication config
│   └── utils/               # Utility functions
├── services/                # Business logic & API calls
├── constants/               # App configuration
└── public/
```

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Microsoft Azure AD

1. Create an Azure AD app registration at [Azure Portal](https://portal.azure.com)
2. Get your:
   - Client ID (Application ID)
   - Tenant ID (Directory ID)
   - Redirect URI: `http://localhost:3000`

### 3. Environment Variables

Create a `.env.local` file with your Microsoft AD credentials:

```env
NEXT_PUBLIC_MSAL_CLIENT_ID=your-client-id
NEXT_PUBLIC_MSAL_TENANT_ID=your-tenant-id
NEXT_PUBLIC_MSAL_REDIRECT_URI=http://localhost:3000
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Authentication Flow

1. User lands on root page (`/`)
2. Root page redirects to `/login` if not authenticated
3. User clicks "Sign in with Microsoft"
4. MSAL handles the OAuth flow with Azure AD
5. On successful authentication, user is redirected to `/home`
6. Home page shows user profile and welcome message
7. User can sign out to return to login page

## Adding New Pages

### Protected Pages (Require Auth)

1. Create page in `app/(protected)/your-page/page.tsx`
2. The layout automatically checks authentication
3. If not authenticated, redirects to login

### Public Pages (No Auth Required)

1. Create page outside groupings or in `app/(auth)/`
2. No automatic auth checks applied

## Adding New Components

Follow the atomic design pattern:

- **Atoms**: Single elements (button, input, text)
- **Molecules**: Combinations of atoms (login-form, button-group)
- **Templates**: Page sections (login-template, welcome-template)

## Service Layer

Add business logic in `services/`:

```typescript
// services/my-service.ts
export class MyService {
  static async doSomething() {
    // Your logic here
  }
}

// In components:
import { MyService } from '@/services'
```

## Troubleshooting

### Login not working
- Check `NEXT_PUBLIC_MSAL_CLIENT_ID` and `NEXT_PUBLIC_MSAL_TENANT_ID`
- Verify redirect URI matches your Azure AD configuration
- Check browser console for MSAL errors

### Type errors
- Ensure `tsconfig.json` has correct path aliases
- Run `npm run build` to validate TypeScript

## Next Steps

- [ ] Add API route handlers for backend operations
- [ ] Implement user profile page
- [ ] Add role-based access control (RBAC)
- [ ] Setup logging and error tracking
- [ ] Add unit tests
- [ ] Create deployment configuration

## Technologies Used

- **React 19.2** - UI library
- **Next.js 16** - React framework
- **Tremor** - Dashboard components
- **MSAL** - Microsoft authentication
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## License

MIT
