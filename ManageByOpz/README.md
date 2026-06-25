# ManageByOpz Enterprise Monorepo

Welcome to the **ManageByOpz** Enterprise Monorepo, a unified workspace hosting our suite of enterprise applications and core business modules.

## Architecture

This repository is organized as a unified, highly modular monorepo:

*   **`apps/`**: The frontend React applications.
    *   `apps/hrms/`: The unified HRMS platform portal.
    *   `apps/ticketing/`: The standalone Ticketing / ITSM portal.
*   **`backend/`**: The enterprise modular monolith backend services.
    *   Unified Spring Boot Java monolith running under Java 21.
*   **`packages/`**: Reusable shared npm packages.
    *   `platform-ui/`: Shared UI primitives and layouts.
    *   `platform-theme/`: Unified styling and themes.
    *   `platform-icons/`: Decoupled Lucide-React wrappers.
    *   `platform-utils/`: Helper utilities (cn, formatting).
    *   `platform-types/`: Shared TypeScript types and interfaces.
    *   `platform-api/`: Monorepo API client and Axios interceptors.
    *   `platform-auth/`: Centralized authentication and role guards.
    *   `platform-config/`: Unified environment settings and feature flags.
    *   `platform-constants/`: Global constants and route definitions.
    *   `platform-hooks/`: Custom state hooks.
    *   `platform-forms/`: Shared form validation and fields.
    *   `platform-charts/`: Dashboard charting wrappers.
    *   `platform-shell/`: Unified application layout shells.
    *   `platform-testing/`: Test renderers and mock fixtures.

## Getting Started

### Prerequisites

*   Node.js (Node 20+ locked via `.nvmrc`)
*   Java 21 (for backend compiles)
*   Maven 3.8+

### Setup

Install all monorepo dependencies and link shared workspace packages:

```bash
npm install
```

### Build & Dev

To build all apps and packages:

```bash
npm run build
```

To start development servers:

```bash
npm run dev
```
