# Lesson Editor Design

A faithful recreation of the lesson editor page for language learners to edit lessons they've uploaded into the library.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Build

To build for production:
```bash
npm run build
```

## Project Structure

- `index.html` - Main HTML file with the lesson editor structure
- `src/styles.css` - Tailwind CSS with custom design system variables
- `tailwind.config.js` - Tailwind configuration with custom colors and utilities
- `package.json` - Project dependencies and scripts

## Notes

- The design uses Tailwind CSS utility classes
- Icons are inline SVG from Lucide
- The image path `/static/images/default-content.webp` should be updated to point to your actual image asset
- All styling matches the original HTML structure exactly
