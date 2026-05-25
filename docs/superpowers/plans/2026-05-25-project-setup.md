# VANROX Website Implementation Plan - State-of-the-Art Setup (2026)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Initialize a high-performance Next.js 15+ App Router project integrated with Supabase SSR, custom themes, and full TypeScript type safety.

**Architecture:** 
- **Next.js 15+**: App Router, Server Components, and Async Cookies.
- **Supabase SSR**: Using `@supabase/ssr` for secure session management.
- **TypeScript**: Automated type generation from the live Supabase schema.
- **Styling**: Tailwind CSS with Custom Brand Tokens.

**Tech Stack:** Next.js, Tailwind, Supabase, Lucide React, Zod (validation).

---

### Task 1: State-of-the-Art Project Initialization

**Files:**
- Create: Root project structure
- Modify: `package.json`, `tailwind.config.ts`

- [ ] **Step 1: Run standard initialization**
Run: `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`

- [ ] **Step 2: Install core 2026 dependencies**
Run: `npm install @supabase/supabase-js @supabase/ssr lucide-react clsx tailwind-merge zod`

- [ ] **Step 3: Setup Brand-Specific Tailwind Config**
Ensure the Navy (#0d1f3c) and Green (#7dc242) colors are primary tokens.

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0d1f3c', light: '#162847' },
        green: { DEFAULT: '#7dc242', dark: '#5fa030' },
      }
    }
  }
}
```

---

### Task 2: Supabase SSR & Type Safety Setup

**Files:**
- Create: `src/utils/supabase/client.ts` (Browser Client)
- Create: `src/utils/supabase/server.ts` (Server Client - Next.js 15 Async)
- Create: `src/middleware.ts` (Session Refresh)
- Create: `src/types/database.types.ts`

- [ ] **Step 1: Implement Next.js 15 Async Server Client**
```typescript
// src/utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies() // Async in Next.js 15

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Can be ignored if called from Server Component
          }
        },
      },
    }
  )
}
```

- [ ] **Step 2: Initialize Supabase CLI & Type Gen**
Run: `npx supabase init`
*Note: This enables `npx supabase gen types typescript` for Task 3.*

---

### Task 3: Database & Schema Sync

**Files:**
- Modify: `src/types/database.types.ts`

- [ ] **Step 1: Generate Types from Live Database**
Run: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts`
*Note: User must provide PROJECT_ID or run login first.*

---

### Task 4: Global Layout & Branding Re-skin

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Modern Layout Implementation**
Implement the responsive Navbar and Footer using the brand navy/green palette. Use `lucide-react` for icons (MapPin, Phone, Calendar).

---

### Task 5: Verification & Launch

- [ ] **Step 1: Run dev and check SSR hydration**
Run: `npm run dev`
Expected: Site loads, Supabase client initializes without console errors, and brand colors are correct.

- [ ] **Step 2: Commit (Manual)**
User manually commits the initialized state.
