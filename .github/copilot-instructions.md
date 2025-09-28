# StudyBuddy Web - AI Coding Instructions

## Project Overview
A Next.js 15 application with role-based architecture (admin/user), using shadcn/ui components and TailwindCSS v4. Built with TypeScript and Better Auth for authentication.

## Architecture & Structure

### Multi-Role Layout System
- **Root Layout**: `src/app/layout.tsx` - Base layout with Geist fonts
- **Admin Routes**: `src/app/admin/` - Protected admin area with role verification
- **User Routes**: `src/app/(user)/` - Protected user area with auth guards
- **Public Routes**: Landing page sections at `src/app/page.tsx`

Auth layouts (`admin/layout.tsx`, `(user)/layout.tsx`) handle authentication state and redirects - always preserve this pattern when adding new protected routes.

### Component Architecture
- **Section Components**: `src/components/section/` - Landing page sections (Hero, About, Pricing, etc.)
- **UI Components**: `src/components/ui/` - shadcn/ui components with custom variants
- **Shared Components**: `src/components/` - Custom reusable components

### API & Authentication
- **API Client**: `src/lib/api.ts` - Centralized HTTP client with retry logic, timeout handling, and error management
- **Auth Client**: `src/lib/auth-client.ts` - Better Auth React client
- **Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` environment variable

## Development Workflow

### Commands
```bash
npm run dev --turbopack    # Development with Turbopack
npm run build --turbopack  # Production build with Turbopack  
npm run lint               # ESLint checking
```

### Styling System
- **TailwindCSS v4**: Latest version with CSS variables
- **shadcn/ui**: "new-york" style with neutral base color
- **Component Variants**: Use `class-variance-authority` for component styling (see `ui/button.tsx`)

## Key Patterns & Conventions

### Component Structure
```tsx
// Page components export default
export default function Page() { }

// Section components use default export with descriptive names
const Hero = () => { }
export default Hero
```

### Auth Flow
- Admin routes require both authentication AND admin role verification
- User routes require authentication only
- Use loading states during auth checks
- Redirect patterns: unauthenticated → `/login`, non-admin → user dashboard

### API Integration
```typescript
// Use the centralized API client
import api from "@/lib/api";

// Standard pattern for API calls in auth layouts
await api.get("/api/users/me");
```

### File Organization
- Use absolute imports with `@/` prefix
- Component props interfaces inline or destructured directly
- Keep section components in dedicated folder with semantic naming

## Integration Points

### External Dependencies
- **better-auth**: Handles authentication logic
- **@radix-ui**: Base for UI components
- **lucide-react**: Icon library
- **embla-carousel-react**: Carousel functionality

### Environment Configuration
- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (defaults to http://localhost:8000)

## Component Examples

When creating new UI components, follow the shadcn/ui pattern:
```tsx
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <Primitive
      className={cn(componentVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  )
)
```

For section components, maintain the semantic structure:
```tsx
const SectionName = () => {
  return (
    <section className="flex h-[80vh] p-48">
      {/* Content */}
    </section>
  )
}
```

## Critical Notes
- Always preserve auth guard patterns when modifying layouts
- Use the centralized API client for all HTTP requests
- Maintain the existing folder structure for components
- Follow the established naming conventions (PascalCase for components, kebab-case for files)