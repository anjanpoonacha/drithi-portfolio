# Agent Guidelines - Drithi Portfolio

## Project Overview

Next.js 16 portfolio application using:
- **Runtime**: Bun (not Node.js)
- **Framework**: Next.js App Router with Server Components
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **UI Library**: Radix UI + lucide-react icons

## Commands

### Development
```bash
bun run dev          # Start dev server with turbopack
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
```

### Testing
```bash
bun test                    # Run all tests
bun test <file>             # Run single test file
bun test --only <name>      # Run specific test by name
```

Test files use `bun:test`:
```ts
import { test, expect } from "bun:test";

test("description", () => {
  expect(value).toBe(expected);
});
```

## Code Style

### TypeScript

**Strict Settings Enabled:**
- `strict: true`
- `noUncheckedIndexedAccess: true` - always check array access
- `noImplicitOverride: true`
- `noFallthroughCasesInSwitch: true`

**Type Conventions:**
- Always type function parameters and returns explicitly
- Use interfaces for props (not types)
- Prefer `React.FC` or explicit prop interfaces for components
- Use `type` for unions, intersections, and utility types

```tsx
// Good
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

### Imports

**Order:**
1. React imports
2. External packages
3. Internal aliases (use `@/`)
4. CSS imports (last)

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import "./styles.css";
```

**Path Aliases:**
- `@/*` maps to project root
- `@/components` - UI components
- `@/lib` - Utilities and helpers
- `@/app` - Next.js app routes

### React Patterns

**Server Components by Default:**
- Only add `"use client"` when necessary (state, effects, event handlers)
- Keep Server Components async for data fetching
- Use Server Actions for mutations

```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component (when needed)
"use client";
export function InteractiveButton() {
  const [count, setCount] = React.useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Component Patterns:**
- Use `React.forwardRef` for components needing refs
- Set `displayName` on forwardRef components
- Export both component and variants/types

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return <button ref={ref} className={cn(baseStyles, className)} {...props} />;
  }
);
Button.displayName = "Button";
```

### Naming Conventions

- **Components**: PascalCase (`Button`, `UserProfile`)
- **Functions/Variables**: camelCase (`fetchUser`, `isActive`)
- **Files**: 
  - Components: PascalCase or kebab-case (`Button.tsx`, `user-profile.tsx`)
  - Utilities: kebab-case (`utils.ts`, `api-client.ts`)
- **CSS Variables**: kebab-case (`--purple-primary`, `--border-radius`)

### Styling

**Tailwind CSS:**
- Use utility classes directly
- Use `cn()` helper for conditional classes
- Follow mobile-first responsive design

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  isActive && "active-class",
  className
)} />
```

**Custom Theme:**
- Custom colors in CSS variables (`:root`)
- Purple/pink theme: `--purple-primary`, `--pink-accent`
- Use `@layer` for custom utilities
- Fonts: Pacifico (headings), Poppins (body)

**shadcn/ui Components:**
- Located in `components/ui/`
- Use `class-variance-authority` for variants
- Import and compose, don't modify directly

### Error Handling

**Async Functions:**
```tsx
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error("Failed to fetch:", error);
  throw error; // or handle gracefully
}
```

**React Error Boundaries:**
- Use `error.tsx` for route-level errors
- Use `loading.tsx` for suspense fallbacks

## Project Structure

```
/app                 # Next.js App Router pages
  /layout.tsx        # Root layout
  /page.tsx          # Home page
  /globals.css       # Global styles
/components
  /ui/               # shadcn/ui components
/lib
  /utils.ts          # Utility functions (cn, etc.)
/public              # Static assets
```

## Bun-Specific

- Use `bun` instead of `node` or `npm`
- `.env` loaded automatically (no dotenv needed)
- Prefer `Bun.file` over `node:fs` when possible
- Use `bun:test` for testing, not jest/vitest

## Component Development

When creating new components:
1. Use Server Components by default
2. Add TypeScript interfaces for all props
3. Use `cn()` for className composition
4. Follow shadcn/ui patterns for consistency
5. Add `"use client"` only when needed (interactivity)
6. Export component and its prop types

## Don't

- Don't use `npm` or `yarn` commands
- Don't add `"use client"` to Server Components
- Don't modify shadcn/ui components directly (compose instead)
- Don't use `React.FC` if component needs generics
- Don't bypass TypeScript strict checks
- **Don't use emojis** - Use lucide-react icons for UI, text symbols for documentation
