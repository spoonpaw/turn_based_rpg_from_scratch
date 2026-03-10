# Afterlife Online - Landing Page & Single Player RPG

The marketing landing page and single-player browser RPG for [Afterlife Online](https://afterlife-online.com), a science fantasy game set in the world of Caelor.

## Tech Stack

- **Game Engine**: Phaser 3
- **Language**: TypeScript
- **Build Tool**: Snowpack
- **Hosting**: Cloudflare Pages

## Local Development

Requires Node.js 16.x (Snowpack is not compatible with newer versions).

```bash
nvm use 16
npm install
npm run dev
```

The dev server runs at `http://localhost:8000` by default.

## Building

```bash
nvm use 16
npm run build
```

Build output goes to `_build/`. The site is entirely static -- no server-side logic.

## Deployment

Hosted on **Cloudflare Pages** at `afterlife-online.com`.

To deploy manually:

```bash
nvm use 20  # wrangler needs Node 20+
npx wrangler pages deploy _build --project-name afterlife-online --branch main
```

The Express server in `server.js` is a legacy artifact from when this was hosted on Heroku. It is not used in production.

## Project Structure

- `public/` - Static assets (HTML, CSS, images) copied to build root
- `src/` - TypeScript game source, compiled to `_build/dist/`
- `_build/` - Build output (not committed)
- `server.js` - Legacy Express server (unused in production)

## Related Repos

- [Multiplayer Game (play.afterlife-online.com)](https://github.com/spoonpaw/typescript-multiplayer)
- [Forum (forum.afterlife-online.com)](https://github.com/spoonpaw/afterlife-online-forum)
- [Blog (blog.afterlife-online.com)](https://github.com/spoonpaw/afterlife-online-blog)
