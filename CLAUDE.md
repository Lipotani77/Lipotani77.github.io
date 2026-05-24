# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on `0.0.0.0:3000` (HMR on; set `DISABLE_HMR=true` to turn off)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built site
- `npm run lint` — type-check only (`tsc --noEmit`); there are no tests

## Architecture

Static, multi-page photography portfolio. Despite `package.json` being named `react-example` and listing React / `@google/genai` / Express as dependencies, **nothing in the shipping site uses them** — the entire frontend is vanilla JS in [script.js](script.js) and three hand-written HTML pages. Treat those deps as unused scaffolding from the AI Studio template unless the user asks to wire them in.

Vite is configured purely as a multi-page bundler. [vite.config.ts](vite.config.ts) declares three rollup inputs — `index.html`, `gallery.html`, `contact.html` — so all three become entry points in the build. Adding a new page means adding it to that `input` map.

### Data flow

All content is driven from [data.json](data.json), which has two top-level arrays:
- `categories` — each has `id`, `name`, `description`, `featured` (bool), `thumbnail` (Cloudinary URL)
- `photos` — each has `id`, `categoryId` (must match a category `id`), `url`, `alt`

[script.js](script.js) is a single shared file loaded by all three pages. It dispatches on `window.location.pathname`:
- Landing (`index.html`) → `initLandingPage`: renders featured-category cards (filter `featured: true`) + hero carousel (first 5 photos, auto-advance every 5s, with portrait/landscape detection via `img.onload` toggling `object-fit`).
- Gallery (`gallery.html`) → `initGalleryPage`: reads `?category=<id>` from the URL to filter `photos`; with no param, shows everything. Wires up a lightbox with click-to-open, arrow-key navigation, and click-outside-to-close. Lightbox state lives in module-level globals (`currentGalleryPhotos`, `currentPhotoIndex`).
- Contact (`contact.html`) → skips the `data.json` fetch entirely; the form POSTs to web3forms.com (access key embedded in the HTML).

Nav highlighting in `highlightNav` also branches off the pathname.

### Images

All images are served from Cloudinary (`res.cloudinary.com/dyavfv9l2/...`) with `f_auto,q_auto` transforms. New photos should follow that URL pattern rather than being committed to the repo.

### Deployment

Repo name (`Lipotani77.github.io`) indicates GitHub Pages hosting. The dev server is just for local iteration — GH Pages serves the static files directly, so any new page must be reachable from the repo root after build (or you must publish `dist/`).
