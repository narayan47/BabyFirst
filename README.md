# Pip's Midnight Nursery — Track 1

A complete React + Vite frontend and Express + MongoDB backend for the haX.baby “Baby's First Website” Track 1 brief.

## Included
- Character portfolio and three showcase projects
- Scroll-story, SVG dream route, day/night mode
- Cursor sparkle trail, pointer-reactive eyes, secret Easter egg + confetti
- Web Audio synthesized lullaby/chimes with an accessible mute toggle
- Three.js 3D nursery orb/character-inspired scene (procedural, no model download required)
- Character chat (rule-based, no paid AI API)
- Live guestbook API with MongoDB persistence when configured
- Visitor counter API, graceful in-memory fallback when MongoDB is not configured
- Responsive styles and reduced-motion support

## Requirements
Node.js 20+ recommended, npm, and optionally MongoDB (local or Atlas).

## Install and run
1. Extract the ZIP and open the project folder in VS Code.
2. In a terminal, run:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`. Set `MONGODB_URI` to your MongoDB connection string if you want persistent guestbook/counter data. If omitted, the app uses in-memory data until server restart.
4. Start both frontend and backend:
   ```bash
   npm run dev
   ```
5. Open http://localhost:5173

Backend runs at http://localhost:5000. API health check: http://localhost:5000/api/health

## Production build
```bash
npm run build
npm start
```
The Express server serves `dist` if it exists. Set `CLIENT_ORIGIN` to your deployed frontend origin if hosting frontend and backend separately.

## Deploy
- Easiest single-service deploy: Render web service, build command `npm install && npm run build`, start command `npm start`, add `MONGODB_URI` and `CLIENT_ORIGIN` environment variables.
- For separate Vercel frontend + Render backend, set `VITE_API_URL=https://your-backend-domain` in Vercel and deploy the backend separately. For separate hosting, configure CORS `CLIENT_ORIGIN` to your Vercel URL.
- Never commit `.env` or expose database credentials.

## Official art assets
The project looks for the official assets at `public/assets/`:
- `pip_avatar_cloud.png`
- `pip_lullaby_box.png`
- `pip_dream_lantern.png`
- `pip_portrait.png`

Download them from the asset URLs provided in your hackathon brief and save them with these exact names. If they are absent, the website uses included original SVG fallback artwork; the rest of the app still works.

## Notes
- The Three.js scene is procedural and uses geometry/materials, not an official rigged baby model. Replace it with a properly licensed GLB model if you have one.
- The character chat is rule-based, so it works without an API key and does not claim to be an AI model.
- Lighthouse scores depend on the final assets, deployment, device, and network. Run Lighthouse on the deployed site and fix any findings; 90+ is a target, not a guarantee.

## Artwork note
The ZIP uploaded for the latest update contained the source project rather than the official asset pack. To keep the website visually complete, this version includes original SVG fallback artwork. Add the official Pip PNG assets when you have the separate asset pack; the site is wired to use those PNGs first where referenced.


## Latest interactive upgrades
- First-visit dialogue intro with animated dream-guide illustration, Next Dialogue, progress dots, and Skip Intro. It is skipped for the rest of the browser session after completion.
- Web Audio API controls use an explicit user gesture to unlock audio. The lullaby is synthesized in-browser, with a chime and clear sound status.
- `/growth_chart` is a dedicated growth chart page with interactive growth bars and star chart.
- `/bedtime-stories` is a dedicated bedtime storybook with three tales and page-turn controls.
- “Every dream starts somewhere” now has interactive story choices.
- “Rattle & Block Toys” opens a playable stacking mini-game with score, random blocks, and reset.
- Added original anime-inspired dream-guide SVG in `public/assets/dream-guide.svg`; all custom fallback artwork is in `public/assets`.
- Added animated transitions and reduced-motion preferences.

## Routes
- `/` — main portfolio
- `/growth_chart` — Pip's interactive growth chart
- `/bedtime-stories` — interactive bedtime storybook

The project uses CSS and SVG animations plus a procedural Three.js scene; it does not require remote animation files to show the core effects. Google Fonts are loaded remotely when internet is available, with local system fallback.
