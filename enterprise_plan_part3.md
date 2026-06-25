# Enterprise Business Suite — Implementation Plan
## Part 3 of 6: Frontend Design System & Component Library

---

## Overview

Every module — HRMS, Ticketing, Billing, Inventory — must look and feel identical. Users should never sense they changed applications. This is achieved through **one design system** and **one component library** that every feature module consumes.

---

## Phase 10 — Design System (Tokens)

### 10.1 File Structure

```
frontend/src/design-system/
├── tokens.css          ← CSS custom properties (single source of truth)
├── typography.css      ← font imports + scale
├── animations.css      ← reusable keyframes + transition classes
├── reset.css           ← normalize
└── index.css           ← exports all of the above
```

### 10.2 Token Definitions (`tokens.css`)

```css
:root {
  /* ── Brand Palette ─────────────────────────────── */
  --color-primary-50:  #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;

  --color-success-500: #22c55e;
  --color-warning-500: #f59e0b;
  --color-danger-500:  #ef4444;
  --color-neutral-50:  #f8fafc;
  --color-neutral-100: #f1f5f9;
  --color-neutral-200: #e2e8f0;
  --color-neutral-500: #64748b;
  --color-neutral-700: #334155;
  --color-neutral-900: #0f172a;

  /* ── Semantic Aliases ──────────────────────────── */
  --color-bg-base:       var(--color-neutral-50);
  --color-bg-surface:    #ffffff;
  --color-bg-sidebar:    var(--color-neutral-900);
  --color-text-primary:  var(--color-neutral-900);
  --color-text-secondary:var(--color-neutral-500);
  --color-border:        var(--color-neutral-200);

  /* ── Spacing Scale (4px base) ──────────────────── */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;
  --space-16: 64px;

  /* ── Border Radius ─────────────────────────────── */
  --radius-sm: 4px;  --radius-md: 8px;
  --radius-lg: 12px; --radius-xl: 16px; --radius-full: 9999px;

  /* ── Shadows ───────────────────────────────────── */
  --shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,.12);

  /* ── Typography ────────────────────────────────── */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-xs: .75rem;  --text-sm: .875rem; --text-base: 1rem;
  --text-lg: 1.125rem;--text-xl: 1.25rem; --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  /* ── Transitions ───────────────────────────────── */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 350ms ease;

  /* ── Z-index Scale ─────────────────────────────── */
  --z-sidebar: 100; --z-dropdown: 200;
  --z-modal: 300;   --z-toast: 400;
}
```

### 10.3 Dark Mode

```css
[data-theme="dark"] {
  --color-bg-base:    #0f172a;
  --color-bg-surface: #1e293b;
  --color-text-primary: #f1f5f9;
  --color-border:     #334155;
}
```

Toggle by setting `document.documentElement.dataset.theme = 'dark'`.

---

## Phase 11 — Component Library

### 11.1 Structure

```
frontend/src/components/
├── ui/
│   ├── Button/           Button.tsx + Button.css
│   ├── Input/            Input.tsx
│   ├── Select/           Select.tsx
│   ├── DatePicker/       DatePicker.tsx   ← already built
│   ├── Badge/            Badge.tsx
│   ├── Avatar/           Avatar.tsx
│   ├── Spinner/          Spinner.tsx
│   ├── Tooltip/          Tooltip.tsx
│   └── Divider/          Divider.tsx
├── layout/
│   ├── Card/             Card.tsx
│   ├── Modal/            Modal.tsx
│   ├── ConfirmDialog/    ConfirmDialog.tsx
│   ├── Drawer/           Drawer.tsx
│   └── Tabs/             Tabs.tsx
├── data/
│   ├── Table/            Table.tsx        ← sortable, selectable
│   ├── DataGrid/         DataGrid.tsx     ← virtualised for large sets
│   ├── Pagination/       Pagination.tsx
│   ├── SearchBox/        SearchBox.tsx
│   ├── FilterBar/        FilterBar.tsx
│   └── EmptyState/       EmptyState.tsx
├── feedback/
│   ├── Toast/            Toast.tsx + useToast.ts
│   ├── Alert/            Alert.tsx
│   └── ProgressBar/      ProgressBar.tsx
└── index.ts              ← barrel export
```

### 11.2 Button Component Standard

```tsx
// components/ui/Button/Button.tsx
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading, leftIcon, rightIcon,
  children, disabled, className, ...rest
}) => (
  <button
    className={clsx('btn', `btn--${variant}`, `btn--${size}`, className)}
    disabled={disabled || loading}
    {...rest}
  >
    {loading ? <Spinner size="sm" /> : leftIcon}
    {children}
    {!loading && rightIcon}
  </button>
);
```

### 11.3 Table Component Standard

```tsx
// components/data/Table/Table.tsx
interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}
```

### 11.4 Modal Component Standard

```tsx
// components/layout/Modal/Modal.tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
  children: React.ReactNode;
}
// Uses a Portal to render outside the component tree
// Locks body scroll when open
// Closes on Escape key and overlay click
```

---

## Phase 12 — Platform Layout & Navigation

### 12.1 Layout Architecture

```
PlatformLayout
├── Sidebar                   ← renders menu from /api/auth/menu
│   ├── Logo + Org Name
│   ├── NavigationTree        ← dynamic, RBAC-driven
│   └── UserCard + Logout
├── TopBar
│   ├── Breadcrumb
│   ├── GlobalSearch
│   ├── Notifications Bell    ← badge count from /api/notifications/unread-count
│   └── UserMenu
└── MainContent               ← <Outlet /> from React Router
```

