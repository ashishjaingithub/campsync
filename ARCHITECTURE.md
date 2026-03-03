# CampSync Architecture Documentation

## Overview
CampSync is a privacy-first scheduling engine built with Next.js. It follows a clean architecture pattern with a clear separation between the UI (React), State Management (TanStack Query + Context), and Business Logic (Services).

## System Components

### 1. Presentation Layer (React + Tailwind CSS)
- **Functional Components**: Modular UI pieces like `CalendarGrid`, `ChildForm`, and `ChatPanel`.
- **Design System**: Atomic utility-based styling with Tailwind CSS v4.

### 2. Service Layer (Logic Engine)
- **ScheduleService**: A singleton class that handles scheduling algorithms, distance computations, and suggestion logic.
- **Tracer**: Custom utility to monitor performance of the scoring algorithms.
- **Logger**: Enterprise logging with configurable levels and exportable audit logs.

### 3. Data & Validation Layer (Zod)
- **Schemas**: Validates all incoming user data (CSV) and internal state transitions to ensure data integrity.
- **Types**: Strongly typed interfaces defining the domain models (Child, Camp, Schedule).

### 4. State Management (TanStack Query + LocalStorage)
- No external backend exists. Persistence is handled via the browser's `localStorage` for privacy.
- State is synchronized across the app using the `ScheduleContext`.

## Scheduling Algorithm (The "Stress Score")
The `ScheduleService` calculates a **Stress Score** for each camp-week-child combination:
- **Base Score**: 50.
- **Sibling Sync**: +20 boost if a sibling is in the same camp that week.
- **Interest Match**: +15 per matching interest tag.
- **Distance**: -10 penalty if the project is > 15 miles from the ZIP code.
- **Age Filter**: Hard filter that excludes camps if the child's age is outside the permitted range.

## Engineering Standards
- **Testing**: 
  - Unit: Vitest targets business logic.
  - E2E: Playwright targets critical user paths.
- **CI/CD**: GitHub Actions runs linting and test suites on every pull request.
- **Quality**: Husky pre-commit hooks ensure lint and test compliance during development.
