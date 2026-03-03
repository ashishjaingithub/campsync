# CampSync Contributor Guide

Welcome to the CampSync engineering team! This document outlines our standards and workflow for maintaining this enterprise-grade scheduling engine.

## Getting Started

1.  **Install Node.js**: Ensure you are using Node.js v20+.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Development Workflow

### 1. Code Standards
- **Strict Typing**: All new features must be fully typed with TypeScript.
- **Validation**: Use Zod schemas in `src/lib/schemas.ts` for any new data structures.
- **Logging**: Use `logger.info()`, `logger.warn()`, etc. for critical operations. Avoid `console.log`.
- **Tracing**: Wrap high-computation logic in `tracer.trace()` to monitor performance.

### 2. Testing Requirements
- **Unit Tests**: Every service method must have corresponding tests in `src/lib/__tests__`.
- **E2E Tests**: Major user flows must be covered by Playwright tests in `tests/e2e`.
- **Automation**: Git hooks (Husky) will automatically run tests and linting on every commit.

### 3. CI/CD Pipeline
- Our GitHub Action (`.github/workflows/ci.yml`) runs on every push to `main` and all Pull Requests.
- The pipeline includes:
    - Dependency installation and audit.
    - ESLint verification.
    - Vitest execution.
    - Next.js build verification.
    - Playwright E2E execution.

## Reliability & Performance
- The application uses `localStorage` for session persistence.
- Computational logic is centralized in the `ScheduleService` to ensure a single source of truth for scheduling rules.
- Performance is tracked via the internal `Tracer` to prevent regressions in the constraint solver.