### 12.2 Dynamic Sidebar (RBAC-driven)

```tsx
// platform/layout/Sidebar/Sidebar.tsx
const Sidebar = () => {
  const { data: menu } = useGetMenuQuery();   // RTK Query

  return (
    <nav className="sidebar">
      <Logo />
      {menu?.data.map(module => (
        <SidebarModule key={module.module} module={module} />
      ))}
      <UserCard />
    </nav>
  );
};
```

```tsx
// SidebarModule renders collapsible group + children
const SidebarModule = ({ module }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="sidebar-module">
      <button className="sidebar-module__header" onClick={() => setOpen(!open)}>
        <Icon name={module.icon} />
        <span>{module.label}</span>
        <ChevronIcon rotated={open} />
      </button>
      {open && (
        <div className="sidebar-module__children">
          {module.children.map(item => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => clsx('sidebar-link', { active: isActive })}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 12.3 RTK Query API Slice Standard

Every module follows this pattern, utilizing strict typing and versioned API URLs:

```ts
// features/employees/employeeApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAccessToken } from '@/platform/auth/tokenService';
import { EmployeeRequest, EmployeeResponse, PageResponse, PageParams } from './employees.types';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/hr',
    prepareHeaders: (headers) => {
      const token = getAccessToken();
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Employee'],
  endpoints: (builder) => ({
    listEmployees: builder.query<PageResponse<EmployeeResponse>, PageParams>({
      query: (params) => ({ url: '/employees', params }),
      providesTags: ['Employee'],
    }),
    getEmployee: builder.query<EmployeeResponse, number>({
      query: (id) => `/employees/${id}`,
      providesTags: (_, __, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation<EmployeeResponse, EmployeeRequest>({
      query: (body) => ({ url: '/employees', method: 'POST', body }),
      invalidatesTags: ['Employee'],
    }),
    updateEmployee: builder.mutation<EmployeeResponse, { id: number; body: EmployeeRequest }>({
      query: ({ id, body }) => ({ url: `/employees/${id}`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Employee', id }],
    }),
    deleteEmployee: builder.mutation<void, number>({
      query: (id) => ({ url: `/employees/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Employee'],
    }),
  }),
});

export const {
  useListEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} = employeeApi;
```

### 12.4 Token Refresh Interceptor (Silent Refresh)

```ts
// platform/auth/baseQueryWithReauth.ts
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface RefreshResponse {
  accessToken: string;
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extra) => {
  let result = await baseQuery(args, api, extra);
  if (result.error?.status === 401) {
    // try silent refresh
    const refreshResult = await baseQuery(
      { url: '/api/v1/auth/refresh', method: 'POST' }, api, extra
    );
    if (refreshResult.data) {
      const data = refreshResult.data as RefreshResponse;
      setAccessToken(data.accessToken);
      result = await baseQuery(args, api, extra);   // retry original
    } else {
      api.dispatch(logout());   // force login
    }
  }
  return result;
};
```

### 12.5 TypeScript Coding Standard (Strict Typing)

To ensure the safety of our enterprise frontend, developers must follow these strict typing rules:
- **No implicit or explicit `any` usage.** Add `"noImplicitAny": true` in `tsconfig.json`.
- **Predefined shared schemas.** All requests and responses must extend core TypeScript interfaces:
  ```ts
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: Record<string, string> | null;
    timestamp: string;
  }

  export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
  }

  export interface PageParams {
    page: number;
    size: number;
    search?: string;
  }
  ```

---

## Phase 13 — Screen Template

Every feature screen follows this structure:

```tsx
// features/{module}/{Domain}Screen.tsx
import React, { useState } from 'react';
import { useListEmployeesQuery } from './employeeApi';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/data/Table';
import { Card } from '@/components/layout/Card';
import { Modal } from '@/components/layout/Modal';
import { FilterBar } from '@/components/data/FilterBar';
import { Pagination } from '@/components/data/Pagination';
import { PlusIcon } from '@/components/icons';

export const EmployeeScreen: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [showCreate, setShowCreate] = useState<boolean>(false);

  const { data, isLoading } = useListEmployeesQuery({ page, size: 20, search });

  return (
    <div className="screen">
      <ScreenHeader
        title="Employee Directory"
        breadcrumb={['HRMS', 'Employees']}
        actions={
          <Button leftIcon={<PlusIcon />} onClick={() => setShowCreate(true)}>
            Add Employee
          </Button>
        }
      />

      <Card>
        <FilterBar onSearch={setSearch} />
        <Table columns={columns} data={data?.content ?? []} loading={isLoading} />
        <Pagination page={page} total={data?.totalPages ?? 0} onChange={setPage} />
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Employee">
        <EmployeeForm onSuccess={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
};
```

---

## Frontend Checklist

- [ ] Design tokens in `tokens.css` — no hardcoded hex colors in components
- [ ] Google Fonts `Inter` loaded in `index.html`
- [ ] All form inputs use `Input`, `Select`, `DatePicker` from component library
- [ ] All data views use `Table` + `Pagination` from component library
- [ ] Sidebar populated from `/api/v1/auth/menu` — never hardcoded
- [ ] Silent token refresh wired in all API slices
- [ ] No `any` types present in typescript build
- [ ] Dark mode toggle persisted in `localStorage`
- [ ] All screens have a `<title>` update via `useDocumentTitle` hook

---

## What's Next

**Part 4** → Platform Core Services: Audit, Notification, Workflow, Documents, Master Data, Config, Scheduler, Search
