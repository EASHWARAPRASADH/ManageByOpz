# Contributing to ManageByOpz

Thank you for contributing to the **ManageByOpz** Enterprise Monorepo!

## Monorepo Workflow

Our monorepo uses **NPM Workspaces** and **Turborepo** to orchestrate builds. All shared packages are nested under the `packages/` directory and can be linked as workspace dependencies.

### Adding a Dependency to an App or Package

To add a shared package (e.g., `@managemyopz/platform-ui`) to a frontend app (e.g., `apps/hrms/`), edit its `package.json` and add:

```json
"dependencies": {
  "@managemyopz/platform-ui": "workspace:*"
}
```

Then, run `npm install` at the root of the monorepo to refresh links.

### Development Standards

*   **No Code Duplication**: Avoid copy-pasting UI elements or utilities. Move them to the appropriate `@managemyopz/*` shared package.
*   **Decoupled Icons**: Do not import `lucide-react` directly in apps; use wrapped icons from `@managemyopz/platform-icons`.
*   **Semantic Themes**: Use the semantic design tokens from `@managemyopz/platform-theme`.
*   **Type Safety**: Declare types in `@managemyopz/platform-types` and avoid using `any` wherever possible.
*   **Indentation**: Follow the 2-space indentation rule locked in `.editorconfig`.
