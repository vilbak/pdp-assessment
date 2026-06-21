# Technical Assessment: React Architecture & Refactoring Challenge

> Subject file: [`ProductPageClient.tsx`](./ProductPageClient.tsx) — a legacy Product
> Detail Page (PDP) that accumulated multiple responsibilities inside a single
> React component.
>
> The project doesn't have to run. APIs aren't real. Goal: identify issues, improve the file.

---

## 1. Overview

You have inherited a legacy Product Detail Page (PDP) that has evolved and
accumulated multiple responsibilities inside a single React component.

Your task is to review, analyse, and refactor the component into a solution that is:

- Scalable
- Maintainable
- Performance
- Well-structured

The goal is **not to shorten the code**, but to improve its architecture,
separation of concerns, and long-term maintainability.

We are interested in how you think about:

- Architectural problems
- React structure and composition
- State and effect management
- Performance optimisation
- Maintainability and developer experience
- Communication of technical decisions

---

## 2. What We Are Evaluating

### 1. React Fundamentals
- State management
- Hooks usage
- Effects correctness
- Memoisation
- Component composition

### 2. Architecture
- Separation of concerns
- Folder/feature structure
- Reusability
- Scalability of design

### 3. Code Quality
- Readability
- Maintainability
- Type safety
- Naming conventions

### 4. Performance
- Preventing unnecessary renders
- Dependency correctness
- Avoiding duplicate state
- Reducing redundant fetches

### 5. Communication
- Clarity of reasoning
- Trade-off awareness
- Ability to justify decisions

---

## 4. Tasks

### 4.1. Task 1 — Technical Review (Code Audit)

Before making any changes, identify **all** issues in the component.

Consider:

- React anti-patterns
- State management issues
- Performance concerns
- Architectural problems
- Accessibility issues
- Potential runtime bugs
- Missing abstractions
- Maintainability concerns

**Expected Output Format**

```
Issue 1:
Description

Issue 2:
Description
```

### 4.2. Task 2 — Refactor Architecture

Restructure the component into a scalable architecture.

You may introduce:

- Components
- Custom Hooks
- Helpers / Utilities
- Layout / Template Layer

### 4.3. Task 3 — Performance Optimisation

Identify performance issues and propose improvements.

**Unnecessary Fetching** — Example: fetching product data when quantity changes.
Explain: why is this problematic / how to fix it.

**Infinite Loop Risks** — Example:

```js
useEffect(() => {
  const next = [product, ...recentlyViewed];
  setRecentlyViewed(next);
}, [product, recentlyViewed]);
```

Explain: why is this problematic / how to fix it.

**Expensive Re-renders** — Identify: which components should be memoised? Where is
memoisation unnecessary or harmful?

### 4.4. Task 4 — Scalability Discussion

Assume the product page must evolve to support:

- Personalised recommendations
- A/B testing
- Advanced analytics tracking
- Multi-currency pricing
- Internationalisation (i18n)
- Server-side rendering (SSR)

Discuss:

- How does your architecture support these requirements?
- What would change structurally?
- What would break if left as-is?
- Where complexity should live (client vs server vs service layer)?
