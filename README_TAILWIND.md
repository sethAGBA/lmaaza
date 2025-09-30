Steps to enable Tailwind CSS in this Create React App project

1) Install dependencies (run in project root):

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2) The project already has `tailwind.config.js` and `postcss.config.js` created/updated. Ensure `tailwind.config.js` `content` includes `./src/**/*.{js,jsx,ts,tsx}` and `./public/index.html`.

3) `src/index.css` has Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).

4) Start the dev server:

```bash
npm start
```

Notes:
- If you used CRA version that hides PostCSS, the `postcss.config.js` should still work. If you ejected, follow Tailwind docs for CRA.
- After installing, rebuild/start dev server so Tailwind classes are processed.
