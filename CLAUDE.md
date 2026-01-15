# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plain Blog is a static blog builder that emits zero client-side JavaScript. It uses Node.js module hooks (loaders) to transform MD/MDX/JSX content into static HTML at build time.

## Repository Structure

This is a monorepo with npm workspaces:
- `plain-blog/` - The core library/CLI tool
- `website/` - Example site using plain-blog (also serves as documentation)

## Commands

### Install dependencies
```bash
npm install
```

### Build the website
```bash
npm run build -w website
```

### Development with watch mode
```bash
npm run watch -w website
```

## Architecture

### Build Pipeline

The build process (`plain-blog/lib/index.js`) orchestrates:
1. Loads `plain.config.js` from the project root
2. Initializes custom Node.js loaders for different file types
3. Processes CSS files through PostCSS
4. Renders React components to static HTML using `react-dom/server`
5. Outputs to `dist/` directory

### Custom Node.js Loaders (`plain-blog/lib/loaders/`)

The project uses Node.js module hooks (`node:module` register API) to transform imports at load time:
- **css-loader**: Processes CSS with PostCSS, collects stylesheets
- **file-loader**: Handles static assets (images), generates hashed filenames
- **jsx-loader**: Transforms JSX using SWC
- **mdx-loader**: Transforms MDX using @mdx-js/node-loader, extracts frontmatter/summary/TOC
- **raw-loader**: Loads files as raw text

### Content Processing (`plain-blog/lib/job.jsx`)

- Recursively processes `content/` directory
- Files matching `.md`, `.mdx`, `.jsx` become pages
- Extracts frontmatter, generates summaries, builds TOC
- Renders each page using Article component wrapped in SiteContext
- Auto-generates home page listing if no root `index.mdx` exists

### Component System

Five customizable components (can be overridden in `plain.config.js`):
- `Page` - HTML document wrapper
- `Header` - Site header
- `Footer` - Site footer
- `Article` - Article page layout
- `Home` - Home page with article listing

Default templates are in `plain-blog/templates/`.

### Configuration (`plain.config.js`)

Key options:
- `baseUrl` - URL base path
- `site` - Site metadata (title, description, favicon, url)
- `locales` - For Intl.Segmenter when generating summaries
- `components` - Paths to custom component overrides
- `styles` - CSS files (prefix with `~` for node_modules)
- `scripts` - Optional client-side JS (bundled with esbuild)
- `shiki` - Code highlighting options
- `toc` - Enable table of contents

### Context System

`SiteContext` (React Context) provides components access to:
- Site metadata
- Current page frontmatter
- Stylesheets/scripts URLs
- TOC data
- Page/Header/Footer components

## Key Technical Details

- Uses SWC for JSX transformation (not Babel)
- Uses Shiki for syntax highlighting
- CSS processed with PostCSS + postcss-preset-env
- Images processed with Sharp
- No client-side hydration - pure static HTML output
