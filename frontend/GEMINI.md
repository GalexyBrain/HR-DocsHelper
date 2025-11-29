# Project Overview

This is a Next.js project bootstrapped with `create-next-app`. It uses React, TypeScript, and Tailwind CSS.

The main application entry point is `app/page.tsx`, and the root layout is defined in `app/layout.tsx`.

Styling is implemented using Tailwind CSS. Global styles and Tailwind directives are in `app/globals.css`, and the PostCSS configuration is in `postcss.config.mjs`.

The project also includes a linting setup with ESLint, configured in `eslint.config.mjs`.

# Building and Running

To get the project up and running, use the following commands:

- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Start:** `npm run start`
- **Lint:** `npm run lint`

# Development Conventions

- **Linting:** The project uses ESLint with the `eslint-config-next` configuration. Run `npm run lint` to check for code quality and style issues.
- **Styling:** Styling is done with Tailwind CSS. Follow Tailwind's utility-first approach for styling components.
- **Components:** Components are defined within the `app` directory, following Next.js's App Router conventions.
